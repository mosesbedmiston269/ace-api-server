module.exports = ({
  Pdf,
  Helpers,
  router,
  asyncMiddleware,
  getConfig,
  handleError,
}) => {

  router.get(
    '/pdf/view.:ext?',
    asyncMiddleware(async (req, res) => {
      const pdf = new Pdf(await getConfig(req.session.slug));

      pdf.getPayload(req.query.template, req.query.id, req.session.role)
        .then((payload) => {
          pdf.getPdf(payload)
            .then((pdf) => {
              res.type('application/pdf');
              res.status(200);
              res.send(pdf);
            }, handleError.bind(null, req, res));
        }, handleError.bind(null, req, res));
    })
  );

  router.get(
    '/pdf/download.:ext?',
    asyncMiddleware(async (req, res) => {
      const pdf = new Pdf(await getConfig(req.session.slug));

      pdf.getPayload(req.query.template, req.query.id, req.session.role)
        .then((payload) => {
          pdf.getPdf(payload)
            .then((pdf) => {
              res.attachment(payload.fileName || 'download.pdf');
              res.status(200);
              res.send(pdf);
            }, handleError.bind(null, req, res));
        }, handleError.bind(null, req, res));
    })
  );

  router.get(
    '/pdf/payload.:ext?',
    asyncMiddleware(async (req, res) => {
      const pdf = new Pdf(await getConfig(req.session.slug));

      pdf.getPayload(req.query.template, req.query.id, req.session.role)
        .then((payload) => {
          res.status(200);
          res.json(payload);
        }, handleError.bind(null, req, res));
    })
  );

  router.get(
    '/pdf/submit.:ext?',
    asyncMiddleware(async (req, res) => {
      const config = await getConfig(req.session.slug);

      const pdf = new Pdf(config);

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
        }, handleError.bind(null, req, res));
    })
  );
};
