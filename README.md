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

### Useful

    # Heroku rebuild (similar to rm -rf node_modules locally)
    $ heroku repo:purge_cache -a appname && \
        git commit --allow-empty -m "rebuild" && \
        git push heroku master
