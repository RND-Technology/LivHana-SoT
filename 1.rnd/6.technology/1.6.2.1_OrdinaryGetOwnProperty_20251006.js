'use strict';

const $gOPD = require('gopd');
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const hasOwn = require('hasown');
const callBound = require('call-bound');

const $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

const IsArray = require('./IsArray');
const isPropertyKey = require('../helpers/isPropertyKey');
const IsRegExp = require('./IsRegExp');
const ToPropertyDescriptor = require('./ToPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-ordinarygetownproperty

module.exports = function OrdinaryGetOwnProperty(O, P) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: O must be an Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P must be a Property Key');
	}
	if (!hasOwn(O, P)) {
		return void 0;
	}
	if (!$gOPD) {
		// ES3 / IE 8 fallback
		const arrayLength = IsArray(O) && P === 'length';
		const regexLastIndex = IsRegExp(O) && P === 'lastIndex';
		return {
			'[[Configurable]]': !(arrayLength || regexLastIndex),
			'[[Enumerable]]': $isEnumerable(O, P),
			'[[Value]]': O[P],
			'[[Writable]]': true
		};
	}
	return ToPropertyDescriptor($gOPD(O, P));
};
