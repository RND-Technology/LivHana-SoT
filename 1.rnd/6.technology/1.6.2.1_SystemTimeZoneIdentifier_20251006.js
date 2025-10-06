'use strict';

const callBind = require('call-bind');

const I402 = typeof Intl === 'undefined' ? null : Intl;
const DateTimeFormat = I402 && I402.DateTimeFormat;
const resolvedOptions = DateTimeFormat && callBind(DateTimeFormat.prototype.resolvedOptions);

// https://262.ecma-international.org/15.0/#sec-systemtimezoneidentifier

module.exports = function SystemTimeZoneIdentifier() {
	if (DateTimeFormat && resolvedOptions) {
		return resolvedOptions(new DateTimeFormat()).timeZone; // steps 2 - 3

	}

	return 'UTC'; // step 1
};
