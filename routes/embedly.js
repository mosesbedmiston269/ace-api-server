const Embedly = require('ace-api/lib/embedly');

module.exports = (util, config) => {
  const embedly = new Embedly(config);

  util.router.get('/embedly/oembed.:ext?', util.authMiddleware, (req, res) => {
    embedly.oembed(req.query.url || req.query.urls)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });
};
