'use strict';

const hasOwn = require('hasown');
const isDataView = require('is-data-view');

const isInteger = require('../isInteger');

module.exports = function isDataViewWithBufferWitnessRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === 'DETACHED'
		)
		&& isDataView(value['[[Object]]']);
};
