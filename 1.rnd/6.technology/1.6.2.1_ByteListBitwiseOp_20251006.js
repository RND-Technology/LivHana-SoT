'use strict';

const $TypeError = require('es-errors/type');

const IsArray = require('./IsArray');

const isByteValue = require('../helpers/isByteValue');

// https://262.ecma-international.org/12.0/#sec-bytelistbitwiseop

module.exports = function ByteListBitwiseOp(op, xBytes, yBytes) {
	if (op !== '&' && op !== '^' && op !== '|') {
		throw new $TypeError('Assertion failed: `op` must be `&`, `^`, or `|`');
	}
	if (!IsArray(xBytes) || !IsArray(yBytes) || xBytes.length !== yBytes.length) {
		throw new $TypeError('Assertion failed: `xBytes` and `yBytes` must be same-length sequences of byte values (an integer 0-255, inclusive)');
	}

	const result = [];

	for (let i = 0; i < xBytes.length; i += 1) {
		const xByte = xBytes[i];
		const yByte = yBytes[i];
		if (!isByteValue(xByte) || !isByteValue(yByte)) {
			throw new $TypeError('Assertion failed: `xBytes` and `yBytes` must be same-length sequences of byte values (an integer 0-255, inclusive)');
		}
		var resultByte;
		if (op === '&') {
			resultByte = xByte & yByte;
		} else if (op === '^') {
			resultByte = xByte ^ yByte;
		} else {
			resultByte = xByte | yByte;
		}
		result[result.length] = resultByte;
	}

	return result;
};
