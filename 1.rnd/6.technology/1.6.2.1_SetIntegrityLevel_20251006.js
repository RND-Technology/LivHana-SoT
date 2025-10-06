'use strict';

const GetIntrinsic = require('get-intrinsic');

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const $gOPD = require('gopd');
const $preventExtensions = GetIntrinsic('%Object.preventExtensions%', true);
const $gOPN = GetIntrinsic('%Object.getOwnPropertyNames%', true);

const forEach = require('../helpers/forEach');

const DefinePropertyOrThrow = require('./DefinePropertyOrThrow');
const IsAccessorDescriptor = require('./IsAccessorDescriptor');
const ToPropertyDescriptor = require('./ToPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-setintegritylevel

module.exports = function SetIntegrityLevel(O, level) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (level !== 'sealed' && level !== 'frozen') {
		throw new $TypeError('Assertion failed: `level` must be `"sealed"` or `"frozen"`');
	}
	if (!$preventExtensions) {
		throw new $SyntaxError('SetIntegrityLevel requires native `Object.preventExtensions` support');
	}
	const status = $preventExtensions(O);
	if (!status) {
		return false;
	}
	if (!$gOPN) {
		throw new $SyntaxError('SetIntegrityLevel requires native `Object.getOwnPropertyNames` support');
	}
	const theKeys = $gOPN(O);
	if (level === 'sealed') {
		forEach(theKeys, function (k) {
			DefinePropertyOrThrow(O, k, { configurable: false });
		});
	} else if (level === 'frozen') {
		forEach(theKeys, function (k) {
			const currentDesc = $gOPD(O, k);
			if (typeof currentDesc !== 'undefined') {
				let desc;
				if (IsAccessorDescriptor(ToPropertyDescriptor(currentDesc))) {
					desc = { configurable: false };
				} else {
					desc = { configurable: false, writable: false };
				}
				DefinePropertyOrThrow(O, k, desc);
			}
		});
	}
	return true;
};
