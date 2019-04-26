const express = require('express');
const router  = express.Router();

const orderService = require('services/orderService');

const extractUserInfo = (req) => {

  //assuming req has a header with JWT token from which we extract user information:
  return {
    name: 'Roman',
    card: '***-4128'
  }
};

const extractOrderInfo = (req) => {

  //assuming request has information about what type of order, amount, price and so on:
  return {
    type : 'book',
    count: 5
  }
};

router.post('/', async (req, res) => {
  const user          = extractUserInfo(req);
  const {type, count} = extractOrderInfo(req);

  const createdOrder = await orderService.create({
    user,
    type,
    count
  });

  res.send(createdOrder);
});

router.post('/cancel/:orderId', async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderService.cancel(orderId);

  res.send(order);
});

router.get('/:orderId', async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderService.getOrder(orderId);

  res.send(order);
});

module.exports = router;