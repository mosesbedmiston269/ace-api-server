const _ = require('lodash');
const Auth = require('ace-api/lib/auth');
const Ecommerce = require('ace-api/lib/ecommerce');

module.exports = (util, config) => {

  util.router.get('/ecommerce/settings.:ext?', (req, res) => {
    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.settings()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.put('/ecommerce/settings.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.settings(req.body.settings)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/ecommerce/order/message/:message.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.getOrder(req.query.orderId)
      .then((order) => {
        try {
          res.status(200).send(order.messages[req.params.message].email.html);
        } catch (error) {
          util.handleError(res, error);
        }
      }, util.handleError.bind(null, res));
  });

  util.router.get('/ecommerce/:type.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (_.isArray(req.query.sort)) {
      req.query.sort = JSON.stringify(req.query.sort).replace(/\\"/g, '');
    }

    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.getType(req.params.type, req.query)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/ecommerce/:type.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (!/discount|order/.test(req.params.type)) {
      util.handleError(res, `Illegal type: ${req.params.type}`);
      return;
    }

    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.setType(req.params.type, req.body.item)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/ecommerce/:type.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (!/discount/.test(req.params.type)) {
      util.handleError(res, `Illegal type: ${req.params.type}`);
      return;
    }

    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.deleteType(req.body.item)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/ecommerce/discount/:code.:ext?', (req, res) => {
    const ecommerce = new Ecommerce(util.extendConfig(config, req));

    ecommerce.verifyDiscount(req.params.code)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });
};
