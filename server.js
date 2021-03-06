const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me';

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

function Serve (config = {}, listen = true) {
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

  if (listen) {
    const server = http.createServer(app);
    server.on('listening', () => {
      console.log(`http://${HOST}:${PORT}`);
    });
    server.listen(PORT);
  }

  return app;
}

module.exports = Serve;
