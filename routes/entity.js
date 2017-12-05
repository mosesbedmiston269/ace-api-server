const _ = require('lodash');

module.exports = ({
  Db,
  Entity,
  router,
  authMiddleware,
  permissionMiddleware,
  cacheMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

  /**
   * @swagger
   * definitions:
   *  Entity:
   *    type: object
   *    required:
   *      - _id
   *      - _rev
   *    properties:
   *      _id:
   *        type: string
   *      _rev:
   *        type: string
   *      schema:
   *        type: string
   *      title:
   *        type: string
   *      slug:
   *        type: string
   *      thumbnail:
   *        type: object
   *      fields:
   *        type: object
   *      published:
   *        type: boolean
   *      publishedAt:
   *        type: string
   */

  /**
   * @swagger
   * /entities/index:
   *  get:
   *    tags:
   *      - entities
   *    summary: Show indexes
   *    description: Show all indexes, use this to find fields available for search/query.
   *    produces:
   *      - application/json
   *    parameters: []
   *    responses:
   *      200:
   *        description: Indexes
   */
  router.get(
    '/entities/index.:ext?',
    asyncMiddleware(async (req, res) => {
      try {
        handleResponse(req, res, await Db.connect(await getConfig(req.session.slug)).indexAsync());
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  /**
   * @swagger
   * /entities/search:
   *  get:
   *    tags:
   *      - entities
   *    summary: Search entities
   *    description: This endpoint extends Cloudant's Lucene based search. Learn more from Cloudant's [documentation](https://docs.cloudant.com/search.html).
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: query
   *        description: Lucene search query
   *        in: query
   *        required: true
   *        type: string
   *      - name: include_docs
   *        description: Include docs in search results (ignored if `children` or `parents` is `true`)
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *      - name: sort
   *        description: Field to sort results by. Prefixed with `-` to reverse order. Suffixed with &#60;`string|number`&#62;
   *        in: query
   *        required: false
   *        type: string
   *      - name: limit
   *        description: Limit results (max 200)
   *        in: query
   *        required: false
   *        type: number
   *      - name: bookmark
   *        description: Bookmark for the next page of results
   *        in: query
   *        required: false
   *        type: string
   *      - name: group_field
   *        description: Field to group results by
   *        in: query
   *        required: false
   *        type: string
   *      - name: index
   *        description: Search index
   *        in: query
   *        required: false
   *        type: string
   *        default: all
   *      - name: children
   *        description: Get child entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *      - name: parents
   *        description: Get parent entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *      - name: trashed
   *        description: Get trashed entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *    responses:
   *      200:
   *        description: Search result
   *        schema:
   *          type: object
   *          properties:
   *            bookmark:
   *              type: string
   *            total_rows:
   *              type: number
   *            rows:
   *              type: array
   *              items:
   *                $ref: '#/definitions/Entity'
   */
  router.get(
    '/entities/search?.:ext?',
    cacheMiddleware,
    asyncMiddleware(async (req, res) => {
      let children = req.query.children !== undefined ? JSON.parse(req.query.children) : false;
      let parents = req.query.parents !== undefined ? JSON.parse(req.query.parents) : false;
      const trashed = req.query.trashed !== undefined ? JSON.parse(req.query.trashed) : false;
      const query = [];

      req.query.include_docs = req.query.include_docs ? JSON.parse(req.query.include_docs) : false;

      if (children === true) {
        children = 1;
      }
      if (parents === true) {
        parents = 1;
      }

      if (children) {
        req.query.include_docs = false;
      }
      if (parents) {
        req.query.include_docs = true;
      }

      query.push(trashed ? 'trashed:true' : '!trashed:true');

      if (req.session.role === 'guest') {
        query.push('published:true');
      }

      if (req.query.query || req.query.q) {
        query.push(req.query.query || req.query.q);
      }

      req.query.query = query.join(' AND ');

      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entitySearch(req.query, children, parents, req.session.role), true);
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  /**
   * @swagger
   * /entities/find:
   *  get:
   *    tags:
   *      - entities
   *    summary: Query entities
   *    description: This endpoint extends CouchDB's Mango query. Learn more from Cloudant's [documentation](https://docs.cloudant.com/cloudant_query.html#finding-documents-using-an-index).
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: query
   *        description: JSON query object, refer to CouchDB/Cloudant docs.
   *        in: query
   *        required: true
   *        type: string
   *      - name: children
   *        description: Get child entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *      - name: parents
   *        description: Get parent entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *    responses:
   *      200:
   *        description: Query result
   *        schema:
   *          type: object
   *          properties:
   *            bookmark:
   *              type: string
   *            docs:
   *              type: array
   *              items:
   *                $ref: '#/definitions/Entity'
   */
  router.get(
    '/entities/find.:ext?',
    cacheMiddleware,
    asyncMiddleware(async (req, res) => {
      const query = JSON.parse(req.query.query);
      let children = req.query.children !== undefined ? JSON.parse(req.query.children) : false;
      let parents = req.query.parents !== undefined ? JSON.parse(req.query.parents) : false;

      if (children === true) {
        children = 1;
      }
      if (parents === true) {
        parents = 1;
      }

      query.use_index = ['entityIndex', 'entity'];

      if (req.session.role === 'guest') {
        query.selector = {
          $and: [
            { published: true },
            query.selector,
          ],
        };
      }

      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityFind(query, children, parents, req.session.role), true);
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/entities/field.:ext?',
    cacheMiddleware,
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.fieldValues(req.query.slug || req.query.fieldSlug, req.query.searchTerm), true);
      } catch (error) {
        handleError(res, error);
      }
    })
  );

  /**
   * @swagger
   * /entities:
   *  get:
   *    tags:
   *      - entities
   *    summary: Get all entities
   *    description: Get all entities, optionally from an array of IDs
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Entity ID
   *        in: query
   *        required: false
   *        type: string
   *      - name: ids
   *        description: Entity IDs
   *        in: query
   *        required: false
   *        type: array
   *        items:
   *          type: string
   *      - name: children
   *        description: Get child entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *      - name: parents
   *        description: Get parent entities
   *        in: query
   *        required: false
   *        type: boolean
   *        default: false
   *    responses:
   *      200:
   *        description: Entities
   *        schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/Entity'
   */
  router.all(
    '/entities.:ext?',
    cacheMiddleware,
    asyncMiddleware(async (req, res) => {
      let children = (req.query.children || req.body.children) !== undefined
        ? JSON.parse((req.query.children || req.body.children)) : false;
      let parents = (req.query.parents || req.body.parents) !== undefined
        ? JSON.parse((req.query.parents || req.body.parents)) : false;

      if (children === true) {
        children = 1;
      }
      if (parents === true) {
        parents = 1;
      }

      const keys = req.query.ids || req.query.id || req.body.ids || req.body.id;

      if (keys) {
        req.query.keys = _.isArray(keys) ? keys : [keys];
      }

      req.query.include_docs = true;

      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityList(req.query, children, parents, req.session.role), true);
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/entity/revisions.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityRead'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityRevisions(req.query.id));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.post(
    '/entity.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityCreate'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityCreate(req.body.entity));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/entity.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityRead'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityRead(req.query.id));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.put(
    '/entity.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityUpdate'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityUpdate(req.body.entity || req.body.entities, req.body.restore || false));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.delete(
    '/entity.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityDelete'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityDelete(req.body.entity || req.body.entities, req.body.forever || false));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.delete(
    '/entity/trashed.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'entityDelete'),
    asyncMiddleware(async (req, res) => {
      const entity = new Entity(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await entity.entityDelete('trashed'));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

};
