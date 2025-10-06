'use strict';

const $DateGetTime = require('call-bound')('Date.prototype.getTime');

module.exports = function timeValue(x) {
	return $DateGetTime(x);
};
