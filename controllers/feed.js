const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const error = require('../util/error');

exports.getPosts = (req, res, next) => {
  const { page } = req.query || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(total => {
      totalItems = total;
      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
    })
    .then(posts =>
      res
        .status(200)
        .json({ message: 'Fetched posts successfully', posts, totalItems })
    )
    .catch(err => error.error500(err, next));

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
  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  let creator;
  const image = req.file.path.replace('\\', '/');
  const post = new Post({
    title,
    image,
    content,
    creator: req.userId,
  });

  post
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Post created successfully',
        post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch(err => error.error500(err, next));
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then(post => {
      error.error404(post);
      res.status(200).json({ message: 'Post fetched.', post });
    })
    .catch(err => error.error500(err, next));
};

exports.updatePost = (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  let { image } = req.body;
  if (req.file) {
    image = req.file.path.replace('\\', '/');
  }
  if (!image) {
    const error = new Error('No image was picked');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      error.error404(post);
      // TODO refactor
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorized');
        // * 403 Authorization issues
        error.statusCode = 403;
        throw error;
      }
      if (image !== post.image) {
        clearImage(post.image);
      }
      post.title = title;
      post.content = content;
      post.image = image;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated', post: result });
    })
    .catch(err => error.error500(err, next));
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then(post => {
      //  * checks logged in user
      error.error404(post);
      // TODO refactor
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorized');
        // * 403 Authorization issues
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.image);
      return Post.findByIdAndDelete(postId);
    })
    .then(() => {
      res.status(200).json({ message: 'Deleted Post!' });
    })
    .catch(err => error.error500(err, next));
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
