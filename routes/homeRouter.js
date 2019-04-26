const router = require('express').Router();

router.get('/', async (req, res) => {
  res.send('Order service')
});

module.exports = router;