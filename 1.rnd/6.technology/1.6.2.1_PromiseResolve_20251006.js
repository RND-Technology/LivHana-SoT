'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBind = require('call-bind');
const $SyntaxError = require('es-errors/syntax');

const $resolve = GetIntrinsic('%Promise.resolve%', true);
const $PromiseResolve = $resolve && callBind($resolve);

// https://262.ecma-international.org/9.0/#sec-promise-resolve

module.exports = function PromiseResolve(C, x) {
	if (!$PromiseResolve) {
		throw new $SyntaxError('This environment does not support Promises.');
	}
	return $PromiseResolve(C, x);
};

