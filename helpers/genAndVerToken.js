// const { promisify } = require('util');
// const catchAsync = require('../utils/catchAsync');
// const Jwt = require('jsonwebtoken');
// const AppError = require('../utils/appError');
// const User = require('../models/userModel');

// exports.signToken = (id) => {
//   return Jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

// exports.protectRoutes = catchAsync(async function (req, res, next) {
//   // get token
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError('Access Forbidden, Login first to Access our services.', 401)
//     );
//   }
//   const payload = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);
//   // check if user deleted or still in our database
//   const userStillExist = await User.findById(payload.id);
//   if (!userStillExist) {
//     return next(new AppError('This User has been deleted', 401));
//   }
//   // check if user changed his pass after token has been issued
//   if (userStillExist.changedPassAfter(payload.iat)) {
//     return next(
//       new AppError('You recently changed your password,please login again', 401)
//     );
//   }
//   req.user = userStillExist;
//   res.locals.user = userStillExist;
//   next();
// });
