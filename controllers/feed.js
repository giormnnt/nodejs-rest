exports.getPosts = (req, res, next) => {
  // * res.json allows to return a response with json data, right headers and many more.
  res
    .status(200)
    .json({ posts: [{ title: 'First Post', content: 'Hello World!' }] });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;
  // * creates post in db
  // * 200 vs 201; 200 - only success; 201 - resource created successfully.
  res.status(201).json({
    message: 'Post created successful!',
    post: { id: new Date().toISOString(), title, content },
  });
};
