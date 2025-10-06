'use strict';

const floor = require('./floor');
const modulo = require('./modulo');

const timeConstants = require('../helpers/timeConstants');
const msPerHour = timeConstants.msPerHour;
const HoursPerDay = timeConstants.HoursPerDay;

// https://262.ecma-international.org/5.1/#sec-15.9.1.10

module.exports = function HourFromTime(t) {
	return modulo(floor(t / msPerHour), HoursPerDay);
};
