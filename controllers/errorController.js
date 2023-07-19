const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.message || 'Something went wrong , try again later ',
  };

  if (err.name === 'ValidationError') {
    customError.statusCode = 400;
    customError.status = 'fail';
    customError.message = `Invalid Data : ${Object.values(err.errors)
      .map((item) => item.message)
      .join('. ')}`;
    //console.log(err);
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate ${Object.keys(
      err.keyValue
    )} ,Try another one`;
    customError.statusCode = 400;
    customError.status = 'fail';
    //console.log(err);
  }
  if (err.code && err.code === 'PUG:UNEXPECTED_TEXT') {
    customError.message = `Page Can not be Rendered`;
    customError.statusCode = 400;
    customError.status = 'fail';
    //console.log(err);
  }

  if (err.name === 'CastError') {
    customError.message = `Invalid ${err.path} : ${err.value}`;
    customError.statusCode = 400;
    customError.status = 'fail';
    //console.log(err);
  }
  if (err.name === 'JsonWebTokenError') {
    customError.message = 'Invalid Token ,please login';
    customError.statusCode = 401;
    customError.status = 'fail';
    //console.log(err);
  }
  if (err.name === 'TokenExpiredError') {
    customError.message = 'Your token has expired, Login again';
    customError.statusCode = 401;
    customError.status = 'fail';
    //console.log(err);
  }

  if (req.originalUrl.startsWith('/api')) {
    // customError.message = err.message || 'Internal Server Error';
    // customError.statusCode = err.statusCode || 500;
    // customError.status = err.status || 'error';
    //console.log(err);
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      message: err.message,
    });
  }

  return res
    .status(customError.statusCode)
    .json({ status: customError.status, message: customError.message });
};

module.exports = errorHandlerMiddleware;
