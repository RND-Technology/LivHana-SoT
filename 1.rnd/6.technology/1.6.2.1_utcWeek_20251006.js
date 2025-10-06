"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utcWednesdays = exports.utcWednesday = exports.utcTuesdays = exports.utcTuesday = exports.utcThursdays = exports.utcThursday = exports.utcSundays = exports.utcSunday = exports.utcSaturdays = exports.utcSaturday = exports.utcMondays = exports.utcMonday = exports.utcFridays = exports.utcFriday = void 0;
const _interval = _interopRequireDefault(require("./interval.js"));
const _duration = require("./duration.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function utcWeekday(i) {
  return (0, _interval.default)(function (date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function (start, end) {
    return (end - start) / _duration.durationWeek;
  });
}
const utcSunday = exports.utcSunday = utcWeekday(0);
const utcMonday = exports.utcMonday = utcWeekday(1);
const utcTuesday = exports.utcTuesday = utcWeekday(2);
const utcWednesday = exports.utcWednesday = utcWeekday(3);
const utcThursday = exports.utcThursday = utcWeekday(4);
const utcFriday = exports.utcFriday = utcWeekday(5);
const utcSaturday = exports.utcSaturday = utcWeekday(6);
const utcSundays = exports.utcSundays = utcSunday.range;
const utcMondays = exports.utcMondays = utcMonday.range;
const utcTuesdays = exports.utcTuesdays = utcTuesday.range;
const utcWednesdays = exports.utcWednesdays = utcWednesday.range;
const utcThursdays = exports.utcThursdays = utcThursday.range;
const utcFridays = exports.utcFridays = utcFriday.range;
const utcSaturdays = exports.utcSaturdays = utcSaturday.range;