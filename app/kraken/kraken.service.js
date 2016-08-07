/* ===== NPM  DEPENDENCIES ===== */
const krakenAPI = require("kraken-api");

/* ===== EXPOSE `chart()` ===== */
module.exports.exchangeService = exchangeService;

function exchangeService(apiKey, apiSecret, apiCall, options) {
  const kraken = new krakenAPI(apiKey, apiSecret);

  return new Promise(function (fulfill, reject) {
    kraken.api(apiCall, options, function(error, data) {
      (error) ? reject(error) : fulfill(data.result);
    });
  });
}