'use strict';

const callBind = require('call-bind');

const I402 = typeof Intl === 'undefined' ? null : Intl;
const DateTimeFormat = I402 && I402.DateTimeFormat;
const resolvedOptions = DateTimeFormat && callBind(DateTimeFormat.prototype.resolvedOptions);

// https://262.ecma-international.org/14.0/#sec-defaulttimezone
// https://tc39.es/ecma402/2023/#sup-defaulttimezone

module.exports = function DefaultTimeZone() {
	if (DateTimeFormat && resolvedOptions) {
		return resolvedOptions(new DateTimeFormat()).timeZone;

	}
	return 'UTC';
};
