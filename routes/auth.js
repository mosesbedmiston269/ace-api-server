const Auth = require('ace-api/lib/auth');

module.exports = (util, config) => {

  util.router.get('/auth/:provider/config.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    res.status(config[req.params.provider] ? 200 : 404);
    res.json(config[req.params.provider] || {});
  });

  util.router.get('/auth/:provider.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    res.status(req.query.error ? 500 : 200);
    res.send(`${(req.query.error_description ? req.query.error_description : 'Successfully authenticated')} (${req.params.provider})`);
  });

  util.router.post('/auth/:provider.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    const auth = new Auth(util.extendConfig(config, req));

    auth.authenticateWithProvider(req.params.provider, req.body)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
