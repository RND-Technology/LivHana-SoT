'use strict';

const $TypeError = require('es-errors/type');

const $isNaN = require('math-intrinsics/isNaN');
const padTimeComponent = require('../helpers/padTimeComponent');

const HourFromTime = require('./HourFromTime');
const MinFromTime = require('./MinFromTime');
const SecFromTime = require('./SecFromTime');

// https://262.ecma-international.org/9.0/#sec-timestring

module.exports = function TimeString(tv) {
	if (typeof tv !== 'number' || $isNaN(tv)) {
		throw new $TypeError('Assertion failed: `tv` must be a non-NaN Number');
	}
	const hour = HourFromTime(tv);
	const minute = MinFromTime(tv);
	const second = SecFromTime(tv);
	return padTimeComponent(hour) + ':' + padTimeComponent(minute) + ':' + padTimeComponent(second) + '\x20GMT';
};
