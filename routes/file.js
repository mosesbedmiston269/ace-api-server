const Auth = require('ace-api/lib/auth');
const File = require('ace-api/lib/file');
const S3 = require('ace-api/lib/s3');

module.exports = (util, config) => {

  util.router.get('/file/search.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileRead'), (req, res) => {
    const file = new File(util.getConfig(config, req));

    file.search(req.query)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.post('/file.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileCreate'), (req, res) => {
    const file = new File(util.getConfig(config, req));

    file.create(req.body.file)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/file.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileDelete'), (req, res) => {
    const file = new File(util.getConfig(config, req));

    file.delete(req.body.file || req.body.files, req.session.slug)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.delete('/file/trashed.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileDelete'), (req, res) => {
    const file = new File(util.getConfig(config, req));

    file.delete('trashed', req.session.slug)
      .then(util.sendResponse.bind(null, res), util.handleError.bind(null, res));
  });

  util.router.get('/file/download/s3.:ext?', (req, res) => {
    const s3 = new S3(config);

    s3.getSignedUrl(req.query.bucket, req.query.key, req.query.filename)
      .then((url) => {
        res.status(200);

        if (req.query.redirect && !JSON.parse(req.query.redirect)) {
          res.send(url);
          return;
        }

        res.redirect(url);
      }, util.handleError.bind(null, res));
  });

  // util.router.all('/file/s3/:filename', (req, res) => {
  //   const s3 = new S3(config);

  //   s3.getObject(req.query.bucket, req.query.key)
  //     .then((result) => {
  //       res.type(req.params.filename.split('.').splice(-1)[0]);

  //       if (req.query.download && JSON.parse(req.query.download)) {
  //         res.attachment(req.params.filename);
  //       }

  //       res.send(result.Body);
  //     }, util.handleError.bind(null, res));
  // });

  util.router.all('/file/s3/:bucket/:slug/:key/:filename', (req, res) => {
    const s3 = new S3(config);

    s3.getObject(req.params.bucket, `${req.params.slug}/${req.params.key}`)
      .then((result) => {
        res.type(req.params.filename.split('.').splice(-1)[0]);

        if (req.query.download && JSON.parse(req.query.download)) {
          res.attachment(req.params.filename);
        }

        res.send(result.Body);
      }, util.handleError.bind(null, res));
  });
};
