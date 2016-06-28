#!/usr/bin/env node

/* ===== NPM AND LOCAL DEPENDENCIES ===== */
const _ = require('lodash');
const q = require('q');
const krakenClient = require('kraken-api');
const moment = require('moment');
const clearBash = require('clear');
const jsonFile = require('jsonfile');
const fileExists = require('file-exists');
const fs = require('fs');
const chart = require('./chart.js');
const cursor = require('ansi')(process.stdout);

/* ===== LOAD CONFIG FILES ===== */
cursor.hide();

let userConfig = {
  kraken: {
    api_key:    '',
    api_secret: ''
  },
  updateIntervall: 60,
  dayBought: '',
  zCurrency: '',
  chart: {
    width: 85,
    height: 15
  }
};

const runConfig = require("./config/run.config.js");
const exchangeConfig = require("./config/exchange.config.js");
let MIN_VALUE = 0;

process.on('exit', function () {
  cursor.show().write('\n');
})

process.on('SIGINT', function () {
  process.exit();
})

 /* ===== VARIABLES ===== */
const cli = runConfig.cli;
const print = runConfig.print;
const printInLine = runConfig.printInLine;
let pastExchangeRate = [];

/* ===== FUNCTIONS ===== */
(function initialiser() {
  if (fileExists(__dirname + '/config/user.config.json')) {
    userConfig = jsonFile.readFileSync(__dirname + '/config/user.config.json');
  }

  if (cli.print) {
    printConfig();
    process.exit();
  }

  if (cli.intervall) { userConfig.updateIntervall = cli.intervall }
  if (cli.day) { userConfig.dayBought = cli.day }
  if (cli.key) { userConfig.kraken.api_key = cli.key }
  if (cli.secret) { userConfig.kraken.api_secret = cli.secret }
  if (cli.currency) { userConfig.zCurrency = isCurrency(cli.currency) ? cli.currency : undefined }
  if (cli.chartWidth) { userConfig.chart.width = cli.chartWidth }
  if (cli.chartHeight) { userConfig.chart.height = cli.chartHeight }

  validateConfig();
})();

function validateConfig() {
  if (!userConfig.kraken.api_key) { configError('kraken.api_key')}
  if (!userConfig.kraken.api_secret) { configError('kraken.api_secret') }
  if (!userConfig.updateIntervall) { configError('updateIntervall') }
  if (!userConfig.zCurrency) { configError('zCurrency') }
  if (!userConfig.chart.width) { configError('chartWidth') }
  if (!userConfig.chart.height) { configError('chartHeight') }

  if (!runConfig.debugEnabled) {
    jsonFile.writeFile(__dirname + '/config/user.config.json', userConfig, function(error) {
      if (error) {
        print.error('Could no write into file \n' + error);
        process.exit();
      }
    })
  }

  getCurrrentValue();
  setInterval(getCurrrentValue, userConfig.updateIntervall * 1000);
}

// get currentValue of owned eth in euro
function getCurrrentValue() {
  let daysToGoNotificatoin = (!_.isEmpty(userConfig.dayBought)) ?
          ' | Days to go: ' + (365 + moment(userConfig.dayBought).diff(moment(), 'days')) : '';

  const exchangeKey = exchangeConfig.find(str => contains(str, userConfig.zCurrency));
  const kraken = new krakenClient(userConfig.kraken.api_key, userConfig.kraken.api_secret);

  q.all([useKrakenAPI(kraken, 'Balance', null), useKrakenAPI(kraken, 'Ticker', {"pair": exchangeKey})])
   .then(function(results) {
    let ticker = results[1];
    let tickerAsk = ticker[Object.keys(ticker)[0]].a[0];

    let etherBalance = results[0].XETH;
    let exchangeRate = _.round(tickerAsk, 4);
    let depositValue = etherBalance * exchangeRate;
    let plottedChart = updateChart(pastExchangeRate, exchangeRate);

    clearBash();

    print.header(moment().format('DD.MM.YY HH:mm:ss') + daysToGoNotificatoin + '\n');
    print.white(plottedChart + '\n');
    print.info(`Exchange  (${userConfig.zCurrency} to ETH)  ` + exchangeRate);
    print.info('Balance   (ETH)         ' + etherBalance);
    print.info(`Balance   (${userConfig.zCurrency})         ` + depositValue + '\n');
    printInLine.green('Status    Good');
  }, function(errors) {
    print.red('Status    Error occurd, waiting for next sync');
    print.red(errors);
  });
}

// use a specific kraken api with options
function useKrakenAPI(kraken, api, option) {
  return new Promise(function (fulfill, reject) {
    kraken.api(api, option, function(error, data) {
      (error) ? reject(error) : fulfill(data.result);
    });
  });
}

// update and draw the chart
function updateChart(data, dataSet) {
  if (data.length >= ((userConfig.chart.width - 12) / 2)) { data.shift(); }
  data.push(dataSet);

  return chart(data, userConfig.chart.width, userConfig.chart.height, relativeMinValue(data));
}

function absoluteMinValue(data) {
  return Math.floor(_.min(data) * 0.9);
}

function relativeMinValue(data) {
  if (data.length === 1) {
    MIN_VALUE = Math.floor(data[0] * 0.9);
  } else {
    let delta = Math.abs(data[data.length - 1] - data[data.length - 2]);
    minBase = _.min([data[data.length - 2], data[data.length - 1]]);

    if (delta === 0) {
      return MIN_VALUE;
    } else {
      MIN_VALUE = minBase - 4 * delta;
    }
  }

   MIN_VALUE = _.round(MIN_VALUE, 4);
   return MIN_VALUE;
}

function printConfig() {
  print.white('Update intervall:    ' + userConfig.updateIntervall + ' seconds');
  print.white('Exchange currency:   ' + userConfig.zCurrency);
  print.white('Chart width:         ' + userConfig.chart.width);
  print.white('Chart heigh:         ' + userConfig.chart.height);
  print.white('API key:             ' + userConfig.kraken.api_key);
  print.white('API secret:          ' + userConfig.kraken.api_secret);
}

function isCurrency(currency) {
  let currencies = ['CAD','EUR','GBP','JPY','USD','CAD','EUR','USD','XBT','LTC',
                    'NMC','XDG','XLM','XRP'];
  return contains(currencies, currency);
}

function configError(config) {
  print.error(`Configuration error: ${config} is missing, aborting.\n`
            + `Please have look at the README or your user.config in the config folder.`);
  process.exit();
}

///////////

function contains(array, subArray) {
  return array.indexOf(subArray) > -1;
}
