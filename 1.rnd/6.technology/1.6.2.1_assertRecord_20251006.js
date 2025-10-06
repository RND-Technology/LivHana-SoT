'use strict';

// TODO, semver-major: delete this

const $TypeError = require('es-errors/type');
const $SyntaxError = require('es-errors/syntax');

const isMatchRecord = require('./records/match-record');
const isPropertyDescriptor = require('./records/property-descriptor');
const isIteratorRecord = require('./records/iterator-record-2023');
const isPromiseCapabilityRecord = require('./records/promise-capability-record');
const isAsyncGeneratorRequestRecord = require('./records/async-generator-request-record');
const isRegExpRecord = require('./records/regexp-record');

const predicates = {
	'Property Descriptor': isPropertyDescriptor,
	'Match Record': isMatchRecord,
	'Iterator Record': isIteratorRecord,
	'PromiseCapability Record': isPromiseCapabilityRecord,
	'AsyncGeneratorRequest Record': isAsyncGeneratorRequestRecord,
	'RegExp Record': isRegExpRecord
};

module.exports = function assertRecord(Type, recordType, argumentName, value) {
	const predicate = predicates[recordType];
	if (typeof predicate !== 'function') {
		throw new $SyntaxError('unknown record type: ' + recordType);
	}
	if (!predicate(value)) {
		throw new $TypeError(argumentName + ' must be a ' + recordType);
	}
};
