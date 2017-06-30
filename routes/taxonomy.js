const Auth = require('ace-api/lib/auth');
const Taxonomy = require('ace-api/lib/taxonomy');

module.exports = (util, config) => {

  // util.router.post('/taxonomy.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyCreate'), (req, res) => {
  //   const taxonomy = new Taxonomy(util.getConfig(config, req));

  //   taxonomy.create(req.body.items[0])
  //     .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  // });

  util.router.put('/taxonomy.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req));

    taxonomy.update(req.body.items[0])
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req));

    taxonomy.createTerm(req.body.slug, req.body.term, req.session.email)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.put('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req));

    taxonomy.updateTerm(req.query || req.body)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/taxonomy/term.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req));

    taxonomy.deleteTerm(req.query || req.body)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

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
   *          properties:
   *            _id:
   *              type: string
   *            _rev:
   *              type: string
   *            title:
   *              type: string
   *            slug:
   *              type: string
   *            terms:
   *              type: array
   *              items:
   *                schema:
   *                  type: object
   *                  properties:
   *                    id:
   *                      type: string
   *                    title:
   *                      type: string
   *                    slug:
   *                      type: string
   *                    terms:
   *                      type: array
   */
  util.router.get('/taxonomy.:ext?', util.cacheMiddleware, (req, res) => {
    const taxonomy = new Taxonomy(util.getConfig(config, req));

    taxonomy.read(req.query.slug)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });
};
