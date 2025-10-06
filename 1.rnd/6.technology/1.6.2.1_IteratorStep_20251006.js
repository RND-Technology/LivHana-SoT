'use strict';

const IteratorComplete = require('./IteratorComplete');
const IteratorNext = require('./IteratorNext');

// https://262.ecma-international.org/6.0/#sec-iteratorstep

module.exports = function IteratorStep(iterator) {
	const result = IteratorNext(iterator);
	const done = IteratorComplete(result);
	return done === true ? false : result;
};

