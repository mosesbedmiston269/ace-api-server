const _ = require('lodash');
const Auth = require('ace-api/lib/auth');
const Admin = require('ace-api/lib/admin');
const Roles = require('ace-api/lib/roles');

module.exports = (util, config) => {

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
  util.router.get('/admin/user/current.:ext?', util.authMiddleware, (req, res) => {
    const admin = new Admin(util.extendConfig(config, req));

    admin.getUser(req.session.email, req.session.superUser)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/admin/roles.:ext?', util.authMiddleware, (req, res) => {
    const roles = _.mapValues(Roles, (role, slug) => {
      role.slug = slug;
      return role;
    });

    res.status(200).send(roles);
  });

  Admin.TYPES.forEach((type) => {

    util.router.get(`/admin/${type}/search.:ext?`, util.authMiddleware, (req, res) => {
      const admin = new Admin(util.extendConfig(config, req));

      admin.search(type, req.query)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

    util.router.get(`/admin/${type}/list.:ext?`, util.authMiddleware, (req, res) => {
      const admin = new Admin(util.extendConfig(config, req));

      admin.list(type, req.query)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

    util.router.post(`/admin/${type}.:ext?`, util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const item = req.body.item;

      if (type === 'user') {
        item.slug = req.session.slug;
      }

      const admin = new Admin(util.extendConfig(config, req));

      admin.create(type, item)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

    util.router.get(`/admin/${type}.:ext?`, util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(util.extendConfig(config, req));

      admin.read(type, req.query)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

    util.router.put(`/admin/${type}.:ext?`, util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(util.extendConfig(config, req));

      admin.update(type, req.body.items)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

    util.router.delete(`/admin/${type}.:ext?`, util.authMiddleware, Auth.requirePermission.bind(null, 'admin'), (req, res) => {
      const admin = new Admin(util.extendConfig(config, req));

      admin.delete(type, req.body.items)
        .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
    });

  });

};
