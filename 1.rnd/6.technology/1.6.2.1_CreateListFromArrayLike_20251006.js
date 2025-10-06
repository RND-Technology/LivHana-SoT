'use strict';

const callBound = require('call-bound');

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const $indexOf = callBound('Array.prototype.indexOf', true) || callBound('String.prototype.indexOf');

const Get = require('./Get');
const IsArray = require('./IsArray');
const ToLength = require('./ToLength');
const ToString = require('./ToString');
const Type = require('./Type');

const defaultElementTypes = ['Undefined', 'Null', 'Boolean', 'String', 'Symbol', 'Number', 'Object'];

// https://262.ecma-international.org/6.0/#sec-createlistfromarraylike
module.exports = function CreateListFromArrayLike(obj) {
	const elementTypes = arguments.length > 1
		? arguments[1]
		: defaultElementTypes;

	if (!isObject(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be an Object');
	}
	if (!IsArray(elementTypes)) {
		throw new $TypeError('Assertion failed: `elementTypes`, if provided, must be an array');
	}
	const len = ToLength(Get(obj, 'length'));
	const list = [];
	let index = 0;
	while (index < len) {
		const indexName = ToString(index);
		const next = Get(obj, indexName);
		const nextType = Type(next);
		if ($indexOf(elementTypes, nextType) < 0) {
			throw new $TypeError('item type ' + nextType + ' is not a valid elementType');
		}
		list[list.length] = next;
		index += 1;
	}
	return list;
};
