/* =====  DEPENDENCIES ===== */
const _ = require("lodash");
const fs = require("fs");
const fileExists = require("file-exists");
const jsonFile = require("jsonfile");
const q = require("q");
const print = require("./run.config.js").print;

//////////

module.exports.storeConfig = storeConfig;
module.exports.loadConfigIfExists = loadConfigIfExists;
module.exports.deleteConfig = deleteConfig;
module.exports.printConfig = printConfig;
module.exports.validateConfig = validateConfig;
module.exports.isValidCurrency = isValidCurrency;

//////////

function isValidCurrency(currency) {
  let currencies = ["CAD","EUR","GBP","JPY","USD","CAD","EUR","USD","XBT","LTC",
    "NMC","XDG","XLM","XRP"];
  return contains(currencies, currency);
}

function validateConfig(userConfig) {
  let deferred = q.defer();

  if (!userConfig.updateIntervall) {
    configError("updateIntervall");
    deferred.reject(false);
  } else if (!userConfig.zCurrency) {
    configError("zCurrency");
    deferred.reject(false);
  } else if (!userConfig.chart.width) {
    configError("chartWidth");
    deferred.reject(false);
  } else if (!userConfig.chart.height) {
    configError("chartHeight");
    deferred.reject(false);
  } else {
    deferred.resolve(true);
  }

  return deferred.promise;
}

function storeConfig(file, data) {
  return jsonFile.writeFile(file, data, function(error) {
    if (error) {
      print.error("Could no write into file \n" + error);
      process.exit();
    }
  });
}

function loadConfigIfExists(file) {
  let deferred = q.defer();
  (fileExists(file)) ? deferred.resolve(jsonFile.readFileSync(file)) : deferred.reject(new Error("File does not exist"));
  return deferred.promise;
}

function deleteConfig(file) {
  let deferred = q.defer();

  if (fileExists(file)) {
    print.info("Reset user config");
    deferred.resolve(fs.unlinkSync(file));
  } else {
    print.error("User config does not exist");
    deferred.reject(new Error("File could not be found"));
  }

  return deferred.promise;
}

function printConfig(userConfig) {
  print.info("Currently loaded configuration:")
  print.white("Update interval:    " + userConfig.updateIntervall + " seconds");
  print.white("Exchange currency:   " + userConfig.zCurrency);
  print.white("Chart width:         " + userConfig.chart.width);
  print.white("Chart height:         " + userConfig.chart.height);
  print.white("API key:             " + userConfig.kraken.API_KEY);
  print.white("API secret:          " + userConfig.kraken.API_SECRET);
}

///// HELPER FUNCTIONS  /////

function configError(config) {
  print.error(`Configuration error: ${config} is missing, aborting.\n`);
}

function contains(array, subArray) {
  return array.indexOf(subArray) > -1;
}
