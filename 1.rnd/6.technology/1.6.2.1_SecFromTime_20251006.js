'use strict';

const floor = require('./floor');
const modulo = require('./modulo');

const timeConstants = require('../helpers/timeConstants');
const msPerSecond = timeConstants.msPerSecond;
const SecondsPerMinute = timeConstants.SecondsPerMinute;

// https://262.ecma-international.org/5.1/#sec-15.9.1.10

module.exports = function SecFromTime(t) {
	return modulo(floor(t / msPerSecond), SecondsPerMinute);
};
