const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { promisify } = require('util');
const Jwt = require('jsonwebtoken');

const signToken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protectRoutes = catchAsync(async function (req, res, next) {
  // get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Access Forbidden, Login first to Access our services.', 401)
    );
  }
  const payload = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);
  // check if user deleted or still in our database
  const userStillExist = await User.findById(payload.id);
  if (!userStillExist) {
    return next(new AppError('This User has been deleted', 401));
  }
  // check if user changed his pass after token has been issued
  if (userStillExist.changedPassAfter(payload.iat)) {
    return next(
      new AppError('You recently changed your password,please login again', 401)
    );
  }
  req.user = userStillExist;
  res.locals.user = userStillExist;
  next();
});

//for rendered pages only
exports.isLoggedIn = async function (req, res, next) {
  if (req.cookies.jwt) {
    try {
      const payload = await promisify(Jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // check if user deleted or still in our database
      const userStillExist = await User.findById(payload.id);
      if (!userStillExist) {
        return next();
      }
      // check if user changed his pass after token has been issued
      if (userStillExist.changedPassAfter(payload.iat)) {
        return next();
      }
      // there is logged in user
      res.locals.user = userStillExist;
      return next();
    } catch (error) {
      return next();
    }
  }

  next();
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    //secure: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  // remove pass from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please Enter a valid email and password', 400));
  }
  // add +password to select the password as a result of assigning the select method in the model to false
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.samePassword(password, user.password))) {
    return next(new AppError('Invalid Email or Password', 401));
  }
  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You dont have the permession to perform this action ',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  // gen random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send it back to users email

  // const message = `Forgot Your password? , Submit and confirm your password to ${resetURL} \n if u didnt forget your password we appologize please ignore this email.`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Password Reset Token ,ONLY VALID FOR 10 MINS',
    //   message: message,
    // });
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to your email',
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpire = undefined);
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'Failed to send reset token to your Mail, Try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  // if token hasnt expired and there is a user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  // update changedPasswordAt for current user

  // login user , send jwt.
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // check if posted pass is corret
  if (!(await user.samePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Passwords do not match', 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // if so , update password and log the user in
  createSendToken(user, 200, res);
});
