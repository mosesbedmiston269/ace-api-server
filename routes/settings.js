const Auth = require('ace-api/lib/auth');
const Settings = require('ace-api/lib/settings');

module.exports = (config) => {

  config.__router.get('/settings.:ext?', config.__ensureAuthenticated, (req, res) => {
    const settings = new Settings(config.__db(req));

    settings.settings()
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.put('/settings.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'settings'), (req, res) => {
    const settings = new Settings(config.__db(req));

    settings.settings(req.body.settings, req.session.email)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

};
