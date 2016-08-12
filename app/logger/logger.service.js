/* ===== NPM  DEPENDENCIES ===== */
const fileExists = require("file-exists");
const fs = require("fs");
const moment = require("moment");
const runConfig = require("../config/run.config.js");
const userSettingsDir = require("user-settings-dir")();

/* ===== CONFIG ===== */
const print = runConfig.print;

/* ===== EXPOSE `chart()` ===== */
module.exports.save = save;

function save(data) {
  let path = userSettingsDir + "/.exchange-tracker.log.csv";

  if (fileExists(path)) {
    let string = formatBody(data);

    fs.appendFile(path, string, function(err) {
      if (err) { print.red("Could not append log to file"); }
    });
  } else {
    let string = formatHeader() + formatBody(data);

    fs.writeFile(path, string, function (err) {
      if (err) {
        print.red("Could not write log to file");
      }
    });
  }
}

function formatBody(data) {
  return `"${moment().format("YY.MM.DD_HH:mm:ss")}",${data.exchangeRate},${data.balance},${data.depositValue}\n`;
}

function formatHeader() {
  return "timeStamp,exchangeRate,balance,depositValue\n";
}
