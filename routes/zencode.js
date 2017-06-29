const Zencode = require('ace-api/lib/zencode');

module.exports = (util, config) => {

  util.router.get('/zencode/job.:ext?', util.authMiddleware, (req, res) => {
    const zencode = new Zencode(util.extendConfig(config, req));

    zencode.getJob(req.query.id)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
