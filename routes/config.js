const ClientConfig = require('ace-api/lib/client-config');

module.exports = (util, config) => {

  util.router.get('/config.:ext?',
    util.authMiddleware,
    util.asyncMiddleware(async (req, res) => {
      const clientConfig = new ClientConfig(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await clientConfig.get());
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.post('/config.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'config'),
    util.asyncMiddleware(async (req, res) => {
      const clientConfig = new ClientConfig(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await clientConfig.set(req.body.config));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
