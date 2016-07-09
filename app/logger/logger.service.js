/* ===== NPM  DEPENDENCIES ===== */
const _ = require('lodash');
const fileExists = require('file-exists');
const fs = require('fs');
const moment = require('moment');
const runConfig = require("../config/run.config.js");

/* ===== CONFIG ===== */
const print = runConfig.print;

/* ===== EXPOSE `chart()` ===== */
module.exports.save = save;

function save(data) {
  let path = __dirname + '/log.csv';

  if (fileExists(path)) {
    let string = formatBody(data);

    fs.appendFile(path, string, function(err) {
      if (err) { print.red('Could not append log to file') }
    });
  } else {
    let string = formatHeader(data) + formatBody(data);

    fs.writeFile(path, string, function (err) {
      if (err) {
        print.red('Could not write log to file')
      }
    });
  }
}

function formatBody(data) {
  return `"${moment().format('YY.MM.DD_HH:mm:ss')}",${data.exchangeRate},${data.etherBalance},${data.depositValue}\n`
}

function formatHeader(data) {
  return `timeStamp, exchangeRate, etherBalance, depositValue\n`;
}