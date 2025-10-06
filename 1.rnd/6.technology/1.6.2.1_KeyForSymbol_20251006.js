'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');

const $keyFor = callBound('Symbol.keyFor', true);

// https://262.ecma-international.org/14.0/#sec-keyforsymbol

module.exports = function KeyForSymbol(sym) {
	if (typeof sym !== 'symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return $keyFor(sym);
};
