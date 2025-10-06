'use strict';

const $isFinite = require('math-intrinsics/isFinite');

const timeConstants = require('../helpers/timeConstants');
const msPerSecond = timeConstants.msPerSecond;
const msPerMinute = timeConstants.msPerMinute;
const msPerHour = timeConstants.msPerHour;

const ToInteger = require('./ToInteger');

// https://262.ecma-international.org/5.1/#sec-15.9.1.11

module.exports = function MakeTime(hour, min, sec, ms) {
	if (!$isFinite(hour) || !$isFinite(min) || !$isFinite(sec) || !$isFinite(ms)) {
		return NaN;
	}
	const h = ToInteger(hour);
	const m = ToInteger(min);
	const s = ToInteger(sec);
	const milli = ToInteger(ms);
	const t = (h * msPerHour) + (m * msPerMinute) + (s * msPerSecond) + milli;
	return t;
};
