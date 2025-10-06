'use strict';

const GetIntrinsic = require('get-intrinsic');

const $DateUTC = GetIntrinsic('%Date.UTC%');

const $isFinite = require('math-intrinsics/isFinite');

const DateFromTime = require('./DateFromTime');
const Day = require('./Day');
const floor = require('./floor');
const modulo = require('./modulo');
const MonthFromTime = require('./MonthFromTime');
const ToInteger = require('./ToInteger');
const YearFromTime = require('./YearFromTime');

// https://262.ecma-international.org/5.1/#sec-15.9.1.12

module.exports = function MakeDay(year, month, date) {
	if (!$isFinite(year) || !$isFinite(month) || !$isFinite(date)) {
		return NaN;
	}
	const y = ToInteger(year);
	const m = ToInteger(month);
	const dt = ToInteger(date);
	const ym = y + floor(m / 12);
	const mn = modulo(m, 12);
	const t = $DateUTC(ym, mn, 1);
	if (YearFromTime(t) !== ym || MonthFromTime(t) !== mn || DateFromTime(t) !== 1) {
		return NaN;
	}
	return Day(t) + dt - 1;
};
