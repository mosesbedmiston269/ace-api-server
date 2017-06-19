const env = require('node-env-file');

if (!process.env.ENVIRONMENT) {
  env('.env');
}

const PORT = process.env.PORT || 5000;

const express = require('express');
const http = require('http');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const session = require('express-session');

const config = require('ace-api/config.default');

config.apiPrefix = 'api/latest';

const AceApiServer = require('./index');

const app = express();
app.use(errorHandler());
app.use(logger('dev'));
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
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

AceApiServer(app, config);

const server = http.createServer(app);
server.on('listening', () => {
  console.log(`Express server listening on port ${PORT}`);
});
server.listen(PORT);
