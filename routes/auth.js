const Auth = require('ace-api/lib/auth');

module.exports = (util, config) => {

  util.router.get(
    '/auth/:provider/config.:ext?',
    util.authMiddleware,
    Auth.requirePermission.bind(null, 'settings'),
    (req, res) => {
      if (!config[req.params.provider]) {
        res.status(404);
        res.send({});
        return;
      }

      res.status(200);
      res.send({ clientId: config[req.params.provider].clientId });
    }
  );

  util.router.get(
    '/auth/:provider.:ext?',
    util.authMiddleware,
    Auth.requirePermission.bind(null, 'settings'),
    (req, res) => {
      res.status(req.query.error ? 500 : 200);
      res.send(`${(req.query.error_description ? req.query.error_description : 'Successfully authenticated')} (${req.params.provider})`);
    }
  );

  util.router.post(
    '/auth/:provider.:ext?',
    util.authMiddleware,
    Auth.requirePermission.bind(null, 'settings'),
    (req, res) => {
      const auth = new Auth(util.getConfig(config, req.session.slug));

      auth.authenticateWithProvider(req.params.provider, req.body)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    }
  );

};
