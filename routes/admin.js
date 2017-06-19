const _ = require('lodash');
const Auth = require('ace-api/lib/auth');
const Admin = require('ace-api/lib/admin');
const Roles = require('ace-api/lib/roles');

const ADMIN_TYPES = ['user', 'schema', 'field', 'action', 'taxonomy'];

module.exports = (config) => {

  /**
   * @swagger
   * /admin/user/current:
   *  get:
   *    tags:
   *      - admin
   *    summary: Get current user
   *    description: Get the current user's details.
   *    produces:
   *      - application/json
   *    parameters:
   *    responses:
   *      200:
   *        description: User
   */
  config.__router.get('/admin/user/current.:ext?', config.__ensureAuthenticated, (req, res) => {
    const admin = new Admin(config.__db(req), config);

    admin.getUser(req.session.email, req.session.superUser)
      .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
  });

  config.__router.get('/admin/roles.:ext?', config.__ensureAuthenticated, (req, res) => {
    const roles = _.mapValues(Roles, (role, slug) => {
      role.slug = slug;
      return role;
    });

    res.status(200).send(roles);
  });

  ADMIN_TYPES.forEach((type) => {

    config.__router.get(`/admin/${type}/search.:ext?`, config.__ensureAuthenticated, (req, res) => {
      const admin = new Admin(config.__db(req), config);

      admin.search(type, req.query)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

    config.__router.get(`/admin/${type}/list.:ext?`, config.__ensureAuthenticated, (req, res) => {
      const admin = new Admin(config.__db(req), config);

      admin.list(type, req.query)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

    config.__router.post(`/admin/${type}.:ext?`, config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const item = req.body.item;

      if (type === 'user') {
        item.slug = req.session.slug;
      }

      const admin = new Admin(config.__db(req), config);

      admin.create(type, item)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

    config.__router.get(`/admin/${type}.:ext?`, config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(config.__db(req), config);

      admin.read(type, req.query)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

    config.__router.put(`/admin/${type}.:ext?`, config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(config.__db(req), config);

      admin.update(type, req.body.items)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

    config.__router.delete(`/admin/${type}.:ext?`, config.__ensureAuthenticated, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(config.__db(req), config);

      admin.delete(type, req.body.items)
        .then(config.__sendResponse.bind(null, res), config.__handleError.bind(null, res));
    });

  });

};
