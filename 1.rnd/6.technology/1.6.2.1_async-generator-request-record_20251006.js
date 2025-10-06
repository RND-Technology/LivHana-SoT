'use strict';

const hasOwn = require('hasown');

const isPromiseCapabilityRecord = require('./promise-capability-record');

module.exports = function isAsyncGeneratorRequestRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Completion]]') // TODO: confirm is a completion record
		&& hasOwn(value, '[[Capability]]')
		&& isPromiseCapabilityRecord(value['[[Capability]]']);
};
