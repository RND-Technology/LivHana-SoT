'use strict';

const GetIntrinsic = require('get-intrinsic');

const $preventExtensions = GetIntrinsic('%Object.preventExtensions%', true);
const $isExtensible = GetIntrinsic('%Object.isExtensible%', true);

const isPrimitive = require('../helpers/isPrimitive');

// https://262.ecma-international.org/6.0/#sec-isextensible-o

module.exports = $preventExtensions
	? function IsExtensible(obj) {
		return !isPrimitive(obj) && $isExtensible(obj);
	}
	: function IsExtensible(obj) {
		return !isPrimitive(obj);
	};
