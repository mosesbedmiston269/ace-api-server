const User = require('ace-api/lib/user');

module.exports = (util, config) => {

  util.router.post('/user.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'user'),
    util.asyncMiddleware(async (req, res) => {
      const user = new User(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await user.create(req.body.user));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.get('/user.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'user'),
    util.asyncMiddleware(async (req, res) => {
      const user = new User(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await user.read(req.query.userId));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.put('/user.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'user'),
    util.asyncMiddleware(async (req, res) => {
      const user = new User(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await user.update(req.body.user));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.delete('/user.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'user'),
    util.asyncMiddleware(async (req, res) => {
      const user = new User(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await user.delete(req.body.userId || req.body.userIds || req.query.userId || req.query.userIds));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
