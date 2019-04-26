require('dotenv').config();
require('rootpath')();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const mongoose     = require('mongoose');

const ordersRouter = require('./routes/ordersRouter');
const homeRouter   = require('./routes/homeRouter');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/orders', ordersRouter);
app.use('/', homeRouter);

mongoose.connect(process.env.MONGO_CONNECT_URL, {useNewUrlParser: true});

module.exports = app;