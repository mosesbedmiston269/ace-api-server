const Auth = require('ace-api/lib/auth');
const Stripe = require('ace-api/lib/stripe');

module.exports = (config) => {

  config.__router.all('/stripe/checkout.:ext?', (req, res) => {
    const token = req.body.token || JSON.parse(req.query.token);
    const order = req.body.order || JSON.parse(req.query.order);

    const stripe = new Stripe(config.__db(req), config);

    stripe.checkout(token, order)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.post('/stripe/refund.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const order = req.body.order || JSON.parse(req.query.order);
    const amount = Number(req.body.amount || req.query.amount || 0) * 100;

    const stripe = new Stripe(config.__db(req), config);

    stripe.refund(order, amount)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.get('/stripe/settings.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const stripe = new Stripe(config.__db(req), config);

    stripe.getSettings()
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.get('/stripe/account.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const stripe = new Stripe(config.__db(req), config);

    stripe.retrieveAccount()
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

};
