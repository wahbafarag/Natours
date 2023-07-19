const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'Enter a valid Email'],
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'admin', 'lead-guide'],
        message: 'Roles must be either User , Guide , Admin ,Lead-guide',
      },
      default: 'user',
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      min: [8, 'Password must be atleast 8 characters'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please Confirm Your password'],
      validate: {
        // works only with save or create
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same ',
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  }
  // { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // run only if pass was modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // delete confirm pass
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this -> current query
  // dont show users that are not active or deactivated there accounts
  this.find({ isActive: { $ne: false } });
  // if we used isActive : true , this will not show anything cause someother users dont have this propery as we created it in the beggining so use $ne:
  next();
});

userSchema.methods.samePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassAfter = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JwtTimeStamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // hash reset token
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
