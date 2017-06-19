const Shippo = require('ace-api/lib/shippo');

module.exports = (config) => {
  const shippo = new Shippo(config);

  config.__router.all('/shippo/quote.:ext?', (req, res) => {
    const address = req.body.address || JSON.parse(req.params.address);
    const parcel = req.body.parcel || JSON.parse(req.params.parcel);

    shippo.getQuote(address, parcel)
      .then(config.__cacheAndSendResponse.bind(null, req, res), config.__handleError.bind(null, res));
  });
};
