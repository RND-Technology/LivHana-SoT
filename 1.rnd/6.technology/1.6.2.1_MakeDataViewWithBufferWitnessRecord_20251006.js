'use strict';

const $TypeError = require('es-errors/type');

const ArrayBufferByteLength = require('./ArrayBufferByteLength');
const IsDetachedBuffer = require('./IsDetachedBuffer');

const dataViewBuffer = require('data-view-buffer');
const isDataView = require('is-data-view');

// https://262.ecma-international.org/15.0/#sec-makedataviewwithbufferwitnessrecord

module.exports = function MakeDataViewWithBufferWitnessRecord(obj, order) {
	if (!isDataView(obj)) {
		throw new $TypeError('MakeDataViewWithBufferWitnessRecord called with non-DataView');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	const buffer = dataViewBuffer(obj); // step 1

	const byteLength = IsDetachedBuffer(buffer) ? 'DETACHED' : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};
