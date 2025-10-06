'use strict';

const $floor = require('./floor');

/** @type {import('./mod')} */
module.exports = function mod(number, modulo) {
	const remain = number % modulo;
	return $floor(remain >= 0 ? remain : remain + modulo);
};
