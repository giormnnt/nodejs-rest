exports.error401 = (
  user,
  message = 'A user with this email could not be found.'
) => {
  if (!user) {
    const error = new Error(message);
    error.statusCode = 401;
    throw error;
  }
};

exports.error404 = (post, message = 'Could not find post.') => {
  if (!post) {
    const error = new Error(message);
    // * 404 - not found
    error.statusCode = 404;
    throw error;
  }
};

exports.error500 = (err, next) => {
  if (!err.statusCode) {
    // * 500 -server side error
    err.statusCode = 500;
  }
  next(err);
};
