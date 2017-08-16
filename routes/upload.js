const path = require('path');
const multiparty = require('connect-multiparty')();
const Auth = require('ace-api/lib/auth');
const Flow = require('ace-api/lib/flow');
const File = require('ace-api/lib/file');
const S3 = require('ace-api/lib/s3');
const Zencode = require('ace-api/lib/zencode');

module.exports = (util, config) => {

  util.router.options('/upload.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileCreate'), (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).send();
  });

  util.router.post('/upload.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileCreate'), multiparty, (req, res) => {
    const flow = new Flow(path.join('/tmp', req.session.slug));

    let options = {};

    try {
      options = JSON.parse(req.body.options);
    } catch (error) {
      //
    }

    flow.saveChunk(req.files, req.body.flowChunkNumber, req.body.flowChunkSize, req.body.flowTotalChunks, req.body.flowTotalSize, req.body.flowIdentifier, req.body.flowFilename)
      .then((uploadResult) => {
        res.header('Access-Control-Allow-Origin', '*');

        if (uploadResult.status !== 'complete') {
          res.status(200).send(uploadResult);
          return;
        }

        const file = new File(util.getConfig(config, req.session.slug));
        const fileName = path.join('/tmp', req.session.slug, uploadResult.filename);

        if (options.type === 'field' && options.fieldType === 'attachment') {
          const s3 = new S3(config);

          s3.prepareUpload(config.aws.s3.bucket, fileName, req.session.slug)
            .then((prepResult) => {
              const _file = {
                location: 's3',
                original: prepResult.original,
                mediaType: 'attachment',
                uploaded: new Date(),
                uploadedBy: req.session.userId,
                metadata: {
                  s3: prepResult.metadata,
                },
              };

              file.create(_file)
                .then((file) => {
                  _file.id = file.id;

                  s3.upload(fileName, prepResult.uploadOptions)
                    .then((s3Upload) => {
                      res.status(200).send(_file);

                      flow.deleteFile(uploadResult.filename);
                    });
                });
            })
            .catch(util.handleError.bind(null, res));
        }

        if (options.type === 'field' && /^(video|audio)$/.test(options.fieldType)) {
          const s3 = new S3(config);
          const zencode = new Zencode(util.getConfig(config, req.session.slug));

          let mediaType;
          let outputs;

          if (options.fieldType === 'video') {
            mediaType = 'video';
            outputs = options.settings.videoOutputs;
          }
          if (options.fieldType === 'audio') {
            mediaType = 'audio';
            outputs = options.settings.audioOutputs;
          }

          s3.prepareUpload(config.zencoder.s3.bucket, fileName, req.session.slug)
            .then((prepResult) => {
              const _file = {
                location: 's3',
                original: prepResult.original,
                mediaType,
                uploaded: new Date(),
                uploadedBy: req.session.userId,
                metadata: {
                  s3: prepResult.metadata,
                  zencoder: {},
                },
              };

              file.create(_file)
                .then((file) => {
                  _file.id = file.id;

                  zencode.createJob(fileName, {
                    mediaType,
                    outputs,
                    metadata: prepResult.metadata,
                    uploadOptions: prepResult.uploadOptions,
                  }, req.session.slug)
                    .then((jobResult) => {
                      _file.metadata.zencoder.job = jobResult.zencoderJob;

                      zencode.checkJob(jobResult.zencoderJob.id, file.id);

                      flow.deleteFile(uploadResult.filename)
                        .then(() => {
                          res.status(200).send(_file);
                        }, (error) => {
                          console.error(error);

                          res.status(200).send(_file);
                        });
                    });
                });
            })
            .catch(util.handleError.bind(null, res));
        }

      }, util.handleError.bind(null, res));
  });

  util.router.get('/upload.:ext?', util.authMiddleware, Auth.requirePermission.bind(null, 'fileCreate'), (req, res) => {
    const flow = new Flow(path.join('/tmp', req.session.slug));

    flow.checkChunk(req.query.flowChunkNumber, req.query.flowChunkSize, req.query.flowTotalSize, req.query.flowIdentifier, req.query.flowFilename)
      .then(() => {
        res.header('Access-Control-Allow-Origin', '*');
        res.status(200).send();
      }, () => {
        res.header('Access-Control-Allow-Origin', '*');
        res.status(204).send();
      });
  });

  // util.router.get('/download/:identifier.:ext?', (req, res) => {
  //   flow.write(req.param.identifier, res)
  // })

};
