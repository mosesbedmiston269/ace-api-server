const Promise = require('bluebird');
const Settings = require('ace-api/lib/settings');
const Instagram = require('ace-api/lib/instagram');
const Twitter = require('twitter');

const co = Promise.coroutine;

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

  let instagramSettings;

  util.router.get(/\/social\/twitter\/([^/]+)\/?(.+)?/, util.cacheMiddleware, (req, res) => {
    const method = req.params[0];
    const params = req.params[1].split('/').filter(param => param !== '');

    twitter[`${method}Async`](params.join('/'), req.query)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });

  util.router.get(/\/social\/instagram\/([^/]+)\/?(.+)?/, util.cacheMiddleware, co(function* (req, res) {
    const method = req.params[0];
    const params = req.params[1].split('/').filter(param => param !== '');

    if (!instagramSettings) {
      const settings = new Settings(util.getConfig(config, req));

      instagramSettings = yield settings.settings().then(settings => settings.instagram);

      if (!instagramSettings.access_token) {
        util.handleError(res, new Error('Instagram: access_token required'));
        return;
      }
    }

    req.query.access_token = instagramSettings.access_token;

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
  }));

};
