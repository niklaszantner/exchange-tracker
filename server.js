#!/usr/bin/env node

/* ===== NPM AND LOCAL DEPENDENCIES ===== */
const _ = require('lodash');
const q = require('q');
const moment = require('moment');
const clearBash = require('clear');
const jsonFile = require('jsonfile');
const fileExists = require('file-exists');
const fs = require('fs');
const chart = require('./app/chart/chart.js');
const cursor = require('ansi')(process.stdout);
const krakenService = require('./app/kraken/kraken.service');
const Logger = require('./app/logger/logger.service');

/* ===== DEFAULT CONFIG ===== */
const runConfig = require("./app/config/run.config.js");
const exchangeConfig = require("./app/config/exchange.config.js");

process.on('exit', function () {
  cursor.show().write('\n');
});

process.on('SIGINT', function () {
  process.exit();
});

 /* ===== VARIABLES ===== */
const cli = runConfig.cli;
const print = runConfig.print;
const printInLine = runConfig.printInLine;
let userConfig = runConfig.userConfig;
let pastExchangeRate = [];
let MIN_VALUE = 0;

let lastFetch = {
  plottedChart: '-',
  exchangeRate: '-',
  etherBalance: '-',
  depositValue: '-'
};

/* ===== FUNCTIONS ===== */
(function initialiser() {
  cursor.hide();

  if (fileExists(__dirname + '/config/user.config.json')) {
    userConfig = jsonFile.readFileSync(__dirname + '/config/user.config.json');
  }

  if (cli.print) {
    printConfig();
    cursor.show().write('\n');
    process.exit();
  }

  if (cli.log) { userConfig.logEnabled = Boolean(cli.log) }
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

  getCurrrentData();
  setInterval(getCurrrentData, userConfig.updateIntervall * 1000);
}

// get currentValue of owned eth in euro
function getCurrrentData() {
  const exchangeKey = exchangeConfig.find(str => contains(str, userConfig.zCurrency));

  q.all([krakenService.exchangeService(userConfig.kraken.api_key, userConfig.kraken.api_secret, 'Balance', null),
         krakenService.exchangeService(userConfig.kraken.api_key, userConfig.kraken.api_secret, 'Ticker', {"pair": exchangeKey})])
    .then(function(results) {
      let ticker = results[1];
      let tickerAsk = ticker[Object.keys(ticker)[0]].a[0];
      
      let etherBalance = results[0].XETH;
      let exchangeRate = _.round(tickerAsk, 4);
      let depositValue = etherBalance * exchangeRate;
      let plottedChart = chart.update(pastExchangeRate, exchangeRate, userConfig.chart.width, userConfig.chart.height);

      lastFetch.plottedChart = plottedChart;
      lastFetch.exchangeRate = exchangeRate;
      lastFetch.etherBalance = etherBalance;
      lastFetch.depositValue = depositValue;

      if (userConfig.logEnabled) { Logger.save(lastFetch); }

      updateInterface(false, 'GOOD');
  }, function(errors) {
      updateInterface(true, erros);
  });
}

function updateInterface(isError, status) {
  clearBash();

  let timeStamp = moment().format('DD.MM.YY HH:mm:ss');
  let daysToGoNotificatoin = (!_.isEmpty(userConfig.dayBought)) ?
          ' | Days to go: ' + (365 + moment(userConfig.dayBought).diff(moment(), 'days')) : '';

  print.header(timeStamp + daysToGoNotificatoin + '\n');
  print.white(lastFetch.plottedChart + '\n');
  print.info(`Exchange  (${userConfig.zCurrency} to ETH)  ` + lastFetch.exchangeRate);
  print.info('Balance   (ETH)         '                     + lastFetch.etherBalance);
  print.info(`Balance   (${userConfig.zCurrency})         ` + lastFetch.depositValue + '\n');

  isError ? printInLine.red(`Error occurd, waiting for next sync \n ${status}`) :
            printInLine.green(`Status    ${status}`);
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

/* ===== HELPER FUNCTIONS ===== */

function contains(array, subArray) {
  return array.indexOf(subArray) > -1;
}
