const env = require('node-env-file');

if (!process.env.ENVIRONMENT) {
  env('.env');
}
const API_PORT = process.env.PORT || 5000;
const DOCS_PORT = process.env.DOCS_PORT || 3000;

module.exports = {
  port: DOCS_PORT,
  swaggerDefinition: {
    info: {
      title: 'ACE API', // Title (required)
      version: '0.0.0', // Version (required)
    },
    host: `localhost:${API_PORT}`,
    basePath: '/api/latest',
    schemes: ['http', 'https'],
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Api-Token',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'API key is missing or invalid',
        headers: {
          'WWW_Authenticate': {
            type: 'string',
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};
