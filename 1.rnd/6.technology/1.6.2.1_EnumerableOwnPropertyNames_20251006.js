'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const objectKeys = require('object-keys');
const safePushApply = require('safe-push-apply');
const callBound = require('call-bound');

const $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

const forEach = require('../helpers/forEach');

// https://262.ecma-international.org/8.0/#sec-enumerableownproperties

module.exports = function EnumerableOwnPropertyNames(O, kind) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	const keys = objectKeys(O);
	if (kind === 'key') {
		return keys;
	}
	if (kind === 'value' || kind === 'key+value') {
		const results = [];
		forEach(keys, function (key) {
			if ($isEnumerable(O, key)) {
				safePushApply(results, [
					kind === 'value' ? O[key] : [key, O[key]]
				]);
			}
		});
		return results;
	}
	throw new $TypeError('Assertion failed: "kind" is not "key", "value", or "key+value": ' + kind);
};
