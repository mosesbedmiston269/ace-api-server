const env = require('node-env-file');
const _ = require('lodash');
const express = require('express');
const Logger = require('le_node');
const lru = require('lru-cache');
const jwt = require('jsonwebtoken');
const CircularJSON = require('circular-json');
const memwatch = require('memwatch-next');
const sizeof = require('object-sizeof');

if (!process.env.ENVIRONMENT) {
  env('.env');
}

const defaultConfig = require('ace-api/config.default');

function defaultAuthMiddleware (req, res, next) {
  if (!req.session) {
    res.status(500).send('Session not initialised, please refresh');
    return;
  }

  if (!req.session.userAuthorised) {
    res.status(401).send('Not authorised');
    return;
  }

  next();
}

function AceApiServer (appOrRouter, config = {}, authMiddleware = defaultAuthMiddleware) {
  config = _.merge({}, defaultConfig, config);

  // Session middleware

  function sessionMiddleware (req, res, next) {
    if (config.environment !== 'production') {
      if (!req.session.slug) {
        req.session.slug = config.dev.slug;
      }
      if (!req.session.dbName) {
        req.session.dbName = config.dev.dbName;
      }
      req.session.email = config.dev.email;
      req.session.role = config.dev.role;
      req.session.superUser = config.dev.superUser;

      req.session.userAuthorised = true;
    }

    res.set('X-Environment', config.environment);
    res.set('X-Slug', req.session.slug ? req.session.slug : config.db.name);

    // res.set('X-Role', req.session.role)
    // res.set('X-Super-User', req.session.superUser)
    // res.set('X-User-Authorised', req.session.userAuthorised ? true : false)

    next();
  }

  // Clone and extend config per request/session

  function getConfig (config, req) {
    const configClone = _.clone(config);
    configClone.db.name = req.session.dbName || req.session.slug || config.db.name;
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
    req.session.guestAuthorised = req.session.guestAuthorised ? req.session.guestAuthorised : config.forceAuth;

    if (req.headers.token || req.session.token) {
      try {
        const payload = jwt.verify(req.headers.token || req.session.token, config.auth.tokenSecret);

        if (payload.slug === config.slug) {
          req.session.guestAuthorised = true;
        } else {
          console.error('Token error: slug mismatch');
        }
      } catch (error) {
        console.error('Token error: expired');
      }
    }

    res.set('X-Guest-Authorised', req.session.guestAuthorised);
    res.set('X-From-Cache', false);

    if (config.cache.enabled) {
      const key = req.url.replace(`/${config.apiPrefix}`, '');
      const fromCache = config.cache.enabled && cache.has(key) && req.session.guestAuthorised !== true;

      if (fromCache) {
        console.log('Cache usage:', Math.round((cache.length / config.cache.maxSize) * 100), '%');

        res.set('X-From-Cache', true);
        res.status(200).send(cache.get(key));

        return;
      }
    }

    next();
  }

  // Response helpers

  function handleError (res, error) {
    if (_.isObject(error)) {
      error = JSON.parse(CircularJSON.stringify(error));
    }
    const statusCode = error.statusCode || error.code || 500;
    const errorMessage = error.stack || error.error || error.message || error.body || error.data || error;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(typeof statusCode === 'string' ? 500 : statusCode);
    res.send({
      code: statusCode,
      message: errorMessage,
    });
    console.error(errorMessage);
  }

  function sendResponse (res, response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200);
    res.send(response);
  }

  function cacheAndSendResponse (req, res, body) {
    if (config.cache.enabled) {
      if (req.session.guestAuthorised && cache.has(req.url)) {
        cache.del(req.url);
      } else {
        cache.set(req.url, body);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200);
    res.send(body);
  }

  // Router

  const router = express.Router();

  appOrRouter.use(`/${config.apiPrefix}`, sessionMiddleware, router);

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
