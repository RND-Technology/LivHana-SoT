'use strict';

const trimStart = require('string.prototype.trimstart');
const trimEnd = require('string.prototype.trimend');

const $TypeError = require('es-errors/type');

const RequireObjectCoercible = require('./RequireObjectCoercible');
const ToString = require('./ToString');

// https://262.ecma-international.org/10.0/#sec-trimstring

module.exports = function TrimString(string, where) {
	const str = RequireObjectCoercible(string);
	const S = ToString(str);
	let T;
	if (where === 'start') {
		T = trimStart(S);
	} else if (where === 'end') {
		T = trimEnd(S);
	} else if (where === 'start+end') {
		T = trimStart(trimEnd(S));
	} else {
		throw new $TypeError('Assertion failed: invalid `where` value; must be "start", "end", or "start+end"');
	}
	return T;
};
