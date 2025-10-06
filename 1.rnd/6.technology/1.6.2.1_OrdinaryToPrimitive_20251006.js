'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const Call = require('./Call');
const Get = require('./Get');
const IsCallable = require('./IsCallable');

const inspect = require('object-inspect');

// https://262.ecma-international.org/8.0/#sec-ordinarytoprimitive

module.exports = function OrdinaryToPrimitive(O, hint) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (/* typeof hint !== 'string' || */ hint !== 'string' && hint !== 'number') {
		throw new $TypeError('Assertion failed: `hint` must be "string" or "number"');
	}

	const methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];

	for (let i = 0; i < methodNames.length; i += 1) {
		const name = methodNames[i];
		const method = Get(O, name);
		if (IsCallable(method)) {
			const result = Call(method, O);
			if (!isObject(result)) {
				return result;
			}
		}
	}

	throw new $TypeError('No primitive value for ' + inspect(O));
};
