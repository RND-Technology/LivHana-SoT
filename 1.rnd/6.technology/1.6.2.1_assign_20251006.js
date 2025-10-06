'use strict';

const GetIntrinsic = require('get-intrinsic');

const hasOwn = require('hasown');

const $assign = GetIntrinsic('%Object.assign%', true);

module.exports = function assign(target, source) {
	if ($assign) {
		return $assign(target, source);
	}

	// eslint-disable-next-line no-restricted-syntax
	for (const key in source) {
		if (hasOwn(source, key)) {
			// eslint-disable-next-line no-param-reassign
			target[key] = source[key];
		}
	}
	return target;
};
