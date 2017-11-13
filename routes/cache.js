module.exports = (util, config) => {

  /**
   * @swagger
   * /cache/clear:
   *  get:
   *    tags:
   *      - cache
   *    summary: Clear cache
   *    description: Clears the LRU cache of API responses
   *    produces:
   *      - text/plain
   *    responses:
   *      200:
   *        description: Result
   */
  util.router.get('/cache/clear.:ext?', (req, res) => {
    if (!config.cache) {
      util.sendResponse(res, 'Cache disabled');
      return;
    }

    const items = [];

    util.cache.forEach((value, key) => {
      if (key.indexOf(req.session.slug) === 0) {
        items.push(key);
      }
    });

    items.forEach(key => util.cache.del(key));

    util.sendResponse(res, `${items.length} items removed from cache`);
  });

};
