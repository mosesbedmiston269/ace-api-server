const Analytics = require('ace-api/lib/analytics');

module.exports = (util, config) => {
  const analytics = new Analytics(config);

  util.router.get('/analytics.:ext?', util.authMiddleware, util.cacheMiddleware, (req, res) => {
    analytics.get(req.query)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });
};
