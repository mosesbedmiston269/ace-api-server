const Auth = require('ace-api/lib/auth');
const Taxonomy = require('ace-api/lib/taxonomy');

module.exports = (config) => {

  // config.__router.post('/taxonomy.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'taxonomyCreate'), (req, res) => {
  //   const taxonomy = new Taxonomy(config.__db(req));

  //   taxonomy.create(req.body.items[0])
  //     .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  // });

  config.__router.put('/taxonomy.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(config.__db(req));

    taxonomy.update(req.body.items[0])
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.post('/taxonomy/term.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(config.__db(req));

    taxonomy.createTerm(req.body.slug, req.body.term, req.session.email)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.put('/taxonomy/term.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(config.__db(req));

    taxonomy.updateTerm(req.query || req.body)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.delete('/taxonomy/term.:ext?', config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'taxonomyUpdate'), (req, res) => {
    const taxonomy = new Taxonomy(config.__db(req));

    taxonomy.deleteTerm(req.query || req.body)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
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
  config.__router.get('/taxonomy.:ext?', config.__useCachedResponse, (req, res) => {
    const taxonomy = new Taxonomy(config.__db(req));

    taxonomy.read(req.query.slug)
      .then(config.__cacheAndSendResponse.bind(null, req, res), config.__handleError.bind(null, res));
  });
};
