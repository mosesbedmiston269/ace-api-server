module.exports = ({
  ClientConfig,
  router,
  cacheMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

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
  router.get(
    '/metadata.:ext?',
    cacheMiddleware,
    asyncMiddleware(async (req, res) => {
      const cc = new ClientConfig(await getConfig(req.session.slug));

      const clientConfig = await cc.get();

      try {
        handleResponse(req, res, clientConfig.client.metadata);
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

};
