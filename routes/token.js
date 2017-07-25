const _ = require('lodash');
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
   *      - name: role
   *        description: Role for token payload (super user only)
   *        in: query
   *        required: false
   *        type: number
   *      - name: slug
   *        description: Slug for token payload (super user only)
   *        in: query
   *        required: false
   *        type: number
   *      - name: userId
   *        description: User ID for token payload (super user only)
   *        in: query
   *        required: false
   *        type: number
   *      - name: expiresIn
   *        description: Duration of token in seconds
   *        in: query
   *        required: false
   *        type: number
   *    responses:
   *      200:
   *        description: Token
   */

  util.router.get('/token.:ext?', util.authMiddleware, (req, res) => {
    const payload = {
      role: req.session.role,
      slug: req.session.slug,
      userId: req.session.userId,
    };

    if (req.session.role === 'super' || config.environment === 'development') {
      payload.role = req.query.role || req.session.role || config.dev.role;
      payload.slug = req.query.slug || req.session.slug || config.dev.slug;
      if (payload.role !== 'guest') {
        payload.userId = req.query.userId || req.session.userId || config.dev.userId;
      }
    }

    let options = _.pickBy(req.query, (value, key) => {
      return /^(expiresIn|notBefore|audience|issuer|jwtid|subject|noTimestamp|header)$/.test(key);
    });

    options = _.mapValues(options, (value) => {
      if (!isNaN(+value)) { // Check if value is a numeric string
        return +value; // Convert numeric string to number
      }
      return value;
    });

    const jwt = new Jwt(config);

    const token = jwt.signToken(payload, options);

    req.session.apiToken = token;

    res.status(200);
    res.send({
      token,
      payload,
      options,
    });
  });

};
