const Zencode = require('ace-api/lib/zencode');

module.exports = (config) => {

  config.__router.get('/zencode/job.:ext?', config.__ensureAuthenticated, (req, res) => {
    const zencode = new Zencode(config.__db(req), config);

    zencode.getJob(req.query.id)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

};
