const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  )
    return cb(null, true);
  return cb(null, false);
};

const MONGODB_URI =
  'mongodb+srv://Giovanni:npsssYf5cEvNEhRb@cluster0.dxeqa.mongodb.net/blog?retryWrites=true&w=majority';

// app.use(bodyParser.urlencoded()) // * x-www-form-urlencoded <form method="POST">
app.use(express.json()); // * application/json
app.use(multer({ storage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  // * set all urls
  res.setHeader('Access-Control-Allow-Origin', '*');

  // * allows specifig origin to access content and data
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');

  // * can send requests that holds extra authorization data
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode, message } = error || 500;
  res.status(statusCode).json({ message });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
