'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Uint8Array = GetIntrinsic('%Uint8Array%', true);
const $Uint32Array = GetIntrinsic('%Uint32Array%', true);

const typedArrayBuffer = require('typed-array-buffer');

const uInt32 = $Uint32Array && new $Uint32Array([0x12345678]);
const uInt8 = uInt32 && new $Uint8Array(typedArrayBuffer(uInt32));

module.exports = uInt8
	? uInt8[0] === 0x78
		? 'little'
		: uInt8[0] === 0x12
			? 'big'
			: uInt8[0] === 0x34
				? 'mixed' // https://developer.mozilla.org/en-US/docs/Glossary/Endianness
				: 'unknown' // ???
	: 'indeterminate'; // no way to know
