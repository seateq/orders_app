const Order                           = require('../model/Order');
const {CREATED, CANCELLED, DELIVERED} = require('../model/OrderStates');
const paymentsService                 = require('./paymentsService');

const deliver = (order) => {
  return new Promise(resolve => {
    setTimeout(resolve, 3000);
  })
};

class OrdersService {

  async create(order) {
    order.state = CREATED;

    const orderModel = new Order(order);

    try {
      const {paymentId} = await paymentsService.createPayment(orderModel.toJSON());
      orderModel.set('paymentId', paymentId);
    } catch (e) {
      orderModel.set('state', CANCELLED);
      orderModel.set('cancelReason', e.message);
    }

    await orderModel.save();

    await deliver(order);

    orderModel.set('state', DELIVERED);

    return await orderModel.save();
  }

  cancel(orderId) {

  }

  getOrder(orderId) {

  }
}

module.exports = new OrdersService();