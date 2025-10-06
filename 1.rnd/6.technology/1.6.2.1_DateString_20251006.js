'use strict';

const $TypeError = require('es-errors/type');

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const $isNaN = require('math-intrinsics/isNaN');
const padTimeComponent = require('../helpers/padTimeComponent');

const DateFromTime = require('./DateFromTime');
const MonthFromTime = require('./MonthFromTime');
const WeekDay = require('./WeekDay');
const YearFromTime = require('./YearFromTime');

// https://262.ecma-international.org/9.0/#sec-datestring

module.exports = function DateString(tv) {
	if (typeof tv !== 'number' || $isNaN(tv)) {
		throw new $TypeError('Assertion failed: `tv` must be a non-NaN Number');
	}
	const weekday = weekdays[WeekDay(tv)];
	const month = months[MonthFromTime(tv)];
	const day = padTimeComponent(DateFromTime(tv));
	const year = padTimeComponent(YearFromTime(tv), 4);
	return weekday + '\x20' + month + '\x20' + day + '\x20' + year;
};
