'use strict';

const $TypeError = require('es-errors/type');

const CreateIterResultObject = require('es-abstract/2024/CreateIterResultObject');
const GeneratorValidate = require('./GeneratorValidate');

const SLOT = require('internal-slot');

module.exports = function GeneratorResume(generator, value, generatorBrand) {
	const state = GeneratorValidate(generator, generatorBrand); // step 1
	if (state === 'completed') {
		return CreateIterResultObject(void undefined, true); // step 2
	}

	if (state !== 'suspendedStart' && state !== 'suspendedYield') {
		throw new $TypeError('Assertion failed: generator state is unexpected: ' + state); // step 3
	}

	const genContext = SLOT.get(generator, '[[GeneratorContext]]');

	SLOT.set(generator, '[[GeneratorState]]', 'executing'); // step 7

	const result = genContext(value); // steps 5-6, 8-10

	return result;
};
