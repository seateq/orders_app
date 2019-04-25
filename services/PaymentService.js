require('isomorphic-fetch');

const validUrl = require('valid-url');
const urljoin  = require('url-join');

const makeRequest = async (url, payload) => {
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      body  : JSON.stringify(payload),
    });
  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('Payment service is down. Make sure it is running and PAYMENT_SERVICE_URL environment variable has been set correctly');
    }
    console.error('Error during making request to payment service.', e);
    throw e;
  }

  if (response.status !== 200) {
    const errorMessage = `Received unexpected status code from payment service. Status Code: ${response.status}`;

    const responseText = await response.text();

    console.error(`${errorMessage}. Response text:`, responseText);

    throw new Error(errorMessage);
  }

  return await response.json();
};

class PaymentService {

  constructor() {
    const {PAYMENT_SERVICE_URL} = process.env;

    if (!PAYMENT_SERVICE_URL || !validUrl.isUri(PAYMENT_SERVICE_URL)) {
      throw new Error('PAYMENT_SERVICE_URL is not specified or has incorrect')
    }

    this.paymentsEndpoint = urljoin(PAYMENT_SERVICE_URL, 'api/payments');
  }

  async createPayment(order) {
    const jsonResponse = await makeRequest(this.paymentsEndpoint, order);

    if (jsonResponse.success !== true) {
      throw new Error(jsonResponse.error);
    }

    return jsonResponse.result;
  }
}

module.exports = PaymentService;