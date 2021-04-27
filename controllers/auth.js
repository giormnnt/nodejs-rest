const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const error = require('../util/error');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPw,
      name,
    });
    const result = await user.save();
    res.status(201).json({ message: 'User Created!', userId: result._id });
  } catch (err) {
    error.error500(err, next);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    error.error401(user);
    const isMatch = await bcrypt.compare(password, user.password);
    error.error401(isMatch, 'Wrong Password');
    // * creates new signature and packs into new jwt(json web token)
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      'thisismysecret',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    error.error500(err, next);
  }
};
