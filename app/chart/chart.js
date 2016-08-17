/* ===== NPM  DEPENDENCIES ===== */
const matrix = require("array-matrix");
const _ = require("lodash");

/* ===== VARIABLES ===== */
let MIN_VALUE = 0;
let Y_AXIS_DESCRIPTION_WIDTH = 12;

/* ===== EXPOSE `chart()` ===== */
module.exports.drawEmptyChart = drawEmptyChart;
module.exports.update = update;

function update(data, dataSet, outerWidth, height) {
  if (data.length >= ((outerWidth - Y_AXIS_DESCRIPTION_WIDTH) / 2)) { data.shift(); }
  data.push(dataSet);

  return plotData(drawEmptyChart(data, outerWidth, height, relativeMinValue(data, 4)), data);
}

function drawEmptyChart(data, width, height, minValue) {
  let maxValue = _.max(data) || 0;
  let maxLabel = Math.abs(maxValue).toString();
  let minLabel = Math.abs(minValue).toString();

  let chart = {
    width: width || 130,
    height: height || 30,
    minValue: minValue || 0,
    output: matrix(width, height),
    maxValue: _.max(data) || 0,
    maxLabel: Math.abs(maxValue).toString(),
    minLabel: Math.abs(minValue).toString(),
    labelWidth: _.max([maxLabel.length, minLabel.length]),
    labelPadding: 1,
  };

  // prefill output matrix
  for (let y = 0; y < height; y++) {
    chart.output[y] = _.fill(new Array(chart.width), " ");
  }

  // set y-axis labels
  for (let i = 0; i < chart.labelWidth; i++) {
    chart.output[0][i] = chart.maxLabel[i] ? chart.maxLabel[i] : " ";
    chart.output[height - 1][i] = chart.minLabel[i] ? chart.minLabel[i] : " ";
  }

  // set y-axis
  for (let currentY = 0; currentY < height; currentY++) {
    chart.output[currentY][chart.labelWidth + chart.labelPadding] = "․";
  }

  // set x-axis
  let currentX = chart.labelWidth + chart.labelPadding;
  while (currentX < width) {
    chart.output[height - 1][currentX++] = "․";
    chart.output[height - 1][currentX++] = " ";
  }

  return chart;
}

function plotData(chart, data) {
  let currentXYPosition = chart.labelWidth + chart.labelPadding + 2;

  _.forEach(data, function(currentValue) {
    currentValue = currentValue - chart.minValue;

    let relativeHeight = Math.round((chart.height - 2) * (currentValue / (chart.maxValue - chart.minValue)));
    let color = relativeHeight < 0 ? " " : "█";

    if (relativeHeight < 0) { relativeHeight = -relativeHeight; }

    while (relativeHeight--) {
      chart.output[Math.abs(relativeHeight - chart.height) - 2][currentXYPosition] = color;
    }

    currentXYPosition += 2;
  });

  return matrixToString(chart.output, chart.height);
}

function matrixToString(output) {
  let buffer = [];
  _.forEach(output, (char) => buffer.push(char.join("")));
  return buffer.join("\n");
}

/* ===== HELPER FUNCTIONS ===== */
function relativeMinValue(data, zoom) {
  const defaultZoom = 0.9;

  if (data.length === 1) {
    MIN_VALUE = _.floor(data[0] * defaultZoom);
  } else {
    let delta = Math.abs(data[data.length - 1] - data[data.length - 2]);
    let minBase = _.min([data[data.length - 2], data[data.length - 1]]);

    if (delta !== 0) {
      MIN_VALUE = ((minBase > _.min(data)) ? _.min(data) : minBase) - zoom * delta;
    }
  }

  return _.round(MIN_VALUE, 4);
}
