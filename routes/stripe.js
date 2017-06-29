const Auth = require('ace-api/lib/auth');
const Stripe = require('ace-api/lib/stripe');

module.exports = (util, config) => {

  util.router.all('/stripe/checkout.:ext?', (req, res) => {
    const token = req.body.token || JSON.parse(req.query.token);
    const order = req.body.order || JSON.parse(req.query.order);

    const stripe = new Stripe(util.extendConfig(config, req));

    stripe.checkout(token, order)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/stripe/refund.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const order = req.body.order || JSON.parse(req.query.order);
    const amount = Number(req.body.amount || req.query.amount || 0) * 100;

    const stripe = new Stripe(util.extendConfig(config, req));

    stripe.refund(order, amount)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/stripe/settings.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const stripe = new Stripe(util.extendConfig(config, req));

    stripe.getSettings()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/stripe/account.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const stripe = new Stripe(util.extendConfig(config, req));

    stripe.retrieveAccount()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
