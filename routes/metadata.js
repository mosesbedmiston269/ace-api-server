const Settings = require('ace-api/lib/settings');

module.exports = (config) => {

  /**
   * @swagger
   * /metadata:
   *  get:
   *    tags:
   *      - metadata
   *    summary: Get metadata
   *    produces:
   *      - application/json
   *    parameters:
   *    responses:
   *      200:
   *        description: Metadata
   *        schema:
   *          type: object
   *          properties:
   *            description:
   *              type: string
   */
  config.__router.get('/metadata.:ext?', config.__useCachedResponse, (req, res) => {
    const settings = new Settings(config.__db(req));

    settings.settings()
      .then((settings) => {
        config.__cacheAndSendResponse(req, res, settings.metadata);
      }, config.__handleError.bind(null, res));
  });

};
