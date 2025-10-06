'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const callBound = require('call-bound');
const OwnPropertyKeys = require('own-keys');

const every = require('../helpers/every');
const forEach = require('../helpers/forEach');

const $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

const CreateDataProperty = require('./CreateDataProperty');
const Get = require('./Get');
const IsArray = require('./IsArray');
const IsInteger = require('./IsInteger');
const isPropertyKey = require('../helpers/isPropertyKey');
const SameValue = require('./SameValue');
const ToNumber = require('./ToNumber');
const ToObject = require('./ToObject');

// https://262.ecma-international.org/9.0/#sec-copydataproperties

module.exports = function CopyDataProperties(target, source, excludedItems) {
	if (!isObject(target)) {
		throw new $TypeError('Assertion failed: "target" must be an Object');
	}

	if (!IsArray(excludedItems) || !every(excludedItems, isPropertyKey)) {
		throw new $TypeError('Assertion failed: "excludedItems" must be a List of Property Keys');
	}

	if (typeof source === 'undefined' || source === null) {
		return target;
	}

	const fromObj = ToObject(source);

	const sourceKeys = OwnPropertyKeys(fromObj);
	forEach(sourceKeys, function (nextKey) {
		let excluded = false;

		forEach(excludedItems, function (e) {
			if (SameValue(e, nextKey) === true) {
				excluded = true;
			}
		});

		const enumerable = $isEnumerable(fromObj, nextKey) || (
			// this is to handle string keys being non-enumerable in older engines
			typeof source === 'string'
			&& nextKey >= 0
			&& IsInteger(ToNumber(nextKey))
		);
		if (excluded === false && enumerable) {
			const propValue = Get(fromObj, nextKey);
			CreateDataProperty(target, nextKey, propValue);
		}
	});

	return target;
};
