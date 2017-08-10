const Auth = require('ace-api/lib/auth');
const ClientConfig = require('ace-api/lib/clientConfig');

module.exports = (util, config) => {

  util.router.get('/config.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
    const clientConfig = new ClientConfig(util.getConfig(config, req));

    clientConfig.get()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/config.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
    const clientConfig = new ClientConfig(util.getConfig(config, req));

    clientConfig.set(req.body.config)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
