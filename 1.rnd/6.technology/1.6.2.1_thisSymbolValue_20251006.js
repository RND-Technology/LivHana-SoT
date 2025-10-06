'use strict';

const $SyntaxError = require('es-errors/syntax');
const callBound = require('call-bound');

const $SymbolValueOf = callBound('Symbol.prototype.valueOf', true);

// https://262.ecma-international.org/9.0/#sec-thissymbolvalue

module.exports = function thisSymbolValue(value) {
	if (typeof value === 'symbol') {
		return value;
	}

	if (!$SymbolValueOf) {
		throw new $SyntaxError('Symbols are not supported; thisSymbolValue requires that `value` be a Symbol or a Symbol object');
	}

	return $SymbolValueOf(value);
};
