const Schema = require('ace-api/lib/schema');

module.exports = (util, config) => {

  util.router.post('/schema.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await schema.create(req.body.schema));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.get('/schema.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await schema.read(req.query.schemaId));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.put('/schema.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await schema.update(req.body.schema));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.delete('/schema.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await schema.delete(req.body.schemaSlug || req.body.schemaSlugs || req.query.schemaSlug || req.query.schemaSlugs));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.put('/schemas.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await schema.updateAll(req.body.schemas));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
