const Auth = require('ace-api/lib/auth');

module.exports = (config) => {

  config.__router.get('/auth/:provider/config.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    res.status(config[req.params.provider] ? 200 : 404);
    res.json(config[req.params.provider] || {});
  });

  config.__router.get('/auth/:provider.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    res.status(req.query.error ? 500 : 200);
    res.send(`${(req.query.error_description ? req.query.error_description : 'Successfully authenticated')} (${req.params.provider})`);
  });

  config.__router.post('/auth/:provider.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    const auth = new Auth(config.__db(req), config);

    auth.authenticateWithProvider(req.params.provider, req.body)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

};
