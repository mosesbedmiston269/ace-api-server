const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET;

const express = require('express');
const http = require('http');
const logger = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const session = require('express-session');

const AceApiServer = require('./index');

function Serve (config = {}) {
  const app = express();
  app.use(helmet());
  app.use(errorHandler());
  app.use(logger('tiny'));
  app.use(cookieParser());
  app.use(bodyParser.json({
    limit: '50mb',
  }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
  }));
  app.use(methodOverride());
  app.use(session({
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 7200,
    },
    resave: true,
    saveUninitialized: true,
  }));

  AceApiServer(app, config);

  const server = http.createServer(app);
  server.on('listening', () => {
    console.log(`Express server listening on port ${PORT}`);
  });
  server.listen(PORT);
}

module.exports = Serve;
