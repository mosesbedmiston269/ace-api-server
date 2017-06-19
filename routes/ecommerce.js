const _ = require('lodash');
const Auth = require('ace-api/lib/auth');
const Ecommerce = require('ace-api/lib/ecommerce');

module.exports = (config) => {

  config.__router.get('/ecommerce/settings.:ext?', (req, res) => {
    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.settings()
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.put('/ecommerce/settings.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.settings(req.body.settings)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.get('/ecommerce/order/message/:message.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.getOrder(req.query.orderId)
      .then((order) => {
        try {
          res.status(200).send(order.messages[req.params.message].email.html);
        } catch (error) {
          config.__handleError(res, error);
        }
      }, config.__handleError.bind(null, res));
  });

  config.__router.get('/ecommerce/:type.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (_.isArray(req.query.sort)) {
      req.query.sort = JSON.stringify(req.query.sort).replace(/\\"/g, '');
    }

    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.getType(req.params.type, req.query)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.post('/ecommerce/:type.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (!/discount|order/.test(req.params.type)) {
      config.__handleError(res, `Illegal type: ${req.params.type}`);
      return;
    }

    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.setType(req.params.type, req.body.item)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.delete('/ecommerce/:type.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'ecommerce'), (req, res) => {
    if (!/discount/.test(req.params.type)) {
      config.__handleError(res, `Illegal type: ${req.params.type}`);
      return;
    }

    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.deleteType(req.body.item)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.get('/ecommerce/discount/:code.:ext?', (req, res) => {
    const ecommerce = new Ecommerce(config.__db(req), config);

    ecommerce.verifyDiscount(req.params.code)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });
};
