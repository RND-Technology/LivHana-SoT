'use strict';

const functionName = require('function.prototype.name');

const anon = functionName(function () {});

module.exports = function isAbstractClosure(x) {
	return typeof x === 'function' && (!x.prototype || functionName(x) === anon);
};
