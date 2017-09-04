const Settings = require('ace-api/lib/settings');

module.exports = (util, config) => {

  util.router.post('/settings.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'settings'),
    util.asyncMiddleware(async (req, res) => {
      const settings = new Settings(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await settings.update(req.body.settings));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
