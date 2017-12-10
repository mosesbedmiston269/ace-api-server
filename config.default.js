const config = {
  environment: process.env.ENVIRONMENT || 'development',

  apiPrefix: process.env.API_PREFIX || '',

  forceHttps: process.env.FORCE_HTTPS ? JSON.parse(process.env.FORCE_HTTPS) : false,

  cache: {
    enabled: process.env.CACHE_ENABLED ? JSON.parse(process.env.CACHE_ENABLED) : false,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || 128, 10) * 1000 * 1000, // ~128mb
    maxAge: parseInt(process.env.CACHE_MAX_AGE || 30, 10) * 60 * 1000, // 30mins
  },

  logentriesToken: process.env.LOGENTRIES_TOKEN,
};

module.exports = config;
