#!/usr/bin/env node

/* ===== NPM AND LOCAL DEPENDENCIES ===== */
const _ = require('lodash');
const q = require('q');
const moment = require('moment');
const clearBash = require('clear');
const jsonFile = require('jsonfile');
const fs = require('fs');
const chart = require('./app/chart/chart.js');
const cursor = require('ansi')(process.stdout);
const krakenService = require('./app/kraken/kraken.service');
const Logger = require('./app/logger/logger.service');
const userSettingsDir = require('user-settings-dir')();

/* ===== DEFAULT CONFIG ===== */
const runConfig = require("./app/config/run.config.js");
const exchangeConfig = require("./app/config/exchange.config.js");

process.on('exit', function () {
  cursor.show().write('\n');
});

process.on('SIGINT', function () {
  process.exit();
});

 /* ===== STARTUP ===== */
const cli = runConfig.cli;
const print = runConfig.print;
const printInLine = runConfig.printInLine;
let userConfig = runConfig.userConfig;
let pastExchangeRate = [];
jsonFile.spaces = 2;

let lastFetch = {
  plottedChart: '-',
  exchangeRate: '-',
  etherBalance: '-',
  depositValue: '-'
};

init();

/* ===== FUNCTIONS ===== */
function init() {
  cursor.hide();

  loadConfigIfExists(userSettingsDir + '/.ether-tracker.config.json')
    .then((data) => { if (data) { userConfig = data; }})
    .finally(cliHandler);
}

function cliHandler() {
  if (cli.print) {
    printConfig();
    process.exit();
  }

  if (cli.reset) {
    deleteConfig(userSettingsDir + '/.ether-tracker.config.json')
      .then(() => { print.info('Reset user config') })
      .catch(() => { print.error('Could not reset user config') })
      .finally(process.exit());
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
}

function validateConfig() {
  if (!userConfig.updateIntervall) { configError('updateIntervall') }
  if (!userConfig.zCurrency) { configError('zCurrency') }
  if (!userConfig.chart.width) { configError('chartWidth') }
  if (!userConfig.chart.height) { configError('chartHeight') }

  storeConfig(userSettingsDir + '/.ether-tracker.config.json', userConfig);

  getCurrrentData();
  setInterval(getCurrrentData, userConfig.updateIntervall * 1000);
}

// get currentValue of owned eth in euro
function getCurrrentData() {
  const exchangeKey = exchangeConfig.find(str => contains(str, userConfig.zCurrency));
  const tickerPromise = krakenService.exchangeService(null, null, 'Ticker', {"pair": exchangeKey});
  let balancePromise = null;

  if (userConfig.kraken.api_key && userConfig.kraken.api_secret) {
    balancePromise = krakenService.exchangeService(userConfig.kraken.api_key, userConfig.kraken.api_secret, 'Balance', null);
  }

  q.all([balancePromise, tickerPromise]).then(function(results) {
      let ticker = results[1];
      let tickerAsk = ticker[Object.keys(ticker)[0]].a[0];
      lastFetch.exchangeRate = _.round(tickerAsk, 4);

      if (balancePromise) {
        lastFetch.etherBalance = results[0].XETH;
        lastFetch.depositValue = lastFetch.etherBalance * lastFetch.exchangeRate;
      }

      let plottedChart = chart.update(pastExchangeRate, lastFetch.exchangeRate, userConfig.chart.width, userConfig.chart.height);

      lastFetch.plottedChart = plottedChart;

      if (userConfig.logEnabled) { Logger.save(lastFetch); }

      updateInterface(false, 'GOOD');
  }, function(errors) {
      updateInterface(true, errors);
  });
}

function updateInterface(isError, status) {
  clearBash();

  let timeStamp = moment().format('DD.MM.YY HH:mm:ss');
  let daysToGoNotificatoin = (!_.isEmpty(userConfig.dayBought)) ?
          ' | Days to go: ' + (365 + moment(userConfig.dayBought).diff(moment(), 'days')) : '';

  print.header(timeStamp + daysToGoNotificatoin + '\n');
  print.white(lastFetch.plottedChart + '\n');

  if (userConfig.kraken.api_key && userConfig.kraken.api_secret) {
    print.info(`Exchange  (${userConfig.zCurrency} to ETH)  ` + lastFetch.exchangeRate);
    print.info('Balance   (ETH)         ' + lastFetch.etherBalance);
    print.info(`Balance   (${userConfig.zCurrency})         ` + lastFetch.depositValue + '\n');
  } else {
    print.info(`Exchange  (${userConfig.zCurrency} to ETH)  ` + lastFetch.exchangeRate + '\n');
  }

  isError ? printInLine.red(`Error occurred, waiting for next sync \n ${status}`) :
            printInLine.green(`Status    ${status}`);
}

function isCurrency(currency) {
  let currencies = ['CAD','EUR','GBP','JPY','USD','CAD','EUR','USD','XBT','LTC',
                    'NMC','XDG','XLM','XRP'];
  return contains(currencies, currency);
}

function configError(config) {
  print.error(`Configuration error: ${config} is missing, aborting.\n`
            + `Please have look at the README or your .ether-tracker.config.json in your home folder.`);
  process.exit();
}

/* ===== HELPER FUNCTIONS ===== */

function contains(array, subArray) {
  return array.indexOf(subArray) > -1;
}
