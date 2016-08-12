/* ===== NPM PACKAGES ===== */
const cli = require("commander");
const chalk = require("chalk");
const packageVersion = require("../../package.json").version;
const exchangeConfig = require("./exchange.config.js");

/* ===== CLI CONFIG ===== */
cli
  .version(`${packageVersion}`)
  .option("-p, --print", "print the current configuration")
  .option("-r, --reset", "reset the current configuration")
  .option("-i, --intervall [time of intervall]", "update intervall in seconds")
  .option("-d, --day [day bought]", "day bought")
  .option("-k, --key [kraken key]", "your kraken key")
  .option("-s, --secret [kraken secret]", "your kraken secret")
  .option("-e, --exchangeKey [exchange key]", "currencies to exchange, options in the README")
  .option("-w, --chartWidth [width of chart]", "width of the chart in chars")
  .option("-h, --chartHeight [height of chart]", "height of the chart in chars")
  .option("-l, --log [true or false]", "enables or disables the log")
  .usage("\n"
       + "\n  Changelog: https://github.com/nobol/exchange-tracker/blob/master/CHANGELOG.md"
       + "\n  Readme:    https://github.com/nobol/exchange-tracker/blob/master/README.md"
       + "\n"
       + "\n  Possible exchange keys: "
       + "\n  " + exchangeConfig.splice(0, 7)
       + "\n  " + exchangeConfig.splice(0, 7))
  .parse(process.argv);

/* ===== DEFAULT USER CONFIG */
let defaultUserConfig = {
  kraken: {
    API_KEY:    "",
    API_SECRET: ""
  },
  updateIntervall: 60,
  dayBought: "",
  exchangeKey: "",
  chart: {
    width: 85,
    height: 15
  },
  logEnabled: false
};

module.exports = {
  cli,
  defaultUserConfig,
  print: {
    error:  (content) => { console.log(chalk.red.bgWhite(content)); },
    info:   (content) => { console.log(chalk.cyan(content)); },
    white:  (content) => { console.log(chalk.white(content)); },
    gray:   (content) => { console.log(chalk.gray(content)); },
    header: (content) => { console.log(chalk.green.bold(content)); },
    red:  (content) => { console.log(chalk.red(content)); },
    green:  (content) => { console.log(chalk.green(content)); }
  },
  printInLine: {
    green:  (content) => { process.stdout.write(chalk.green(content)); },
    red:  (content) => { process.stdout.write(chalk.red(content)); }
  }
};
