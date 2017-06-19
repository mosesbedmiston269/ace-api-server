module.exports = (config) => {

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
  config.__router.get('/cache/clear.:ext?', (req, res) => {
    if (!config.cache) {
      config.__sendResponse(res, 'Cache disabled');
      return;
    }

    const itemsCount = config.__cache.keys().length;

    config.__cache.reset();

    config.__sendResponse(res, `Successfully cleared ${itemsCount} items from the cache`);
  });

};
