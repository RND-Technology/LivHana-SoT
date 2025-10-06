'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');

const $replace = callBound('String.prototype.replace');

const RequireObjectCoercible = require('./RequireObjectCoercible');
const ToString = require('./ToString');

// https://262.ecma-international.org/6.0/#sec-createhtml

module.exports = function CreateHTML(string, tag, attribute, value) {
	if (typeof tag !== 'string' || typeof attribute !== 'string') {
		throw new $TypeError('Assertion failed: `tag` and `attribute` must be strings');
	}
	const str = RequireObjectCoercible(string);
	const S = ToString(str);
	let p1 = '<' + tag;
	if (attribute !== '') {
		const V = ToString(value);
		const escapedV = $replace(V, /\x22/g, '&quot;');
		p1 += '\x20' + attribute + '\x3D\x22' + escapedV + '\x22';
	}
	return p1 + '>' + S + '</' + tag + '>';
};
