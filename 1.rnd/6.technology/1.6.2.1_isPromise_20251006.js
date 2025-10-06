'use strict';

const callBound = require('call-bound');

const $PromiseThen = callBound('Promise.prototype.then', true);

const isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/6.0/#sec-ispromise

module.exports = function IsPromise(x) {
	if (!isObject(x)) {
		return false;
	}
	if (!$PromiseThen) { // Promises are not supported
		return false;
	}
	try {
		$PromiseThen(x); // throws if not a promise
	} catch (e) {
		return false;
	}
	return true;
};
