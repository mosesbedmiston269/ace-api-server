const Shippo = require('ace-api/lib/shippo');

module.exports = (util, config) => {
  const shippo = new Shippo(config);

  util.router.all('/shippo/quote.:ext?', (req, res) => {
    const address = req.body.address || JSON.parse(req.params.address);
    const parcel = req.body.parcel || JSON.parse(req.params.parcel);

    shippo.getQuote(address, parcel)
      .then(util.cacheAndSendResponse.bind(null, req, res), util.handleError.bind(null, res));
  });
};
