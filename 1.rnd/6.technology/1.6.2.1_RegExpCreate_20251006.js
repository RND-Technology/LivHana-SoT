'use strict';

const GetIntrinsic = require('get-intrinsic');

const $RegExp = GetIntrinsic('%RegExp%');

// var RegExpAlloc = require('./RegExpAlloc');
// var RegExpInitialize = require('./RegExpInitialize');
const ToString = require('./ToString');

// https://262.ecma-international.org/6.0/#sec-regexpcreate

module.exports = function RegExpCreate(P, F) {
	// var obj = RegExpAlloc($RegExp);
	// return RegExpInitialize(obj, P, F);

	// covers spec mechanics; bypass regex brand checking
	const pattern = typeof P === 'undefined' ? '' : ToString(P);
	const flags = typeof F === 'undefined' ? '' : ToString(F);
	return new $RegExp(pattern, flags);
};
