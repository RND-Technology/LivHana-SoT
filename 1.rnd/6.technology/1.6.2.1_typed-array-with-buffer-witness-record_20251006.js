'use strict';

const hasOwn = require('hasown');
const isTypedArray = require('is-typed-array');

const isInteger = require('../isInteger');

module.exports = function isTypedArrayWithBufferWitnessRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === 'DETACHED'
		)
		&& isTypedArray(value['[[Object]]']);
};
