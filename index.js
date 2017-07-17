const env = require('node-env-file');
const _ = require('lodash');
const express = require('express');
const Logger = require('le_node');
const lru = require('lru-cache');
const CircularJSON = require('circular-json');
const memwatch = require('memwatch-next');
const sizeof = require('object-sizeof');
const deepFreeze = require('deep-freeze');
const Jwt = require('ace-api/lib/jwt');

if (!process.env.ENVIRONMENT) {
  env('.env');
}

const defaultConfig = require('ace-api/config.default');

function AceApiServer (appOrRouter, serverConfig = {}, authMiddleware = null) {
  const config = deepFreeze(_.merge({}, defaultConfig, serverConfig));

  // Allowed development routes

  function isAllowedDevRoute (req) {
    const allowedRoutes = ['/token'];
    return config.environment === 'development' && allowedRoutes.indexOf(req.path) > -1;
  }

  // Default auth middleware

  function defaultAuthMiddleware (req, res, next) {
    if (isAllowedDevRoute(req)) {
      next();
      return;
    }

    if (!req.session.userId) {
      res.status(401);
      res.send({
        code: 401,
        message: 'Not authorised',
      });
      return;
    }

    next();
  }

  authMiddleware = authMiddleware || defaultAuthMiddleware;

  // Clone and extend config per request/session

  function omitUndefined(obj) {
    _.forIn(obj, function(value, key, obj) {
      if (_.isPlainObject(value)) {
        value = omitUndefined(value);

        if (_.keys(value).length === 0) {
          delete obj[key];
        }
      }

      if (_.isUndefined(value)) {
        delete obj[key];
      }
    });

    return obj;
  }

  function getConfig (config, req) {
    const configClone = _.mergeWith({}, JSON.parse(JSON.stringify(config)), omitUndefined(_.cloneDeep(config)));

    // configClone.db.name = req.session.dbName || req.session.slug || config.db.name;
    configClone.db.name = req.session.slug;

    return configClone;
  }

  // Cache

  let cache;

  if (config.cache.enabled) {
    cache = lru({
      max: config.cache.maxSize,
      length: (item) => {
        // const length = Buffer.byteLength(item, 'utf8')
        const length = sizeof(item);
        return length;
      },
      maxAge: config.cache.maxAge,
    });
  }

  // Cache middleware

  function cacheMiddleware (req, res, next) {
    if (config.cache.enabled) {
      const key = req.url.replace(`/${config.apiPrefix}`, '');
      const useCachedResponse = config.cache.enabled && cache.has(key) && req.session.role === 'guest'; // TODO: Replace 'guest' with constant

      if (useCachedResponse) {
        console.log('Cache usage:', Math.round((cache.length / config.cache.maxSize) * 100), '%');

        res.set('X-Cached-Response', true);
        res.status(200);
        res.send(cache.get(key));

        return;
      }
    }

    res.set('X-Cached-Response', false);

    next();
  }

  // Response helpers

  function handleError (res, error) {
    if (_.isObject(error)) {
      error = JSON.parse(CircularJSON.stringify(error));
    }
    const statusCode = error.statusCode || error.code || 500;
    const errorMessage = error.stack || error.error || error.message || error.body || error.data || error;
    res.status(typeof statusCode === 'string' ? 500 : statusCode);
    res.send({
      code: statusCode,
      message: errorMessage,
    });
    console.error(errorMessage);
  }

  function sendResponse (res, response) {
    res.status(200);
    res.send(response);
  }

  function cacheAndSendResponse (req, res, body) {
    if (config.cache.enabled && req.session.role === 'guest') { // TODO: Replace 'guest' with constant
      cache.set(req.url, body);
    }

    res.status(200);
    res.send(body);
  }

  // Header middleware

  function headerMiddleware (req, res, next) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    };

    if (req.headers['access-control-request-headers']) {
      headers['Access-Control-Allow-Headers'] = req.headers['access-control-request-headers'];
    }

    res.set(headers);

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  }

  // Session middleware

  const jwt = new Jwt(config);

  function sessionMiddleware (req, res, next) {
    if (isAllowedDevRoute(req)) {
      next();
      return;
    }

    const token = req.headers['x-api-token'] || req.query.apiToken || req.session.apiToken;

    if (!token) {
      res.status(401);
      res.send({
        code: 401,
        message: 'Not authorised, missing token',
      });
      return;
    }

    // TODO: check token hasn't been revoked

    try {
      const payload = jwt.verifyToken(token);

      req.session.userId = payload.userId;
      req.session.slug = payload.slug;
      req.session.role = payload.role;

    } catch (error) {
      res.status(401);
      res.send({
        code: 401,
        message: 'Not authorised, token verification failed',
      });
      return;
    }

    if (!req.session.slug) {
      res.status(401);
      res.send({
        code: 401,
        message: 'Not authorised, missing slug',
      });
      return;
    }

    if (!req.session.role) {
      req.session.role = 'guest';
    }

    if (req.session.userId) {
      res.set('X-User-Id', req.session.userId);
    }

    res.set('X-Environment', config.environment);
    res.set('X-Slug', req.session.slug);
    res.set('X-Role', req.session.role);

    next();
  }

  // Router

  const router = express.Router();

  function forceHttps (req, res, next) {
    if (
      (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') &&
      (req.headers['cf-visitor'] && JSON.parse(req.headers['cf-visitor']).scheme !== 'https') // Fix for Cloudflare/Heroku flexible SSL
    ) {
      res.redirect(301, `https://${req.headers.host}${req.path}`);
      return;
    }
    next();
  }

  if (config.environment === 'production' && config.forceHttps === true) {
    if (appOrRouter.enable) {
      appOrRouter.enable('trust proxy');
    }
    appOrRouter.use(forceHttps);
  }

  appOrRouter.use(`/${config.apiPrefix}`, headerMiddleware, sessionMiddleware, router);

  appOrRouter.get(`/${config.apiPrefix}`, (req, res) => {
    res.send('<pre> ______\n|A     |\n|  /\\  |\n| /  \\ |\n|(    )|\n|  )(  |\n|______|</pre>');
  });

  // Utilities

  const util = {
    router,
    cache,
    getConfig,
    authMiddleware,
    cacheMiddleware,
    handleError,
    sendResponse,
    cacheAndSendResponse,
  };

  // Debugging

  if (config.environment !== 'production') {
    // require('trace');
    require('clarify');
  }

  if (config.logentriesToken) {
    util.log = new Logger({
      token: config.logentriesToken,
    });
  }

  function afterResponse (req, res) {
    res.removeListener('finish', afterResponse);
    res.removeListener('close', afterResponse);

    if (req.query.heapdiff) {
      const diff = res._hd.end();
      diff.change.details.forEach((detail) => {
        if (/^(Array|Object|String)$/.test(detail.what)) {
          console.log('Heap diff', detail);
        }
      });
    }

    if (req.query.heapdump) {
      const heapdump = require('heapdump');
      heapdump.writeSnapshot((error, filename) => {
        console.log('Heap dump written to', filename);
      });
    }
  }

  if (config.environment !== 'production') {
    appOrRouter.use((req, res, next) => {
      res.on('finish', afterResponse.bind(null, req, res));
      res.on('close', afterResponse.bind(null, req, res));

      if (req.query.heapdiff) {
        res._hd = new memwatch.HeapDiff();
      }

      next();
    });
  }

  // Bootstrap API

  require('./routes/admin')(util, config);
  require('./routes/cache')(util, config);
  require('./routes/analytics')(util, config);
  require('./routes/auth')(util, config);
  require('./routes/debug')(util, config);
  require('./routes/ecommerce')(util, config);
  require('./routes/email')(util, config);
  require('./routes/embedly')(util, config);
  require('./routes/entity')(util, config);
  require('./routes/file')(util, config);
  require('./routes/metadata')(util, config);
  require('./routes/pdf')(util, config);
  require('./routes/settings')(util, config);
  require('./routes/shippo')(util, config);
  require('./routes/social')(util, config);
  require('./routes/stripe')(util, config);
  require('./routes/taxonomy')(util, config);
  require('./routes/token')(util, config);
  require('./routes/tools')(util, config);
  require('./routes/transcode')(util, config);
  require('./routes/upload')(util, config);
  require('./routes/zencode')(util, config);
}

module.exports = AceApiServer;
