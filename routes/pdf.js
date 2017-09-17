const Pdf = require('ace-api/lib/pdf');
const Helpers = require('ace-api/lib/helpers');

module.exports = (util, config) => {
  util.router.get('/pdf/view.:ext?', (req, res) => {
    const pdf = new Pdf(util.getConfig(config, req.session.slug));

    pdf.getPayload(req.query.template, req.query.id, req.session.role)
      .then((payload) => {
        pdf.getPdf(payload)
          .then((pdf) => {
            res.type('application/pdf');

            res.status(200);
            res.send(pdf);
          }, util.handleError.bind(null, res));
      }, util.handleError.bind(null, res));
  });

  util.router.get('/pdf/download.:ext?', (req, res) => {
    const pdf = new Pdf(util.getConfig(config, req.session.slug));

    pdf.getPayload(req.query.template, req.query.id, req.session.role)
      .then((payload) => {
        pdf.getPdf(payload)
          .then((pdf) => {
            res.attachment(payload.fileName || 'download.pdf');

            res.status(200);
            res.send(pdf);
          }, util.handleError.bind(null, res));
      }, util.handleError.bind(null, res));
  });

  util.router.get('/pdf/payload.:ext?', (req, res) => {
    const pdf = new Pdf(util.getConfig(config, req.session.slug));

    pdf.getPayload(req.query.template, req.query.id, req.session.role)
      .then((payload) => {
        res.status(200);
        res.json(payload);
      }, util.handleError.bind(null, res));
  });

  util.router.get('/pdf/submit.:ext?', (req, res) => {
    const pdf = new Pdf(util.getConfig(config, req.session.slug));

    pdf.getPayload(req.query.template, req.query.id, req.session.role)
      .then((payload) => {
        payload = Helpers.stringify(payload);

        res.status(200);
        res.send(`
          <body onload='form.submit()'>
            <form id='form' method='POST' action='${config.assist.url}/${req.session.slug}/pdf/download' target='_self'>
              <input type='hidden' name='payload' value='${payload}' />
            </form>
          </body>
        `);
      }, util.handleError.bind(null, res));
  });
};
