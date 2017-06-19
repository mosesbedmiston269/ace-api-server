const Embedly = require('ace-api/lib/embedly');

module.exports = (config) => {
  const embedly = new Embedly(config);

  config.__router.get('/embedly/oembed.:ext?', config.__ensureAuthenticated, (req, res) => {
    embedly.oembed(req.query.url || req.query.urls)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });
};
