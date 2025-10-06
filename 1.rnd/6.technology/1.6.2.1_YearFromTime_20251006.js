'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Date = GetIntrinsic('%Date%');

const callBound = require('call-bound');

const $getUTCFullYear = callBound('Date.prototype.getUTCFullYear');

// https://262.ecma-international.org/5.1/#sec-15.9.1.3

module.exports = function YearFromTime(t) {
	// largest y such that this.TimeFromYear(y) <= t
	return $getUTCFullYear(new $Date(t));
};
