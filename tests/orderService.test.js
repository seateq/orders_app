require('rootpath')();

const {beforeEach, describe}                     = require('mocha');
const mockRequire                                = require('mock-require');
const {CREATED, CANCELLED, DELIVERED, CONFIRMED} = require('model/OrderStates');
const Order                                      = require('../model/Order');
const chai                                       = require('chai');
const sinon                                      = require('sinon');
const sinonChai                                  = require("sinon-chai");
const chaiAsPromised                             = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

const sandbox = sinon.sandbox.create();

const paymentService = {
  createPayment: () => {
  }
};

const deliveryService = {
  deliver: () => {
  }
};

const order = {
  type : 'book',
  count: 5
};

const paymentId = '321123';

let orderService,
    createPaymentStub;

describe('Order Service', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('Create new Order', async () => {

    let createStub,
        setStub,
        saveStub;

    beforeEach(() => {
      createStub = sandbox.stub(Order, 'create');
      setStub    = sandbox.stub(Order.prototype, 'set');
      saveStub   = sandbox.stub(Order.prototype, 'save');

      createStub.returns(Order.prototype);

      mockRequire('services/deliveryService', deliveryService);

      createPaymentStub = sandbox.stub(paymentService, 'createPayment');

      createPaymentStub.returns({
        paymentId: paymentId
      });

      mockRequire('services/paymentService', paymentService);

      orderService = require('services/orderService');
    });

    it('Saves order with state "CREATED" before payment execution', async () => {
      await orderService.create(order);

      createStub.should.have.been.calledWith({
        ...order,
        state: CREATED
      });

      createStub.should.have.been.calledBefore(createPaymentStub);
    });

    it('Saves payment ID and state "CONFIRMED" in order model when payment has been received', async () => {
      await orderService.create(order);

      createPaymentStub.should.have.been.calledWith(order);

      setStub.should.have.been.calledWith('paymentId', paymentId);
      setStub.should.have.been.calledWith('state', CONFIRMED);

      setStub.should.have.been.calledAfter(setStub);
    });

    it('should set "CANCELED" state and fail reason in order model in case payment failed', async () => {
      const failReason    = "Payment failed because payment service is down";
      const expectedError = new Error(failReason);

      createPaymentStub.throws(expectedError);

      const result = await orderService.create(order);

      result.should.be.equal(Order.prototype);
      setStub.should.have.been.calledWith('state', CANCELLED);
      setStub.should.have.been.calledWith('cancelReason', failReason);

      saveStub.should.have.been.calledAfter(setStub);
    });

    it('should deliver order if payment was successful', async () => {
      const deliverStub = sinon.stub(deliveryService, 'deliver');

      await orderService.create(order);

      deliverStub.should.have.been.calledWith(order);

      setStub.should.have.been.calledWith('state', DELIVERED);

      saveStub.should.have.been.calledAfter(deliverStub);
      saveStub.should.have.been.calledAfter(setStub);
    }).timeout(4000);
  });
});