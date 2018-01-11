const path = require('path');
const multiparty = require('connect-multiparty')();

module.exports = ({
  File,
  Flow,
  S3,
  Zencode,
  router,
  authMiddleware,
  permissionMiddleware,
  asyncMiddleware,
  getConfig,
  // handleResponse,
  handleError,
}) => {

  router.options(
    '/upload.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileCreate'),
    (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.status(200);
      res.send();
    }
  );

  router.post(
    '/upload.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileCreate'),
    multiparty,
    asyncMiddleware(async (req, res) => {
      const flow = new Flow(path.join('/tmp', req.session.slug));

      let options = {};

      try {
        options = JSON.parse(req.body.options);
      } catch (error) {
        //
      }

      const uploadResult = await flow.saveChunk(req.files, req.body.flowChunkNumber, req.body.flowChunkSize, req.body.flowTotalChunks, req.body.flowTotalSize, req.body.flowIdentifier, req.body.flowFilename);

      res.header('Access-Control-Allow-Origin', '*');

      if (uploadResult.status !== 'complete') {
        res.status(200).send(uploadResult);
        return;
      }

      const config = await getConfig(req.session.slug);

      const file = new File(config);

      const fileName = path.join('/tmp', req.session.slug, uploadResult.filename);

      try {

        if (/^(attachment)$/.test(options.type)) {
          const s3 = new S3(config);

          const prep = await s3.prepareUpload(config.aws.s3.bucket, fileName, req.session.slug);

          const _file = {
            location: 's3',
            original: prep.original,
            mediaType: 'attachment',
            uploaded: new Date(),
            uploadedBy: req.session.userId,
            metadata: {
              s3: prep.metadata,
            },
          };

          _file.id = (await file.create(_file)).id;

          await s3.upload(fileName, prep.uploadOptions);

          flow.deleteFile(uploadResult.filename);

          res.status(200);
          res.send(_file);
        }

        if (/^(video|audio)$/.test(options.type)) {
          const s3 = new S3(config);
          const zencode = new Zencode(config);

          let mediaType;
          let outputs;

          if (options.type === 'video') {
            mediaType = 'video';
            outputs = options.settings.videoOutputs;
          }
          if (options.type === 'audio') {
            mediaType = 'audio';
            outputs = options.settings.audioOutputs;
          }

          const prep = await s3.prepareUpload(config.zencoder.s3.bucket, fileName, req.session.slug);

          const _file = {
            location: 's3',
            original: prep.original,
            mediaType,
            uploaded: new Date(),
            uploadedBy: req.session.userId,
            metadata: {
              s3: prep.metadata,
              zencoder: {},
            },
          };

          _file.id = (await file.create(_file)).id;

          const jobResult = await zencode.createJob(fileName, {
            mediaType,
            outputs,
            metadata: prep.metadata,
            uploadOptions: prep.uploadOptions,
          }, req.session.slug);

          _file.metadata.zencoder.job = jobResult.zencoderJob;

          zencode.checkJob(jobResult.zencoderJob.id, _file.id);

          await flow.deleteFile(uploadResult.filename);

          res.status(200);
          res.send(_file);
        }

      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.get(
    '/upload.:ext?',
    authMiddleware,
    permissionMiddleware.bind(null, 'fileCreate'),
    asyncMiddleware(async (req, res) => {
      const flow = new Flow(path.join('/tmp', req.session.slug));

      try {
        await flow.checkChunk(req.query.flowChunkNumber, req.query.flowChunkSize, req.query.flowTotalSize, req.query.flowIdentifier, req.query.flowFilename);

        res.header('Access-Control-Allow-Origin', '*');
        res.status(200);
        res.send();

      } catch (error) {
        res.header('Access-Control-Allow-Origin', '*');
        res.status(204);
        res.send();
      }
    })
  );

};
