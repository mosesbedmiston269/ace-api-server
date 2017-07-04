const Auth = require('ace-api/lib/auth');
const Settings = require('ace-api/lib/settings');

module.exports = (util, config) => {

  util.router.get('/settings.:ext?', util.authMiddleware, (req, res) => {
    const settings = new Settings(util.getConfig(config, req));

    settings.settings()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.put('/settings.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    const settings = new Settings(util.getConfig(config, req));

    settings.settings(req.body.settings, req.session.userId)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
