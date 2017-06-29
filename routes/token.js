const jwt = require('jsonwebtoken');

module.exports = (util, config) => {

  util.router.get('/token.:ext?', util.authMiddleware, (req, res) => {
    const token = jwt.sign({
      slug: req.session.slug,
    }, config.auth.tokenSecret, {
      expiresIn: req.params.expires || 7200,
    });

    res.status(200).send(token);
  });

};
