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

    const itemsCount = util.cache.keys().length;

    util.cache.reset();

    util.sendResponse(res, `Successfully cleared ${itemsCount} items from the cache`);
  });

};
