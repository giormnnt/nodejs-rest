const jwt = require('jsonwebtoken');

const error = require('../util/error');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) error.error401(authHeader, 'Not authenticated.');
  const token = authHeader.replace('Bearer ', '');
  let decodedToken;
  try {
    // * decodes and verifies token
    decodedToken = jwt.verify(token, 'thisismysecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  error.error401(decodedToken, 'Not authenticated.');
  req.userId = decodedToken.userId;
  next();
};
