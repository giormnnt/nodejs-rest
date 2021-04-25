const error400 = post => {
  if (!post) {
    const error = new Error('Could not find post');
    // * 404 - not found
    error.statusCode = 404;
    throw error;
  }
};

const error500 = (err, next) => {
  if (!err.statusCode) {
    // * 500 -server side error
    err.statusCode = 500;
  }
  next(err);
};

exports.error400 = error400;
exports.error500 = error500;
