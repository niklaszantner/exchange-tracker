/* ===== NPM PACKAGES ===== */
const cli = require('commander');
const chalk = require('chalk');

/* ===== DEBUG CONFIG ===== */
const debugEnabled = false;

/* ===== CLI CONFIG ===== */
cli
  .version('0.1.5')
  .option('-p, --print', 'print the current configuration')
  .option('-i, --intervall [time of intervall]', 'update intervall')
  .option('-d, --day [day bought]', 'day bought')
  .option('-k, --key [kraken key]', 'your kraken key')
  .option('-s, --secret [kraken secret]', 'your kraken secret')
  .option('-c, --currency [exchange currency]', 'currency to exchange, options in the README')
  .option('-w, --chartWidth [width of chart]', 'width of the chart in chars')
  .option('-h, --chartHeight [height of chart]', 'height of the chart in chars')
  .parse(process.argv);

module.exports = {
  debugEnabled: debugEnabled,
  cli: cli,
  print: {
    error:  (content) => { console.log(chalk.red.bgWhite('ERROR :' + content)) },
    info:   (content) => { console.log(chalk.cyan(content)) },
    white:  (content) => { console.log(chalk.white(content)) },
    gray:   (content) => { console.log(chalk.gray(content)) },
    header: (content) => { console.log(chalk.green.bold(content)) },
    debug: debugEnabled ?
            (content) => { console.log(chalk.white(content)) } :
            (content) => { return; }
  }
};
