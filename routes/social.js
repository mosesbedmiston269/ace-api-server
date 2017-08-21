const Promise = require('bluebird');
const ClientConfig = require('ace-api/lib/client-config');
const Instagram = require('ace-api/lib/instagram');
const Twitter = require('twitter');

module.exports = (util, config) => {

  const instagram = new Instagram({
    client_id: config.instagram.clientId,
  });

  const twitter = Promise.promisifyAll(new Twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: config.twitter.accessTokenKey,
    access_token_secret: config.twitter.accessTokenSecret,
  }));

  const instagramAccessTokenMap = {};

  util.router.get(
    /\/social\/twitter\/([^/]+)\/?(.+)?/,
    util.cacheMiddleware,
    (req, res) => {
      const method = req.params[0];
      const params = req.params[1].split('/').filter(param => param !== '');

      twitter[`${method}Async`](params.join('/'), req.query)
        .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
    }
  );

  util.router.get(
    /\/social\/instagram\/([^/]+)\/?(.+)?/,
    util.cacheMiddleware,
    util.asyncMiddleware(async (req, res) => {
      const method = req.params[0];
      const params = req.params[1].split('/').filter(param => param !== '');

      const reqConfig = util.getConfig(config, req.session.slug);

      if (!instagramAccessTokenMap[req.session.slug]) {
        const cc = new ClientConfig(reqConfig);

        try {
          const clientConfig = await cc.get();
          instagramAccessTokenMap[req.session.slug] = clientConfig.provider.instagram.access_token;
        } catch (error) {
          util.handleError(res, new Error('Instagram: access_token required'));
          return;
        }
      }

      req.query.access_token = instagramAccessTokenMap[req.session.slug];

      instagram[method](params.join('/'), req.query)
        .then((response) => {
          const result = JSON.parse(response);
          try {
            delete result.pagination.next_url;
          } catch (error) {
            //
          }
          util.cacheAndSendResponse(req, res, result);
        }, util.handleError.bind(null, res));
    })
  );

};
