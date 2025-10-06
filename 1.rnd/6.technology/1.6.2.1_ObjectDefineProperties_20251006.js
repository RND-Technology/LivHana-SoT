'use strict';

const DefinePropertyOrThrow = require('./DefinePropertyOrThrow');
const Get = require('./Get');
const OrdinaryGetOwnProperty = require('./OrdinaryGetOwnProperty');
const ToObject = require('./ToObject');
const ToPropertyDescriptor = require('./ToPropertyDescriptor');

const forEach = require('../helpers/forEach');
const OwnPropertyKeys = require('own-keys');

// https://262.ecma-international.org/6.0/#sec-objectdefineproperties

/** @type {<T extends Record<PropertyKey, unknown> = {}>(O: T, Properties: object) => T} */
module.exports = function ObjectDefineProperties(O, Properties) {
	const props = ToObject(Properties); // step 1
	const keys = OwnPropertyKeys(props); // step 2
	/** @type {[string | symbol, import('../types').Descriptor][]} */
	const descriptors = []; // step 3

	forEach(keys, function (nextKey) { // step 4
		const propDesc = OrdinaryGetOwnProperty(props, nextKey); // ToPropertyDescriptor(getOwnPropertyDescriptor(props, nextKey)); // step 4.a
		if (typeof propDesc !== 'undefined' && propDesc['[[Enumerable]]']) { // step 4.b
			const descObj = Get(props, nextKey); // step 4.b.i
			const desc = ToPropertyDescriptor(descObj); // step 4.b.ii
			descriptors[descriptors.length] = [nextKey, desc]; // step 4.b.iii
		}
	});

	forEach(descriptors, function (pair) { // step 5
		const P = pair[0]; // step 5.a
		const desc = pair[1]; // step 5.b
		DefinePropertyOrThrow(O, P, desc); // step 5.c
	});

	return O; // step 6
};
