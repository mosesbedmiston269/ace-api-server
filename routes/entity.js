const _ = require('lodash');
const Auth = require('ace-api/lib/auth');
const Entity = require('ace-api/lib/entity');
const Db = require('ace-api/lib/db');

module.exports = (util, config) => {

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
   *        type: date
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
   *    parameters:
   *    responses:
   *      200:
   *        description: Indexes
   */
  util.router.get('/entities/index.:ext?', (req, res) => {
    Db.connect(util.getConfig(config, req.session.slug)).indexAsync()
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

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
  util.router.get('/entities/search?.:ext?', util.cacheMiddleware, (req, res) => {
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

    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entitySearch(req.query, children, parents, req.session.role)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });

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
  util.router.get('/entities/find.:ext?', util.cacheMiddleware, (req, res) => {
    const query = JSON.parse(req.query.query);
    let children = req.query.children !== undefined ? JSON.parse(req.query.children) : false;
    let parents = req.query.parents !== undefined ? JSON.parse(req.query.parents) : false;

    if (children === true) {
      children = 1;
    }
    if (parents === true) {
      parents = 1;
    }

    if (req.session.role === 'guest') {
      query.use_index = ['entityIndex', 'published'];
    } else {
      query.use_index = ['entityIndex', 'active'];
    }

    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityFind(query, children, parents, req.session.role)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });

  util.router.get(
    '/entities/field.:ext?',
    util.cacheMiddleware,
    util.asyncMiddleware(async (req, res) => {
      const entity = new Entity(util.getConfig(config, req.session.slug));

      try {
        util.sendResponse(res, await entity.fieldValues(req.query.slug || req.query.fieldSlug, req.query.searchTerm));
      } catch (error) {
        util.handleError(res, error);
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
   *    description:
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
  util.router.all(
    '/entities.:ext?',
    util.cacheMiddleware,
    (req, res) => {
      let children = req.query.children !== undefined ? JSON.parse(req.query.children) : false;
      let parents = req.query.parents !== undefined ? JSON.parse(req.query.parents) : false;

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


      const entity = new Entity(util.getConfig(config, req.session.slug));

      entity.entityList(req.query, children, parents, req.session.role)
        .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
    }
  );

  util.router.get('/entity/revisions.:ext?', util.authMiddleware, (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityRevisions(req.query.id)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/entity.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'entityCreate'), (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityCreate(req.body.entity)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/entity.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'entityRead'), (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityRead(req.query.id)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.put('/entity.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'entityUpdate'), (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityUpdate(req.body.entity || req.body.entities, req.body.restore || false)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/entity.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'entityDelete'), (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityDelete(req.body.entity || req.body.entities, req.body.forever || false)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/entity/trashed.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'entityDelete'), (req, res) => {
    const entity = new Entity(util.getConfig(config, req.session.slug));

    entity.entityDelete('trashed')
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

};
