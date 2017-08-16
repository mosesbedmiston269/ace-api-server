const multiparty = require('connect-multiparty')();

const Auth = require('ace-api/lib/auth');
const Tools = require('ace-api/lib/tools');

module.exports = (util, config) => {

  util.router.get('/tools/export-db.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'tools'), (req, res) => {
    const tools = new Tools(util.getConfig(config, req.session.slug));

    tools.getDb()
      .then((db) => {
        res.setHeader('Content-Disposition', `attachment; filename=${req.session.slug}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(db);
      }, util.handleError.bind(null, res));
  });

  util.router.post('/tools/import-db.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'tools'), multiparty, (req, res) => {
    const tools = new Tools(util.getConfig(config, req.session.slug));

    tools.importDb(req.files.payload)
      .then((results) => {
        const errors = results.filter(result => result.error);
        res.status(errors.length ? 500 : 200);
        res.send(errors.length ? errors : 'Database imported');
      }, util.handleError.bind(null, res));
  });

  util.router.get('/tools/changes.:ext?', util.authMiddleware, (req, res) => {
    const tools = new Tools(util.getConfig(config, req.session.slug));

    tools.getChanges()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
