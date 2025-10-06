'use strict';

const callBound = require('call-bound');

const $RangeError = require('es-errors/range');
const $TypeError = require('es-errors/type');

const $charAt = callBound('String.prototype.charAt');
const $reverse = callBound('Array.prototype.reverse');
const $slice = callBound('Array.prototype.slice');

const hasOwnProperty = require('./HasOwnProperty');
const IsArray = require('./IsArray');

const bytesAsFloat32 = require('../helpers/bytesAsFloat32');
const bytesAsFloat64 = require('../helpers/bytesAsFloat64');
const bytesAsInteger = require('../helpers/bytesAsInteger');
const every = require('../helpers/every');
const isByteValue = require('../helpers/isByteValue');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/8.0/#sec-rawbytestonumber

module.exports = function RawBytesToNumber(type, rawBytes, isLittleEndian) {
	if (typeof type !== 'string' || !hasOwnProperty(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be a TypedArray element type');
	}
	if (!IsArray(rawBytes) || !every(rawBytes, isByteValue)) {
		throw new $TypeError('Assertion failed: `rawBytes` must be an Array of bytes');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	const elementSize = tableTAO.size['$' + type]; // step 1

	if (rawBytes.length !== elementSize) {
		// this assertion is not in the spec, but it'd be an editorial error if it were ever violated
		throw new $RangeError('Assertion failed: `rawBytes` must have a length of ' + elementSize + ' for type ' + type);
	}

	// eslint-disable-next-line no-param-reassign
	rawBytes = $slice(rawBytes, 0, elementSize);
	if (!isLittleEndian) {
		$reverse(rawBytes); // step 2
	}

	if (type === 'Float32') { // step 3
		return bytesAsFloat32(rawBytes);
	}

	if (type === 'Float64') { // step 4
		return bytesAsFloat64(rawBytes);
	}

	return bytesAsInteger(rawBytes, elementSize, $charAt(type, 0) === 'U', false);
};
