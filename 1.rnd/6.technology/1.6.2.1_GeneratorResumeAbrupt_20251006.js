'use strict';

const $TypeError = require('es-errors/type');

const CompletionRecord = require('es-abstract/2024/CompletionRecord');
const CreateIterResultObject = require('es-abstract/2024/CreateIterResultObject');
const GeneratorValidate = require('./GeneratorValidate');
const NormalCompletion = require('es-abstract/2024/NormalCompletion');

const SLOT = require('internal-slot');

module.exports = function GeneratorResumeAbrupt(generator, abruptCompletion, generatorBrand) {
	if (!(abruptCompletion instanceof CompletionRecord)) {
		throw new $TypeError('Assertion failed: abruptCompletion must be a Completion Record');
	}

	let state = GeneratorValidate(generator, generatorBrand); // step 1

	if (state === 'suspendedStart') { // step 2
		SLOT.set(generator, '[[GeneratorState]]', 'completed'); // step 3.a
		SLOT.set(generator, '[[GeneratorContext]]', null); // step 3.b
		state = 'completed'; // step 3.c
	}

	const value = abruptCompletion.value();

	if (state === 'completed') { // step 3
		return CreateIterResultObject(value, true); // steps 3.a-b
	}

	if (state !== 'suspendedYield') {
		throw new $TypeError('Assertion failed: generator state is unexpected: ' + state); // step 4
	}
	if (abruptCompletion.type() === 'return') {
		// due to representing `GeneratorContext` as a function, we can't safely re-invoke it, so we can't support sending it a return completion
		return CreateIterResultObject(SLOT.get(generator, '[[CloseIfAbrupt]]')(NormalCompletion(abruptCompletion.value())), true);
	}

	const genContext = SLOT.get(generator, '[[GeneratorContext]]'); // step 5

	SLOT.set(generator, '[[GeneratorState]]', 'executing'); // step 8

	const result = genContext(value); // steps 6-7, 8-11

	return result; // step 12
};
