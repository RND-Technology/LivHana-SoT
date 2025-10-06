'use strict';

const GetIntrinsic = require('get-intrinsic');

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const $hasInstance = GetIntrinsic('%Symbol.hasInstance%', true);

const Call = require('./Call');
const GetMethod = require('./GetMethod');
const IsCallable = require('./IsCallable');
const OrdinaryHasInstance = require('./OrdinaryHasInstance');
const ToBoolean = require('./ToBoolean');

// https://262.ecma-international.org/6.0/#sec-instanceofoperator

module.exports = function InstanceofOperator(O, C) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	const instOfHandler = $hasInstance ? GetMethod(C, $hasInstance) : void 0;
	if (typeof instOfHandler !== 'undefined') {
		return ToBoolean(Call(instOfHandler, C, [O]));
	}
	if (!IsCallable(C)) {
		throw new $TypeError('`C` is not Callable');
	}
	return OrdinaryHasInstance(C, O);
};
