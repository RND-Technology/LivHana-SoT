'use strict';

const GetIntrinsic = require('get-intrinsic');

const $isConcatSpreadable = GetIntrinsic('%Symbol.isConcatSpreadable%', true);

const Get = require('./Get');
const IsArray = require('./IsArray');
const ToBoolean = require('./ToBoolean');

const isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/6.0/#sec-isconcatspreadable

module.exports = function IsConcatSpreadable(O) {
	if (!isObject(O)) {
		return false;
	}
	if ($isConcatSpreadable) {
		const spreadable = Get(O, $isConcatSpreadable);
		if (typeof spreadable !== 'undefined') {
			return ToBoolean(spreadable);
		}
	}
	return IsArray(O);
};
