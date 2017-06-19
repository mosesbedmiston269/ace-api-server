const Analytics = require('ace-api/lib/analytics');

module.exports = (config) => {
  const analytics = new Analytics(config);

  config.__router.get('/analytics.:ext?', config.__ensureAuthenticated, config.__useCachedResponse, (req, res) => {
    analytics.get(req.query)
      .then(config.__cacheAndSendResponse.bind(null, req, res), config.__handleError.bind(null, res));
  });
};
