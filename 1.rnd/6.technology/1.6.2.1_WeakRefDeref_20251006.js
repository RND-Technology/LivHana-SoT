'use strict';

const callBound = require('call-bound');

const $TypeError = require('es-errors/type');
const $deref = callBound('WeakRef.prototype.deref', true);

const isWeakRef = require('is-weakref');

const AddToKeptObjects = require('./AddToKeptObjects');

// https://262.ecma-international.org/12.0/#sec-weakrefderef

module.exports = function WeakRefDeref(weakRef) {
	if (!isWeakRef(weakRef)) {
		throw new $TypeError('Assertion failed: `weakRef` must be a WeakRef');
	}
	const target = $deref(weakRef);
	if (target) {
		AddToKeptObjects(target);
	}
	return target;
};
