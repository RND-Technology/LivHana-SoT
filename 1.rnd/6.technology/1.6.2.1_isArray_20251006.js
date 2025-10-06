'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Array = GetIntrinsic('%Array%');

// eslint-disable-next-line global-require
const toStr = !$Array.isArray && require('call-bound')('Object.prototype.toString');

module.exports = $Array.isArray || function IsArray(argument) {
	return toStr(argument) === '[object Array]';
};
