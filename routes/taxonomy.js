const Auth = require('ace-api/lib/auth');
const Taxonomy = require('ace-api/lib/taxonomy');

module.exports = (util, config) => {

  /**
   * @swagger
   * definitions:
   *  Taxonomy:
   *    type: object
   *    properties:
   *      title:
   *        type: string
   *      slug:
   *        type: string
   *      terms:
   *        type: array
   *        items:
   *          type: object
   *          properties:
   *            id:
   *              type: string
   *            title:
   *              type: string
   *            slug:
   *              type: string
   *            terms:
   *              type: array
   */

  util.router.post('/taxonomy.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'taxonomyUpdate'),
    util.asyncMiddleware(async (req, res) => {
      const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await taxonomy.create(req.body.taxonomy));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  /**
   * @swagger
   * /taxonomy:
   *  get:
   *    tags:
   *      - taxonomy
   *    summary: Get taxonomy
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: slug
   *        description: Taxonomy slug
   *        in: query
   *        required: true
   *        type: string
   *    responses:
   *      200:
   *        description: Taxonomy
   *        schema:
   *          type: object
   *          $ref: '#/definitions/Taxonomy'
   */
  util.router.get('/taxonomy.:ext?',
    util.cacheMiddleware,
    util.asyncMiddleware(async (req, res) => {
      const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

      try {
        util.cacheAndSendResponse(req, res, await taxonomy.read(req.query.slug || req.query.taxonomySlug));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.put('/taxonomy.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'taxonomyUpdate'),
    util.asyncMiddleware(async (req, res) => {
      const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await taxonomy.update(req.body.taxonomy));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.delete('/taxonomy.:ext?',
    util.authMiddleware,
    util.permissionMiddleware.bind(null, 'taxonomyUpdate'),
    util.asyncMiddleware(async (req, res) => {
      const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await taxonomy.delete(req.body.taxonomySlug || req.body.taxonomySlugs || req.query.taxonomySlug || req.query.taxonomySlugs));
      } catch (error) {
        util.handleError(res, error);
      }
    })
  );

  util.router.post('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

    taxonomy.createTerm(req.body.slug || req.body.taxonomySlug, req.body.term)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.put('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

    taxonomy.updateTerm(req.query.term || req.body.term)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req.session.slug));

    taxonomy.deleteTerm(req.query.term || req.body.term)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
