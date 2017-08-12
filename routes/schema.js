const Schema = require('ace-api/lib/schema');

module.exports = (util, config) => {

  util.router.post('/schema.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'schema'),
    util.asyncMiddleware(async (req, res) => {
      const schema = new Schema(util.getConfig(config, req));

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
      const schema = new Schema(util.getConfig(config, req));

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
      const schema = new Schema(util.getConfig(config, req));

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
      const schema = new Schema(util.getConfig(config, req));

      try {
        util.sendResponse(res, await schema.delete(req.query.schemaId || req.query.schemaIds));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
