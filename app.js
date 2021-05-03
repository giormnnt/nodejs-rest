const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

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

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.dxeqa.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

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
app.use('/auth', authRoutes);

app.use(helmet());
app.use(compression());

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const server = app.listen(process.env.PORT || 8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  } catch (err) {
    console.log(err);
  }
})();
