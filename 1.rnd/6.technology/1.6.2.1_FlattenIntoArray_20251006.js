'use strict';

const $TypeError = require('es-errors/type');

const MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

const Call = require('./Call');
const CreateDataPropertyOrThrow = require('./CreateDataPropertyOrThrow');
const Get = require('./Get');
const HasProperty = require('./HasProperty');
const IsArray = require('./IsArray');
const LengthOfArrayLike = require('./LengthOfArrayLike');
const ToString = require('./ToString');

// https://262.ecma-international.org/11.0/#sec-flattenintoarray

module.exports = function FlattenIntoArray(target, source, sourceLen, start, depth) {
	let mapperFunction;
	if (arguments.length > 5) {
		mapperFunction = arguments[5];
	}

	let targetIndex = start;
	let sourceIndex = 0;
	while (sourceIndex < sourceLen) {
		const P = ToString(sourceIndex);
		const exists = HasProperty(source, P);
		if (exists === true) {
			let element = Get(source, P);
			if (typeof mapperFunction !== 'undefined') {
				if (arguments.length <= 6) {
					throw new $TypeError('Assertion failed: thisArg is required when mapperFunction is provided');
				}
				element = Call(mapperFunction, arguments[6], [element, sourceIndex, source]);
			}
			let shouldFlatten = false;
			if (depth > 0) {
				shouldFlatten = IsArray(element);
			}
			if (shouldFlatten) {
				const elementLen = LengthOfArrayLike(element);
				targetIndex = FlattenIntoArray(target, element, elementLen, targetIndex, depth - 1);
			} else {
				if (targetIndex >= MAX_SAFE_INTEGER) {
					throw new $TypeError('index too large');
				}
				CreateDataPropertyOrThrow(target, ToString(targetIndex), element);
				targetIndex += 1;
			}
		}
		sourceIndex += 1;
	}

	return targetIndex;
};
