'use strict';

const define = require('define-properties');
const getPolyfill = require('./polyfill');

module.exports = function shimAssign() {
	const polyfill = getPolyfill();
	define(
		Object,
		{ assign: polyfill },
		{ assign: function () { return Object.assign !== polyfill; } }
	);
	return polyfill;
};
