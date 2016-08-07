/* ===== NPM  DEPENDENCIES ===== */
const matrix = require("array-matrix");
const _ = require("lodash");

/* ===== VARIABLES ===== */
let MIN_VALUE = 0;
let Y_AXIS_DESCRIPTION_WIDTH = 12;

/* ===== EXPOSE `chart()` ===== */
module.exports.draw = draw;
module.exports.update = update;

function update(data, dataSet, outerWidth, height) {
  if (data.length >= ((outerWidth - Y_AXIS_DESCRIPTION_WIDTH) / 2)) { data.shift(); }
  data.push(dataSet);

  return draw(data, outerWidth, height, relativeMinValue(data, 4));
}

function draw(data, width, height, minValue) {
  width = width || 130;
  height = height || 30;
  minValue = minValue || 0;

  let output = matrix(width, height);
  let maxValue = _.max(data) || 0;
  let maxLabel = Math.abs(maxValue).toString();
  let minLabel = Math.abs(minValue).toString();
  let labelWidth = _.max([maxLabel.length, minLabel.length]);
  let labelPadding = 1;

  // prefill output matrix
  for (let y = 0; y < height; y++) {
    output[y] = _.fill(new Array(width), " ");
  }

  // set y-axis labels
  for (let i = 0; i < labelWidth; i++) {
    output[0][i] = maxLabel[i] ? maxLabel[i] : " ";
    output[height - 1][i] = minLabel[i] ? minLabel[i] : " ";
  }

  // set y-axis
  for (let currentY = 0; currentY < height; currentY++) {
    output[currentY][labelWidth + labelPadding] = "․";
  }

  // set x-axis
  let currentX = labelWidth + labelPadding;
  while (currentX < width) {
    output[height - 1][currentX++] = "․";
    output[height - 1][currentX++] = " ";
  }

  // plot data
  let currentXYPosition = labelWidth + labelPadding + 2;
  _.forEach(data, function(currentvalue) {
    currentvalue = currentvalue - minValue;

    let relativeHeight = Math.round((height - 2) * (currentvalue / (maxValue - minValue)));
    let color = relativeHeight < 0 ? " " : "█";

    if (relativeHeight < 0) { relativeHeight = -relativeHeight; }

    while (relativeHeight--) {
      output[Math.abs(relativeHeight - height) - 2][currentXYPosition] = color;
    }

    currentXYPosition += 2;
  });

  return matrixToString(output, height);
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
