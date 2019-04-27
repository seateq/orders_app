const nock = require('nock');

class PaymentServiceMockHttpServer {

  mockSuccessProcessedPayment({paymentId = '321'} = {}) {
    const body = {
      success: true,
      result : {
        paymentId,
        transactionAmount: 4.5,
      }
    };

    return nock('http://mock.url')
      .post('/api/payments')
      .reply(200, body);
  }

  mockFailedPayment({errorReason = 'Not enough funds'} = {}) {
    const body = {
      success: false,
      error  : errorReason
    };

    return nock('http://mock.url')
      .post('/api/payments')
      .reply(200, body);
  }

  cleanAll() {
    nock.cleanAll();
  }
}

module.exports = new PaymentServiceMockHttpServer();
