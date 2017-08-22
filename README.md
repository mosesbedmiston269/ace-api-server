# ACE API Server

RESTish API Server module used by ACE projects

### Documentation

Documentation is currently a work in progress.

http://petstore.swagger.io/?url=https://rawgit.com/StudioThomas/ace-api-server/master/docs/api.json#/

### Environment Variables

    ENVIRONMENT=development|testing|production
    DEBUG=false # Change to nano etc
    CACHE_ENABLED=false

    DB_URL=

    API_PREFIX=

    SESSION_SECRET=
    AUTH_TOKEN_SECRET=

    DEV_SLUG=
    DEV_USER_ID=
    DEV_ROLE=

    METER_CLOUDANT_REQUEST=false
    METER_CLOUDANT_INTERVAL=false

    ASSIST_URL=
    ASSIST_USERNAME=
    ASSIST_PASSWORD=

    EMBEDLY_API_KEY=

    LOGENTRIES_TOKEN=

    AWS_ACCESS_KEY_ID=
    AWS_ACCESS_KEY_SECRET=

    REDIS_HOST=
    REDIS_PORT=
    REDIS_PASSWORD=

    STRIPE_CLIENT_ID=
    STRIPE_CLIENT_SECRET=
    STRIPE_API_KEY=

    INSTAGRAM_CLIENT_ID=
    INSTAGRAM_CLIENT_SECRET=

    VIMEO_CLIENT_ID=
    VIMEO_CLIENT_SECRET=

    AWS_S3_BUCKET=

    ZENCODER_API_KEY=
    ZENCODER_S3_BUCKET=
    ZENCODER_S3_CREDENTIALS=

    TWITTER_ACCESS_TOKEN_KEY=
    TWITTER_ACCESS_TOKEN_SECRET=
    TWITTER_CONSUMER_KEY=
    TWITTER_CONSUMER_SECRET=

    GOOGLE_APIS_JSON_KEY=

### Useful

    # Heroku rebuild (similar to rm -rf node_modules locally)
    $ heroku repo:purge_cache -a appname && \
        git commit --allow-empty -m "rebuild" && \
        git push heroku master
