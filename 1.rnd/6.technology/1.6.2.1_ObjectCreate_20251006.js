'use strict';

const GetIntrinsic = require('get-intrinsic');

const $ObjectCreate = GetIntrinsic('%Object.create%', true);
const $TypeError = require('es-errors/type');
const $SyntaxError = require('es-errors/syntax');
const isObject = require('es-object-atoms/isObject');

const IsArray = require('./IsArray');

const forEach = require('../helpers/forEach');

const SLOT = require('internal-slot');

const hasProto = require('has-proto')();

// https://262.ecma-international.org/6.0/#sec-objectcreate

module.exports = function ObjectCreate(proto, internalSlotsList) {
	if (proto !== null && !isObject(proto)) {
		throw new $TypeError('Assertion failed: `proto` must be null or an object');
	}
	const slots = arguments.length < 2 ? [] : internalSlotsList; // step 1
	if (arguments.length >= 2 && !IsArray(slots)) {
		throw new $TypeError('Assertion failed: `internalSlotsList` must be an Array');
	}

	let O;
	if (hasProto) {
		O = { __proto__: proto };
	} else if ($ObjectCreate) {
		O = $ObjectCreate(proto);
	} else {
		if (proto === null) {
			throw new $SyntaxError('native Object.create support is required to create null objects');
		}
		const T = function T() {};
		T.prototype = proto;
		O = new T();
	}

	if (slots.length > 0) {
		forEach(slots, function (slot) {
			SLOT.set(O, slot, void undefined);
		});
	}

	return O; // step 6
};
