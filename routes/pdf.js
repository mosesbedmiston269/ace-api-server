const Pdf = require('ace-api/lib/pdf');
const Helpers = require('ace-api/lib/helpers');

module.exports = (config) => {
  const pdfUrl = `${config.assist.url}/pdf/download`;

  config.__router.get('/pdf/view/:template?/:id?.:ext?', (req, res) => {
    const pdf = new Pdf(config.__db(req), config.pdf.templates, pdfUrl);

    pdf.getPayload(req.params.template || req.query.template, req.params.id || req.query.id)
      .then((payload) => {
        pdf.getPdf(payload)
          .then((pdf) => {
            res.type('application/pdf');

            res.status(200);
            res.send(pdf);
          }, config.__handleError.bind(null, res));
      }, config.__handleError.bind(null, res));
  });

  config.__router.get('/pdf/download/:template?/:id?.:ext?', (req, res) => {
    const pdf = new Pdf(config.__db(req), config.pdf.templates, pdfUrl);

    pdf.getPayload(req.params.template || req.query.template, req.params.id || req.query.id)
      .then((payload) => {
        pdf.getPdf(payload)
          .then((pdf) => {
            res.attachment(payload.fileName || 'download.pdf');

            res.status(200);
            res.send(pdf);
          }, config.__handleError.bind(null, res));
      }, config.__handleError.bind(null, res));
  });

  config.__router.get('/pdf/payload/:template?/:id?.:ext?', (req, res) => {
    const pdf = new Pdf(config.__db(req), config.pdf.templates, pdfUrl);

    pdf.getPayload(req.params.template || req.query.template, req.params.id || req.query.id)
      .then((payload) => {
        res.status(200);
        res.json(payload);
      }, config.__handleError.bind(null, res));
  });

  config.__router.get('/pdf/:template?/:id?.:ext?', (req, res) => {
    const pdf = new Pdf(config.__db(req), config.pdf.templates, pdfUrl);

    pdf.getPayload(req.params.template || req.query.template, req.params.id || req.query.id)
      .then((payload) => {
        payload = Helpers.stringify(payload);

        res.status(200);
        res.send(`
          <body onload='form.submit()'>
            <form id='form' method='POST' action='${pdfUrl}' target='_self'>
              <input type='hidden' name='payload' value='${payload}' />
            </form>
          </body>
        `);
      }, config.__handleError.bind(null, res));
  });
};
