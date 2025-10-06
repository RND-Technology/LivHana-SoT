'use strict';

const $TypeError = require('es-errors/type');

const GeneratorStart = require('./GeneratorStart');
const IsArray = require('es-abstract/2024/IsArray');
const IsCallable = require('es-abstract/2024/IsCallable');
const OrdinaryObjectCreate = require('es-abstract/2024/OrdinaryObjectCreate');

const every = require('es-abstract/helpers/every');

const SLOT = require('internal-slot');

const safeConcat = require('safe-array-concat');

const isString = function isString(slot) {
	return typeof slot === 'string';
};

module.exports = function CreateIteratorFromClosure(closure, generatorBrand, proto) {
	if (!IsCallable(closure)) {
		throw new $TypeError('`closure` must be a function');
	}
	if (typeof generatorBrand !== 'string') {
		throw new $TypeError('`generatorBrand` must be a string');
	}
	const extraSlots = arguments.length > 3 ? arguments[3] : [];
	if (arguments.length > 3) {
		if (!IsArray(extraSlots) || !every(extraSlots, isString)) {
			throw new $TypeError('`extraSlots` must be a List of String internal slot names');
		}
	}
	const internalSlotsList = safeConcat(extraSlots, ['[[GeneratorContext]]', '[[GeneratorBrand]]', '[[GeneratorState]]']); // step 3
	const generator = OrdinaryObjectCreate(proto, internalSlotsList); // steps 4, 6
	SLOT.set(generator, '[[GeneratorBrand]]', generatorBrand); // step 5

	SLOT.assert(closure, '[[Sentinel]]'); // our userland slot
	SLOT.set(generator, '[[Sentinel]]', SLOT.get(closure, '[[Sentinel]]')); // our userland slot
	SLOT.assert(closure, '[[CloseIfAbrupt]]'); // our second userland slot
	SLOT.set(generator, '[[CloseIfAbrupt]]', SLOT.get(closure, '[[CloseIfAbrupt]]')); // our second userland slot

	GeneratorStart(generator, closure); // step 13

	return generator; // step 15
};
