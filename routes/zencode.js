const Zencode = require('ace-api/lib/zencode');

module.exports = (util, config) => {

  util.router.get('/zencode/job.:ext?', util.authMiddleware, (req, res) => {
    const zencode = new Zencode(util.getConfig(config, req.session.slug));

    zencode.getJob(req.query.id)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
