'use strict';

const GetIntrinsic = require('get-intrinsic');

const min = require('math-intrinsics/min');
const $TypeError = require('es-errors/type');
const $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);
const $Uint8Array = GetIntrinsic('%Uint8Array%', true);

const callBound = require('call-bound');

const byteLength = require('array-buffer-byte-length');
const $maxByteLength = callBound('%ArrayBuffer.prototype.maxByteLength%', true);
const copy = function copyAB(src, start, end) {
	const that = new $Uint8Array(src);
	if (typeof end === 'undefined') {
		end = that.length; // eslint-disable-line no-param-reassign
	}
	const result = new $ArrayBuffer(end - start);
	const resultArray = new $Uint8Array(result);
	for (let i = 0; i < resultArray.length; i++) {
		resultArray[i] = that[i + start];
	}
	return result;
};
const $abSlice = callBound('%ArrayBuffer.prototype.slice%', true)
	|| function slice(ab, a, b) { // in node < 0.11, slice is an own nonconfigurable property
		return ab.slice ? ab.slice(a, b) : copy(ab, a, b); // node 0.8 lacks `slice`
	};

const DetachArrayBuffer = require('./DetachArrayBuffer');
const IsDetachedBuffer = require('./IsDetachedBuffer');
const IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
const ToIndex = require('./ToIndex');

const isArrayBuffer = require('is-array-buffer');
const isSharedArrayBuffer = require('is-shared-array-buffer');

// https://262.ecma-international.org/15.0/#sec-arraybuffercopyanddetach

module.exports = function ArrayBufferCopyAndDetach(arrayBuffer, newLength, preserveResizability) {
	if (preserveResizability !== 'PRESERVE-RESIZABILITY' && preserveResizability !== 'FIXED-LENGTH') {
		throw new $TypeError('`preserveResizability` must be ~PRESERVE-RESIZABILITY~ or ~FIXED-LENGTH~');
	}

	if (!isArrayBuffer(arrayBuffer) || isSharedArrayBuffer(arrayBuffer)) {
		throw new $TypeError('`arrayBuffer` must be a non-shared ArrayBuffer'); // steps 1 - 2
	}

	let abByteLength;

	let newByteLength;
	if (typeof newLength === 'undefined') { // step 3
		newByteLength = byteLength(arrayBuffer); // step 3.a
		abByteLength = newByteLength;
	} else { // step 4
		newByteLength = ToIndex(newLength); // step 4.a
	}

	if (IsDetachedBuffer(arrayBuffer)) {
		throw new $TypeError('`arrayBuffer` must not be detached'); // step 5
	}

	let newMaxByteLength;
	if (preserveResizability === 'PRESERVE-RESIZABILITY' && !IsFixedLengthArrayBuffer(arrayBuffer)) { // step 6
		newMaxByteLength = $maxByteLength(arrayBuffer); // step 6.a
	} else { // step 7
		newMaxByteLength = 'EMPTY'; // step 7.a
	}

	// commented out since there's no way to set or access this key

	// 8. If arrayBuffer.[[ArrayBufferDetachKey]] is not undefined, throw a TypeError exception.

	// 9. Let newBuffer be ? AllocateArrayBuffer(%ArrayBuffer%, newByteLength, newMaxByteLength).
	let newBuffer = newMaxByteLength === 'EMPTY' ? new $ArrayBuffer(newByteLength) : new $ArrayBuffer(newByteLength, { maxByteLength: newMaxByteLength });

	if (typeof abByteLength !== 'number') {
		abByteLength = byteLength(arrayBuffer);
	}
	const copyLength = min(newByteLength, abByteLength); // step 10
	if (newByteLength > copyLength || newMaxByteLength !== 'EMPTY') {
		const taNew = new $Uint8Array(newBuffer);
		const taOld = new $Uint8Array(arrayBuffer);
		for (let i = 0; i < copyLength; i++) {
			taNew[i] = taOld[i];
		}
	} else {
		newBuffer = $abSlice(arrayBuffer, 0, copyLength); // ? optimization for when the new buffer will not be larger than the old one
	}
	/*
	11. Let fromBlock be arrayBuffer.[[ArrayBufferData]].
	12. Let toBlock be newBuffer.[[ArrayBufferData]].
	13. Perform CopyDataBlockBytes(toBlock, 0, fromBlock, 0, copyLength).
	14. NOTE: Neither creation of the new Data Block nor copying from the old Data Block are observable. Implementations may implement this method as a zero-copy move or a realloc.
	*/

	DetachArrayBuffer(arrayBuffer); // step 15

	return newBuffer; // step 16
};
