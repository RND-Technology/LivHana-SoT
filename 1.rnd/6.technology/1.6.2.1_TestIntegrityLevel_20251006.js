'use strict';

const $gOPD = require('gopd');
const $TypeError = require('es-errors/type');

const every = require('../helpers/every');
const OwnPropertyKeys = require('own-keys');
const isObject = require('es-object-atoms/isObject');

const IsDataDescriptor = require('./IsDataDescriptor');
const IsExtensible = require('./IsExtensible');
const ToPropertyDescriptor = require('./ToPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-testintegritylevel

module.exports = function TestIntegrityLevel(O, level) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (level !== 'sealed' && level !== 'frozen') {
		throw new $TypeError('Assertion failed: `level` must be `"sealed"` or `"frozen"`');
	}
	const status = IsExtensible(O);
	if (status || !$gOPD) {
		return false;
	}
	const theKeys = OwnPropertyKeys(O);
	return theKeys.length === 0 || every(theKeys, function (k) {
		const currentDesc = $gOPD(O, k);
		if (typeof currentDesc !== 'undefined') {
			if (currentDesc.configurable) {
				return false;
			}
			if (level === 'frozen' && IsDataDescriptor(ToPropertyDescriptor(currentDesc)) && currentDesc.writable) {
				return false;
			}
		}
		return true;
	});
};
