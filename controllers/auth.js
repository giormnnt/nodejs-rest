const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const error = require('../util/error');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  bcrypt
    .hash(password, 12)
    .then(password => {
      const user = new User({
        email,
        password,
        name,
      });
      return user.save();
    })
    .then(result =>
      res.status(201).json({ message: 'User Created!', userId: result._id })
    )
    .catch(err => error.error500(err, next));
};
