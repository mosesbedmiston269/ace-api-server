const expressUseragent = require('express-useragent');

module.exports = ({
  router,
}) => {

  const useragent = expressUseragent.express();

  router.all('/debug/useragent.:ext?', useragent, (req, res) => {
    res.status(200);
    res.send(`<html><head><title>${req.useragent.source}</title><meta name="description" content="${req.useragent.source}"></head><body>${req.useragent.source}</body></html>`);
  });

};
