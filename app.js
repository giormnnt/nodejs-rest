const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()) // * x-www-form-urlencoded <form method="POST">
app.use(express.json()); // * application/json

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

app.listen(8080);
