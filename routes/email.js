const Email = require('ace-api/lib/email');
const Entity = require('ace-api/lib/entity');

module.exports = (util, config) => {
  const email = new Email(config);

  /**
   * @swagger
   * /email/template:
   *  get:
   *    tags:
   *      - email
   *    summary: Render email template
   * #   description: Render email template
   *    produces:
   *      - text/html
   *    parameters:
   *      - name: templateSlug
   *        description: Template slug (folder name of the template)
   *        in: query
   *        required: true
   *        type: string
   *      - name: entityId
   *        description: Entity `id` from which to render the template
   *        in: query
   *        required: false
   *        type: string
   *      - name: preview
   *        description: Preview mode (disable inlining of styles etc)
   *        in: query
   *        required: false
   *        type: boolean
   *    responses:
   *      200:
   *        description: Template
   */
  util.router.all('/email/template.:ext?', (req, res) => {
    const input = Object.keys(req.body).length ? req.body : req.query || {};

    const templateSlug = input.templateSlug;

    const options = {
      preview: input.preview ? JSON.parse(input.preview) : false,
      data: input.data ? JSON.parse(input.data) : false,
      skipValidation: input.skipValidation ? JSON.parse(input.skipValidation) : false,
    };

    function renderTemplate(data = {}) {
      if (options.data) {
        util.sendResponse(res, data);
        return;
      }

      email.getTemplate(templateSlug, data, options)
        .then((template) => {
          util.sendResponse(res, template.html);
        }, util.handleError.bind(null, res));
    }

    if (input.payload) {
      renderTemplate(JSON.parse(input.payload));
      return;
    }

    if (input.entityId) {
      const entity = new Entity(util.getConfig(config, req));

      entity.entitiesById([input.entityId], true, false, true)
        .then((entities) => {
          entities = Entity.flattenValues(entities);

          renderTemplate(entities[0]);
        });

      return;
    }

    renderTemplate();
  });

  util.router.post('/email/subscribe.:ext?', (req, res) => {
    email.subscribe({
      email: req.body.email || req.query.email,
      name: req.body.name || req.query.name || '',
    })
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });
};
