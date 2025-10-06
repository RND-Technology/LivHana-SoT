'use strict';

const $TypeError = require('es-errors/type');

const IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
const IsViewOutOfBounds = require('./IsViewOutOfBounds');
const MakeDataViewWithBufferWitnessRecord = require('./MakeDataViewWithBufferWitnessRecord');
const MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');

const isDataView = require('is-data-view');
const isTypedArray = require('is-typed-array');

// https://262.ecma-international.org/15.0/#sec-isarraybufferviewoutofbounds

module.exports = function IsArrayBufferViewOutOfBounds(O) {
	const isDV = isDataView(O);
	if (!isTypedArray(O) && !isDV) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray or DataView');
	}

	if (isDV) { // step 1
		const viewRecord = MakeDataViewWithBufferWitnessRecord(O, 'SEQ-CST'); // step 1.a

		return IsViewOutOfBounds(viewRecord); // step 1.b
	}

	const taRecord = MakeTypedArrayWithBufferWitnessRecord(O, 'SEQ-CST'); // step 2

	return IsTypedArrayOutOfBounds(taRecord); // step 3
};
