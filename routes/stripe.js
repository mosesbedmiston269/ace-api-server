const Auth = require('ace-api/lib/auth');
const Stripe = require('ace-api/lib/stripe');
const Email = require('ace-api/lib/email');
const Ecommerce = require('ace-api/lib/ecommerce');

module.exports = (util, config) => {

  util.router.all('/stripe/checkout.:ext?', (req, res) => {
    const token = req.body.token || JSON.parse(req.query.token);
    const order = req.body.order || JSON.parse(req.query.order);

    const stripe = new Stripe(util.getConfig(config, req.session.slug));

    stripe.checkout(token, order)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/stripe/refund.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const order = req.body.order || JSON.parse(req.query.order);
    const amount = Number(req.body.amount || req.query.amount || 0) * 100;

    const stripe = new Stripe(util.getConfig(config, req.session.slug));

    stripe.refund(order, amount)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/stripe/account.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const stripe = new Stripe(util.getConfig(config, req.session.slug));

    stripe.retrieveAccount()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get(
    '/stripe/email.:ext?',
    util.asyncMiddleware(async (req, res) => {
      const email = new Email(util.getConfig(config, req.session.slug));
      const stripe = new Stripe(util.getConfig(config, req.session.slug));
      const ecommerce = new Ecommerce(util.getConfig(config, req.session.slug));

      const settings = (await stripe.getSettings());
      const order = (await ecommerce.getOrder(req.query.orderId));

      const data = {
        settings,
        order,
      };

      email.getTemplate(`${req.session.slug}/${req.query.template}`, data)
        .then((template) => {
          util.sendResponse(res, template.html);
        }, util.handleError.bind(null, res));
    })
  );

};
