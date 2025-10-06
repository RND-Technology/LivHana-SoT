'use strict';

const $abs = require('./abs');
const $floor = require('./floor');

const $isNaN = require('./isNaN');
const $isFinite = require('./isFinite');

/** @type {import('./isInteger')} */
module.exports = function isInteger(argument) {
	if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
		return false;
	}
	const absValue = $abs(argument);
	return $floor(absValue) === absValue;
};
