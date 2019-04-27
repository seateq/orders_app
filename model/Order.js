const {Schema, model} = require('mongoose');

const {CANCELLED, CONFIRMED, CREATED, DELIVERED} = require('./OrderStates');

const OrderSchema = new Schema({
  state       : {
    type: String,
    enum: [CANCELLED, CONFIRMED, CREATED, DELIVERED],
  },
  user        : Object,
  type        : String,
  count       : Number,
  cancelReason: String,
  paymentId   : String
});

const OrderModel = model('orders', OrderSchema);

module.exports = OrderModel;