const { validationResult } = require('express-validator');

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
  // * creates post in db
  // * 200 vs 201; 200 - only success; 201 - resource created successfully.
  res.status(201).json({
    message: 'Post created successful!',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Gio' },
      createdAt: new Date(),
    },
  });
};
