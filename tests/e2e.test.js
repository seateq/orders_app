require('rootpath')();

process.env.PAYMENT_SERVICE_URL = 'http://mock.url';

const request                      = require('supertest');
const mockRequire                  = require('mock-require');
const mongoose                     = require('mongoose');
const paymentServiceMockHttpServer = require('tests/paymentServiceMockHttpServer');
const {expect}                     = require('chai');
const Mockgoose                    = require('mockgoose').Mockgoose;
const mockgoose                    = new Mockgoose(mongoose);
const {DELIVERED, CANCELLED}       = require('model/OrderStates');

describe('POST /api/payments', () => {
  let app,
      deliveryService;

  before(async () => {
    await mockgoose.prepareStorage()
  });

  beforeEach(() => {
    deliveryService = {
      deliver() {
        return Promise.resolve();
      }
    };

    mockRequire('services/deliveryService', deliveryService);

    app = require('../app');
  });

  afterEach(async () => {
    paymentServiceMockHttpServer.cleanAll();
    await mockgoose.helper.reset();
  });

  after(async () => {
    await mockgoose.shutdown();
  });

  describe('Create new Order', async () => {

    it('when payment service proceeds payment, then should receive an order with state "DELIVERED" and paymentId', async () => {
      const expectedPaymentId = '321543123';

      paymentServiceMockHttpServer.mockSuccessProcessedPayment({paymentId: expectedPaymentId});

      const {body} = await request(app)
        .post('/api/orders')
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body.state).to.equal(DELIVERED);
      expect(body.paymentId).to.equal(expectedPaymentId)
    });

    it('when payment fails to proceed, then should receive an order with state "CANCELED" and reason of failure', async () => {
      const expectedErrorReason = 'Payment Gateway is down';
      paymentServiceMockHttpServer.mockFailedPayment({errorReason: expectedErrorReason});

      const {body} = await request(app)
        .post('/api/orders')
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body.state).to.equal(CANCELLED);
      expect(body.cancelReason).to.equal(expectedErrorReason);
    });
  });
});