'use strict';

const GetIntrinsic = require('get-intrinsic');

const $match = GetIntrinsic('%Symbol.match%', true);

const hasRegExpMatcher = require('is-regex');
const isObject = require('es-object-atoms/isObject');

const ToBoolean = require('./ToBoolean');

// https://262.ecma-international.org/6.0/#sec-isregexp

module.exports = function IsRegExp(argument) {
	if (!isObject(argument)) {
		return false;
	}
	if ($match) {
		const isRegExp = argument[$match];
		if (typeof isRegExp !== 'undefined') {
			return ToBoolean(isRegExp);
		}
	}
	return hasRegExpMatcher(argument);
};
