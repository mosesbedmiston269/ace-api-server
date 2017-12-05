module.exports = ({
  File,
  S3,
  router,
  authMiddleware,
  permissionMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

  router.get(
    '/file/search.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileRead'),
    asyncMiddleware(async (req, res) => {
      const file = new File(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await file.search(req.query));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.post(
    '/file.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileCreate'),
    asyncMiddleware(async (req, res) => {
      const file = new File(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await file.create(req.body.file));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.delete(
    '/file.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileDelete'),
    asyncMiddleware(async (req, res) => {
      const file = new File(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await file.delete(req.body.file || req.body.files, req.session.slug));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.delete(
    '/file/trashed.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileDelete'),
    asyncMiddleware(async (req, res) => {
      const file = new File(await getConfig(req.session.slug));

      try {
        handleResponse(req, res, await file.delete('trashed', req.session.slug));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/file/download/s3.:ext?',
    asyncMiddleware(async (req, res) => {
      const s3 = new S3(await getConfig());

      s3.getSignedUrl(req.query.bucket, req.query.key, req.query.filename)
        .then((url) => {
          res.status(200);

          if (req.query.redirect && !JSON.parse(req.query.redirect)) {
            res.send(url);
            return;
          }

          res.redirect(url);
        }, handleError.bind(null, req, res));
    })
  );

  router.get(
    '/file/s3/:bucket/:slug/:key/:filename',
    asyncMiddleware(async (req, res) => {
      const s3 = new S3(await getConfig());

      s3.getObject(req.params.bucket, `${req.params.slug}/${req.params.key}`)
        .then((result) => {
          res.status(200);
          res.type(req.params.filename.split('.').splice(-1)[0]);

          if (req.query.download && JSON.parse(req.query.download)) {
            res.attachment(req.params.filename);
          }

          res.send(result.Body);
        }, handleError.bind(null, req, res));
    })
  );
};
