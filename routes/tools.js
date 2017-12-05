const multiparty = require('connect-multiparty')();

module.exports = ({
  Tools,
  router,
  authMiddleware,
  permissionMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

  router.get(
    '/tools/export-db.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'tools'),
    asyncMiddleware(async (req, res) => {
      const tools = new Tools(await getConfig(req.session.slug));

      try {
        const db = await tools.getDb();

        res.setHeader('Content-Disposition', `attachment; filename=${req.session.slug}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(db);

      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.post(
    '/tools/import-db.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'tools'),
    multiparty,
    asyncMiddleware(async (req, res) => {
      const tools = new Tools(await getConfig(req.session.slug));

      try {
        const results = await tools.importDb(req.files.payload);

        const errors = results.filter(result => result.error);

        res.status(errors.length ? 500 : 200);
        res.send(errors.length ? errors : 'Database imported');

      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/tools/changes.:ext?',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const tools = new Tools(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await tools.getChanges());
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

};
