'use strict';

const floor = require('./floor');
const modulo = require('./modulo');

const timeConstants = require('../helpers/timeConstants');
const msPerMinute = timeConstants.msPerMinute;
const MinutesPerHour = timeConstants.MinutesPerHour;

// https://262.ecma-international.org/5.1/#sec-15.9.1.10

module.exports = function MinFromTime(t) {
	return modulo(floor(t / msPerMinute), MinutesPerHour);
};
