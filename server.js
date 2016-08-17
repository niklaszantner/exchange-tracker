#!/usr/bin/env node

/* ===== DEPENDENCIES AND CONFIGS===== */
const _ = require("lodash");
const q = require("q");
const moment = require("moment");
const clearBash = require("clear");
const jsonFile = require("jsonfile");
const fs = require("fs");
const chart = require("./app/chart/chart.js");
const cursor = require("ansi")(process.stdout);
const krakenService = require("./app/kraken/kraken.service");
const Logger = require("./app/logger/logger.service");
const userSettingsDir = require("user-settings-dir")();
const UserConfigService = require("./app/config/userConfig.service");
const runConfig = require("./app/config/run.config.js");

 /* ===== STARTUP ===== */
const cli = runConfig.cli;
const print = runConfig.print;
const printInLine = runConfig.printInLine;
let userConfig = runConfig.defaultUserConfig;
let pastExchangeRate = [];
jsonFile.spaces = 2;

let lastFetch = {
  plottedChart: "-",
  exchangeRate: "-",
  balance: "-",
  depositValue: "-"
};

init();

/* ===== FUNCTIONS ===== */
function init() {
  process.on("exit", () => { cursor.show().write("\n"); } );
  process.on("SIGINT", () => { process.exit(); });

  cursor.hide();

  UserConfigService.loadConfigIfExists(userSettingsDir + "/.exchange-tracker.config.json")
    .then((data) => { if (data) { userConfig = data; }})
    .finally(cliHandler);
}

function cliHandler() {
  if (cli.print) {
    UserConfigService.printConfig(userConfig);
    process.exit();
  }

  if (cli.reset) {
    UserConfigService.deleteConfig(userSettingsDir + "/.exchange-tracker.config.json")
      .finally(process.exit());
  }

  if (cli.log) { userConfig.logEnabled = Boolean(cli.log); }
  if (cli.intervall) { userConfig.updateIntervall = cli.intervall; }
  if (cli.day) { userConfig.dayBought = cli.day; }
  if (cli.key) { userConfig.kraken.API_KEY = cli.key; }
  if (cli.secret) { userConfig.kraken.API_SECRET = cli.secret; }
  if (cli.exchangeKey) { userConfig.exchangeKey = cli.exchangeKey; }
  if (cli.chartWidth) { userConfig.chart.width = cli.chartWidth; }
  if (cli.chartHeight) { userConfig.chart.height = cli.chartHeight; }

  UserConfigService.validateConfig(userConfig).then(runTracker, shutDownTracker);
}

function runTracker() {
  UserConfigService.storeConfig(userSettingsDir + "/.exchange-tracker.config.json", userConfig);

  getCurrrentData();
  setInterval(getCurrrentData, userConfig.updateIntervall * 1000);
}

function shutDownTracker() {
  print.error("Please have look at the README or your .exchange-tracker.config.json in your home folder.");
  process.exit();
}

// get currentValue of owned eth in euro
function getCurrrentData() {
  const tickerPromise = krakenService.exchangeService(null, null, "Ticker", {"pair": userConfig.exchangeKey});
  let balancePromise = null;

  if (userConfig.kraken.API_KEY && userConfig.kraken.API_SECRET) {
    balancePromise = krakenService.exchangeService(userConfig.kraken.API_KEY, userConfig.kraken.API_SECRET, "Balance", null);
  }

  q.all([balancePromise, tickerPromise]).then(
    (results) => successHandler(results, balancePromise),
    (errors) => updateInterface(true, errors));
}

function successHandler(results, balancePromise) {
  let ticker = results[1];
  let tickerAsk = ticker[Object.keys(ticker)[0]].a[0];
  lastFetch.exchangeRate = _.round(tickerAsk, 4);

  if (balancePromise) {
    lastFetch.balance = results[0].XETH;
    lastFetch.depositValue = lastFetch.balance * lastFetch.exchangeRate;
  }

  let plottedChart = chart.update(pastExchangeRate, lastFetch.exchangeRate, userConfig.chart.width, userConfig.chart.height);

  lastFetch.plottedChart = plottedChart;

  if (userConfig.logEnabled) {
    Logger.save(lastFetch);
  }

  updateInterface(false, "GOOD");
}

function updateInterface(isError, status) {
  clearBash();

  let fromCurrency = userConfig.exchangeKey.substring(1,4);
  let toCurrency = userConfig.exchangeKey.substring(5,8);
  let timeStamp = moment().format("DD.MM.YY HH:mm:ss");
  let daysToGoNotification = (!_.isEmpty(userConfig.dayBought)) ?
          " | Days to go: " + (365 + moment(userConfig.dayBought).diff(moment(), "days")) : "";

  print.header(timeStamp + daysToGoNotification + "\n");
  print.white(lastFetch.plottedChart + "\n");

  if (userConfig.kraken.API_KEY && userConfig.kraken.API_SECRET) {
    print.info(`Exchange  (${fromCurrency} to ${toCurrency})  ` + lastFetch.exchangeRate);
    print.info(`Balance   (${fromCurrency})         ` + lastFetch.balance);
    print.info(`Balance   (${toCurrency})         ` + lastFetch.depositValue + "\n");
  } else {
    print.info(`Exchange  (${fromCurrency} to ${toCurrency})  ` + lastFetch.exchangeRate + "\n");
  }

  isError ? printInLine.red(`Error occurred, waiting for next sync \n ${status}`) :
            printInLine.green(`Status    ${status}`);
}
