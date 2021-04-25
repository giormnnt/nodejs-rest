const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  console.log();
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      error.error401(user);
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isMatch => {
      error.error401(isMatch, 'Wrong Password');
      // * creates new signature and packs into new jwt(json web token)
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        'thisismysecret',
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch(err => error.error500(err, next));
};
