const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const error = require('../util/error');

exports.getPosts = async (req, res, next) => {
  const { page = 1 } = req.query;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .skip((page - 1) * perPage)
      .limit(perPage);
    // * res.json allows to return a response with json data, right headers and many more.
    res.status(200).json({ posts, totalItems });
  } catch (err) {
    error.error500(err, next);
  }
};

exports.createPost = async (req, res, next) => {
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
  const image = req.file.path.replace('\\', '/');
  const post = new Post({
    title,
    image,
    content,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    // * emit sends a message to all connected users
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: 'Post created successfully',
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    error.error500(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate('creator');
    error.error404(post);
    res.status(200).json({ post });
  } catch (err) {
    error.error500(err, next);
  }
};

exports.updatePost = async (req, res, next) => {
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
  try {
    const post = await Post.findById(postId).populate('creator');
    error.error404(post);
    error.error403(post, req, 'Not Authorized');

    if (image !== post.image) {
      clearImage(post.image);
    }
    post.title = title;
    post.content = content;
    post.image = image;

    const result = await post.save();
    io.getIO().emit('posts', {
      action: 'update',
      post: result,
    });
    res.status(200).json({ post: result });
  } catch (err) {
    error.error500(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);

    error.error404(post);
    error.error403(post, req, 'Not Authorized');
    clearImage(post.image);

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: 'Deleted Post!' });
  } catch (err) {
    error.error500(err, next);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
