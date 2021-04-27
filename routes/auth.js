const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async value => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Email address already exists!');
        }
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().notEmpty(),
  ],
  authController.signup
);

router.post('/login', authController.login);

module.exports = router;
