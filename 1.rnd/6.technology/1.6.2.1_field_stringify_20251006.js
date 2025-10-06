'use strict';

const compactField = require('./field_compactor');

function stringifyField(arr, min, max) {
  const ranges = compactField(arr);
  if (ranges.length === 1) {
    const singleRange = ranges[0];
    var step = singleRange.step;
    if (step === 1 && singleRange.start === min && singleRange.end === max) {
      return '*';
    }
    if (step !== 1 && singleRange.start === min && singleRange.end === max - step + 1) {
      return '*/' + step;
    }
  }

  let result = [];
  for (let i = 0, l = ranges.length; i < l; ++i) {
    var range = ranges[i];
    if (range.count === 1) {
      result.push(range.start);
      continue;
    }

    var step = range.step;
    if (range.step === 1) {
      result.push(range.start + '-' + range.end);
      continue;
    }

    const multiplier = range.start == 0 ? range.count - 1 : range.count;
    if (range.step * multiplier > range.end) {
      result = result.concat(
         Array
          .from({ length: range.end - range.start + 1 })
          .map(function (_, index) {
            const value = range.start + index;
            if ((value - range.start) % range.step === 0) {
              return value;
            }
            return null;
          })
          .filter(function (value) {
            return value != null;
          })
      );
    } else if (range.end === max - range.step + 1) {
      result.push(range.start + '/' + range.step);
    } else {
      result.push(range.start + '-' + range.end + '/' + range.step);
    }
  }

  return result.join(',');
}

module.exports = stringifyField;
