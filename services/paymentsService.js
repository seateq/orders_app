const fetch    = require('node-fetch');
const validUrl = require('valid-url');

const {PAYMENT_SERVICE_URL} = process.env;

if (!PAYMENT_SERVICE_URL || !validUrl.isUri(PAYMENT_SERVICE_URL)) {
  throw new Error('PAYMENT_SERVICE_URL is not specified or has incorrect')
}

class PaymentsService {
  async createPayment(order) {

    const response = await fetch(PAYMENT_SERVICE_URL, {
      method: 'POST',
      body  : JSON.stringify(order),
    });

    const jsonMessage = await response.then(r => r.json());

    if (response.status === 200) {
      return jsonMessage;
    }

    if (jsonMessage.error) {
      throw new Error(jsonMessage.error);
    }

    throw new Error('Unexpected error');
  }
}

module.exports = new PaymentsService();