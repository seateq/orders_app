const Order                                      = require('../model/Order');
const {CREATED, CANCELLED, DELIVERED, CONFIRMED} = require('../model/OrderStates');
const paymentService                             = require('services/paymentService');
const deliveryService                            = require('services/deliveryService');

class OrderService {

  async create(order) {
    
    const orderModel = await Order.create({
      ...order,
      state: CREATED
    });

    try {
      const {paymentId} = await paymentService.createPayment(order);

      orderModel.set('paymentId', paymentId);
      orderModel.set('state', CONFIRMED);
    } catch (e) {
      orderModel.set('state', CANCELLED);
      orderModel.set('cancelReason', e.message);

      return orderModel;
    } finally {
      await orderModel.save();
    }

    await deliveryService.deliver(order);

    orderModel.set('state', DELIVERED);

    return await orderModel.save();
  }

  async cancel(orderId) {
    const order = await Order.find({_id: orderId});

    order.set('state', CANCELLED);

    await order.save();

    return order;
  }

  getOrder(orderId) {

  }
}

module.exports = new OrderService();