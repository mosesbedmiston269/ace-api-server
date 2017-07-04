const Jwt = require('ace-api/lib/jwt');

module.exports = (util, config) => {

  /**
   * @swagger
   * /token:
   *  get:
   *    tags:
   *      - token
   *    summary: Get JWT
   *    description: Get Json Web Token (JWT) for API access
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: expires
   *        description: Expiration length of token in seconds
   *        in: query
   *        required: false
   *        type: number
   *    responses:
   *      200:
   *        description: Token
   */

  util.router.get('/token.:ext?', util.authMiddleware, (req, res) => {
    const payload = {
      userId: req.session.userId,
      slug: req.session.slug,
      role: req.session.role,
    };

    if (config.environment === 'development') {
      payload.userId = config.dev.userId;
      payload.slug = config.dev.slug;
      payload.role = config.dev.role;
    }

    const jwt = new Jwt(config);

    const token = jwt.generateToken(payload, req.query.expires || 7200);

    res.status(200);
    res.send({
      token,
      payload,
    });
  });

};
