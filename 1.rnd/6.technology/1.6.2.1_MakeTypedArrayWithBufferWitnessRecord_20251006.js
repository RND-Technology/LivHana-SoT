'use strict';

const $TypeError = require('es-errors/type');

const ArrayBufferByteLength = require('./ArrayBufferByteLength');
const IsDetachedBuffer = require('./IsDetachedBuffer');

const isTypedArray = require('is-typed-array');
const typedArrayBuffer = require('typed-array-buffer');

// https://262.ecma-international.org/15.0/#sec-maketypedarraywithbufferwitnessrecord

module.exports = function MakeTypedArrayWithBufferWitnessRecord(obj, order) {
	if (!isTypedArray(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be a Typed Array');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	const buffer = typedArrayBuffer(obj); // step 1

	const byteLength = IsDetachedBuffer(buffer) ? 'DETACHED' : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};
