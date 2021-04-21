const { validationResult } = require('express-validator');

const Post = require('../models/post');

const err500 = (err, next) => {
  if (!err.statusCode) {
    // * 500 -server side error
    err.statusCode = 500;
  }
  next(err);
};

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({ message: 'Fetched posts successfully', posts });
    })
    .catch(err => err500(err, next));
  // * res.json allows to return a response with json data, right headers and many more.
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // * 422 validation failed status code
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
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
      res.status(201).json({
        message: 'Post created successfully',
        post: result,
      });
    })
    .catch(err => err500(err, next));
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        // * 404 - not found
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post });
    })
    .catch(err => err500(err, next));
};
