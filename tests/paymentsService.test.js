const {beforeEach, describe} = require('mocha');

process.env.PAYMENT_SERVICE_URL = 'http://mock.url';

const paymentService = require('../services/paymentService');
const fm             = require('fetch-mock');
const chai           = require('chai');
const {expect}       = chai;
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Payment Service', () => {

  const paymentsEndpointURL = 'http://mock.url/api/payments';

  beforeEach(() => {
    fm.reset();
  });

  describe('Create a new payment', () => {

    it('When payment service is down, then receive an exception', async () => {

      const expectedError = new Error('Connection error');
      fm.mock(paymentsEndpointURL, {throws: expectedError});

      const promiseResult = paymentService.createPayment({});

      return expect(promiseResult).to.be.rejectedWith(expectedError);
    });

    it('When payment service declines payment, then receive an exception with reason message', async () => {

      const expectedErrorMessage = 'Not enough funds';
      fm.once(paymentsEndpointURL, JSON.stringify({success: false, error: expectedErrorMessage}));

      const promiseResult = paymentService.createPayment({});

      return expect(promiseResult).to.be.rejectedWith(Error, expectedErrorMessage);
    });

    it('When payment service response with not expected status code, then receive an exception with status code', async () => {

      const expectedStatusCode = 456;
      fm.once(paymentsEndpointURL, expectedStatusCode);

      const promiseResult = paymentService.createPayment({});

      return expect(promiseResult).to.be.rejectedWith(Error, new RegExp(expectedStatusCode));
    });

    it('When payment service response is succeeded, then receive a payment data object', async () => {
      const paymentDataMock  = {
        paymentId        : '321',
        transactionAmount: 4.5,
      };
      const expectedResponse = {
        success: true,
        result : paymentDataMock
      };
      fm.once(paymentsEndpointURL, JSON.stringify(expectedResponse));

      const promiseResult = await paymentService.createPayment({});

      return expect(promiseResult).to.deep.equal(paymentDataMock);
    });

  });
});