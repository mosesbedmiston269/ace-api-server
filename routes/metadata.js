const Settings = require('ace-api/lib/settings');

module.exports = (util, config) => {

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
  util.router.get('/metadata.:ext?', util.cacheMiddleware, (req, res) => {
    const settings = new Settings(util.getConfig(config, req));

    settings.settings()
      .then((settings) => {
        util.cacheAndSendResponse(req, res, settings.metadata);
      }, util.handleError.bind(null, res));
  });

};
