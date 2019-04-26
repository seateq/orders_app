class DeliveryService {
  deliver(order) {
    return new Promise(resolve => {
      setTimeout(resolve, 3000);
    });
  }
}

module.exports = new DeliveryService();