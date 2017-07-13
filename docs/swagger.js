const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
// const swaggerUi = require('swagger-ui-dist');
const config = require('./config');

module.exports = (callback) => {
  const app = express();

  app.use('/docs', serveStatic(path.resolve(__dirname)));

  // app.use(serveStatic(swaggerUi.absolutePath()));
  // app.use(serveStatic(swaggerUi.getAbsoluteFSPath()));
  app.use(serveStatic(path.resolve(__dirname, '../node_modules/swagger-ui/dist')));

  app.listen(config.port, () => {
    console.log('Listening on port %d', config.port);

    callback(config);
  });
};
