'use strict';

const $TypeError = require('es-errors/type');

const SameValue = require('./SameValue');

const IsArray = require('../helpers/IsArray');
const every = require('../helpers/every');
const forEach = require('../helpers/forEach');

const hasOwn = require('hasown');

const isKeyedGroup = function (group) {
	return hasOwn(group, '[[Key]]')
        && hasOwn(group, '[[Elements]]')
        && IsArray(group['[[Elements]]']);
};

// https://262.ecma-international.org/15.0/#sec-add-value-to-keyed-group

module.exports = function AddValueToKeyedGroup(groups, key, value) {
	if (!IsArray(groups) || (groups.length > 0 && !every(groups, isKeyedGroup))) {
		throw new $TypeError('Assertion failed: `groups` must be a List of Records with [[Key]] and [[Elements]]');
	}

	let matched = 0;
	forEach(groups, function (g) { // step 1
		if (SameValue(g['[[Key]]'], key)) { // step 2
			matched += 1;
			if (matched > 1) {
				throw new $TypeError('Assertion failed: Exactly one element of groups meets this criterion'); // step 2.a
			}

			const arr = g['[[Elements]]'];
			arr[arr.length] = value; // step 2.b
		}
	});

	if (matched === 0) {
		const group = { '[[Key]]': key, '[[Elements]]': [value] }; // step 2

		// eslint-disable-next-line no-param-reassign
		groups[groups.length] = group; // step 3
	}
};
