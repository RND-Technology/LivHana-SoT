'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const regexExec = require('call-bound')('RegExp.prototype.exec');

const Call = require('./Call');
const Get = require('./Get');
const IsCallable = require('./IsCallable');

// https://262.ecma-international.org/6.0/#sec-regexpexec

module.exports = function RegExpExec(R, S) {
	if (!isObject(R)) {
		throw new $TypeError('Assertion failed: `R` must be an Object');
	}
	if (typeof S !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}
	const exec = Get(R, 'exec');
	if (IsCallable(exec)) {
		const result = Call(exec, R, [S]);
		if (result === null || isObject(result)) {
			return result;
		}
		throw new $TypeError('"exec" method must return `null` or an Object');
	}
	return regexExec(R, S);
};
