const ClientConfig = require('ace-api/lib/client-config');

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
   *    parameters: []
   *    responses:
   *      200:
   *        description: Metadata
   *        schema:
   *          type: object
   *          properties:
   *            description:
   *              type: string
   */
  util.router.get(
    '/metadata.:ext?',
    util.cacheMiddleware,
    util.asyncMiddleware(async (req, res) => {
      const cc = new ClientConfig(util.getConfig(config, req.session.slug));

      const clientConfig = await cc.get();

      try {
        util.cacheAndSendResponse(req, res, clientConfig.client.metadata);
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

};
