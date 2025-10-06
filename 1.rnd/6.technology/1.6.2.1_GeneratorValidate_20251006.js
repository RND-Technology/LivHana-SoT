'use strict';

const $TypeError = require('es-errors/type');

const SLOT = require('internal-slot');

module.exports = function GeneratorValidate(generator, generatorBrand) {
	SLOT.assert(generator, '[[GeneratorState]]'); // step 1
	SLOT.assert(generator, '[[GeneratorBrand]]'); // step 2

	const brand = SLOT.get(generator, '[[GeneratorBrand]]');
	if (brand !== generatorBrand) {
		throw new $TypeError('Assertion failed: generator brand is unexpected: ' + brand);
	}
	SLOT.assert(generator, '[[GeneratorContext]]'); // step 4
	const state = SLOT.get(generator, '[[GeneratorState]]'); // step 5
	if (state === 'executing') {
		throw new $TypeError('generator is executing');
	}

	return state; // step 7
};
