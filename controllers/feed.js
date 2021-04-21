const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  // * res.json allows to return a response with json data, right headers and many more.
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First Post',
        content: 'Hello World!',
        imageUrl: 'images/20.jpg',
        creator: {
          name: 'Gio',
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // * 422 validation failed status code
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect',
      errors: errors.array(),
    });
  }
  const { title, content } = req.body;
  const post = new Post({
    title,
    image: 'images/20.jpg',
    content,
    creator: { name: 'Gio' },
  });

  post
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Post created successfully',
        post: result,
      });
    })
    .catch(err => {
      console.log(err);
    });
};
