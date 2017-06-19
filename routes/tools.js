const multiparty = require('connect-multiparty')();

const Auth = require('ace-api/lib/auth');
const Tools = require('ace-api/lib/tools');

module.exports = (config) => {

  config.__router.get('/tools/export-db.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'tools'), (req, res) => {
    const tools = new Tools(config.__db(req), config);

    tools.getDb()
      .then((db) => {
        res.setHeader('Content-Disposition', `attachment; filename=${req.session.slug}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(db);
      }, config.__handleError.bind(null, res));
  });

  config.__router.post('/tools/import-db.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'tools'), multiparty, (req, res) => {
    const tools = new Tools(config.__db(req), config);

    tools.importDb(req.files.payload)
      .then((results) => {
        const errors = results.filter(result => result.error);
        res.status(errors.length ? 500 : 200);
        res.send(errors.length ? errors : 'Database imported');
      }, config.__handleError.bind(null, res));
  });

  config.__router.get('/tools/changes.:ext?', config.__ensureAuthenticated, (req, res) => {
    const tools = new Tools(config.__db(req), config);

    tools.getChanges()
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

};
