'use strict';

const $TypeError = require('es-errors/type');

const hasOwnProperty = require('./HasOwnProperty');
const ToInt16 = require('./ToInt16');
const ToInt32 = require('./ToInt32');
const ToInt8 = require('./ToInt8');
const ToUint16 = require('./ToUint16');
const ToUint32 = require('./ToUint32');
const ToUint8 = require('./ToUint8');
const ToUint8Clamp = require('./ToUint8Clamp');

const valueToFloat32Bytes = require('../helpers/valueToFloat32Bytes');
const valueToFloat64Bytes = require('../helpers/valueToFloat64Bytes');
const integerToNBytes = require('../helpers/integerToNBytes');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/8.0/#table-50

const TypeToAO = {
	__proto__: null,
	$Int8: ToInt8,
	$Uint8: ToUint8,
	$Uint8C: ToUint8Clamp,
	$Int16: ToInt16,
	$Uint16: ToUint16,
	$Int32: ToInt32,
	$Uint32: ToUint32
};

// https://262.ecma-international.org/8.0/#sec-numbertorawbytes

module.exports = function NumberToRawBytes(type, value, isLittleEndian) {
	if (typeof type !== 'string' || !hasOwnProperty(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be a TypedArray element type');
	}
	if (typeof value !== 'number') {
		throw new $TypeError('Assertion failed: `value` must be a Number');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	if (type === 'Float32') { // step 1
		return valueToFloat32Bytes(value, isLittleEndian);
	} else if (type === 'Float64') { // step 2
		return valueToFloat64Bytes(value, isLittleEndian);
	} // step 3

	const n = tableTAO.size['$' + type]; // step 3.a

	const convOp = TypeToAO['$' + type]; // step 3.b

	const intValue = convOp(value); // step 3.c

	return integerToNBytes(intValue, n, isLittleEndian); // step 3.d, 3.e, 4
};
