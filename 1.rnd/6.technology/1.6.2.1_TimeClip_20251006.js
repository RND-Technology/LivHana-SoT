'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Date = GetIntrinsic('%Date%');

const $isFinite = require('math-intrinsics/isFinite');
const abs = require('math-intrinsics/abs');

const ToNumber = require('./ToNumber');

// https://262.ecma-international.org/5.1/#sec-15.9.1.14

module.exports = function TimeClip(time) {
	if (!$isFinite(time) || abs(time) > 8.64e15) {
		return NaN;
	}
	return +new $Date(ToNumber(time));
};

