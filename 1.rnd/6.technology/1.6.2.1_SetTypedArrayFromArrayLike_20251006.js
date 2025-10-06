'use strict';

const $RangeError = require('es-errors/range');
const $TypeError = require('es-errors/type');

const isTypedArray = require('is-typed-array');
const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const typedArrayLength = require('typed-array-length');
const whichTypedArray = require('which-typed-array');
const isInteger = require('math-intrinsics/isInteger');

const Get = require('./Get');
const IsBigIntElementType = require('./IsBigIntElementType');
const IsDetachedBuffer = require('./IsDetachedBuffer');
const LengthOfArrayLike = require('./LengthOfArrayLike');
const SetValueInBuffer = require('./SetValueInBuffer');
const ToBigInt = require('./ToBigInt');
const ToNumber = require('./ToNumber');
const ToObject = require('./ToObject');
const ToString = require('./ToString');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/12.0/#sec-settypedarrayfromarraylike

module.exports = function SetTypedArrayFromArrayLike(target, targetOffset, source) {
	const whichTarget = whichTypedArray(target);
	if (!whichTarget) {
		throw new $TypeError('Assertion failed: target must be a TypedArray instance');
	}

	if (targetOffset !== Infinity && (!isInteger(targetOffset) || targetOffset < 0)) {
		throw new $TypeError('Assertion failed: targetOffset must be a non-negative integer or +Infinity');
	}

	if (isTypedArray(source)) {
		throw new $TypeError('Assertion failed: source must not be a TypedArray instance'); // step 1
	}

	const targetBuffer = typedArrayBuffer(target); // step 2

	if (IsDetachedBuffer(targetBuffer)) {
		throw new $TypeError('target’s buffer is detached'); // step 3
	}

	const targetLength = typedArrayLength(target); // step 4

	const targetName = whichTarget; // step 5

	const targetType = tableTAO.name['$' + targetName]; // step 7

	const targetElementSize = tableTAO.size['$' + targetType]; // step 6

	const targetByteOffset = typedArrayByteOffset(target); // step 8

	const src = ToObject(source); // step 9

	const srcLength = LengthOfArrayLike(src); // step 10

	if (targetOffset === Infinity) {
		throw new $RangeError('targetOffset must be a finite integer'); // step 11
	}

	if (srcLength + targetOffset > targetLength) {
		throw new $RangeError('targetOffset + srcLength must be <= target.length'); // step 12
	}

	let targetByteIndex = (targetOffset * targetElementSize) + targetByteOffset; // step 13

	let k = 0; // step 14

	const limit = targetByteIndex + (targetElementSize * srcLength); // step 15

	while (targetByteIndex < limit) { // step 16
		const Pk = ToString(k); // step 16.a

		let value = Get(src, Pk); // step 16.b

		if (IsBigIntElementType(targetType)) {
			value = ToBigInt(value); // step 16.c
		} else {
			value = ToNumber(value); // step 16.d
		}

		if (IsDetachedBuffer(targetBuffer)) {
			throw new $TypeError('target’s buffer is detached'); // step 16.e
		}

		SetValueInBuffer(targetBuffer, targetByteIndex, targetType, value, true, 'Unordered'); // step 16.f

		k += 1; // step 16.g

		targetByteIndex += targetElementSize; // step 16.h
	}
};
