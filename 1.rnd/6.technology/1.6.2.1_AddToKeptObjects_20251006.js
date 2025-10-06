'use strict';

const SLOT = require('internal-slot');

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const ClearKeptObjects = require('./ClearKeptObjects');

// https://262.ecma-international.org/12.0/#sec-addtokeptobjects

module.exports = function AddToKeptObjects(object) {
	if (!isObject(object)) {
		throw new $TypeError('Assertion failed: `object` must be an Object');
	}
	const arr = SLOT.get(ClearKeptObjects, '[[es-abstract internal: KeptAlive]]');
	arr[arr.length] = object;
};
