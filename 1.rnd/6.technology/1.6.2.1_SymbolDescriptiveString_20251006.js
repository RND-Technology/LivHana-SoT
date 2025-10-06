'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');

const $SymbolToString = callBound('Symbol.prototype.toString', true);

// https://262.ecma-international.org/6.0/#sec-symboldescriptivestring

module.exports = function SymbolDescriptiveString(sym) {
	if (typeof sym !== 'symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return $SymbolToString(sym);
};
