'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bound');

const $RangeError = require('es-errors/range');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const $BigInt = GetIntrinsic('%BigInt%', true);

const hasOwnProperty = require('./HasOwnProperty');
const IsArray = require('./IsArray');
const IsBigIntElementType = require('./IsBigIntElementType');
const IsUnsignedElementType = require('./IsUnsignedElementType');

const bytesAsFloat32 = require('../helpers/bytesAsFloat32');
const bytesAsFloat64 = require('../helpers/bytesAsFloat64');
const bytesAsInteger = require('../helpers/bytesAsInteger');
const every = require('../helpers/every');
const isByteValue = require('../helpers/isByteValue');

const $reverse = callBound('Array.prototype.reverse');
const $slice = callBound('Array.prototype.slice');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/11.0/#sec-rawbytestonumeric

module.exports = function RawBytesToNumeric(type, rawBytes, isLittleEndian) {
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

	const isBigInt = IsBigIntElementType(type);
	if (isBigInt && !$BigInt) {
		throw new $SyntaxError('this environment does not support BigInts');
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

	return bytesAsInteger(rawBytes, elementSize, IsUnsignedElementType(type), isBigInt);
};
