const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const formidable = require('formidable');

module.exports = ({
  Transcode,
  router,
  authMiddleware,
  asyncMiddleware,
  getConfig,
  handleResponse,
  handleError,
}) => {

  const uploads = {};

  router.get(
    '/transcode/job.:ext?',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const transcode = new Transcode(await getConfig());

      try {
        handleResponse(req, res, await transcode.getJob(req.query.id));
      } catch (error) {
        handleError(req, res, error);
      }
    })
  );

  router.options(
    '/transcode/upload.:ext?',
    (req, res) => {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      });

      res.status(200).end();
    }
  );

  router.post(
    '/transcode/upload.:ext?',
    asyncMiddleware(async (req, res) => {
      const options = JSON.parse(req.headers['upload-options']);

      const transcode = new Transcode(await getConfig());

      const form = new formidable.IncomingForm();

      form.uploadDir = '/tmp';

      form.parse(req, async (err, fields, files) => {
        const file = files.file;
        const name = fields.name;
        const chunk = parseInt(fields.chunk, 10);
        const chunks = parseInt(fields.chunks, 10);

        if (!uploads[name]) {
          uploads[name] = {
            originalFileName: req.headers['file-name'],
            path: [],
            data: [],
          };
        }

        uploads[name].path.push(file.path);

        try {
          const fileData = await fs.readFileAsync(file.path);

          uploads[name].data.push(fileData);

          if (chunk < chunks - 1) {
            res.status(200).send({
              jsonrpc: '2.0',
              id: name,
            });
          }

          if (chunk === chunks - 1) {
            const info = await transcode.uploadToS3(Buffer.concat(uploads[name].data), {
              slug: options.slug,
              fileName: uploads[name].originalFileName,
            });

            await Promise.all(uploads[name].path.map(path => fs.unlinkAsync(path)));

            delete uploads[name];

            handleResponse(req, res, info);
          }

        } catch (error) {
          handleError(req, res, error);
        }
      });
    })
  );

};
