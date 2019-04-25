require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const mongoose     = require('mongoose');

const ordersRouter = require('./routes/ordersRouter');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/orders', ordersRouter);

mongoose.connect(process.env.MONGO_CONNECT_URL, {useNewUrlParser: true});

module.exports = app;