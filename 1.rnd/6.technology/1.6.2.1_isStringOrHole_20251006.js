'use strict';

// TODO: semver-major: remove

const canDistinguishSparseFromUndefined = 0 in [undefined]; // IE 6 - 8 have a bug where this returns false

module.exports = function isStringOrHole(item, index, arr) {
	return typeof item === 'string' || (canDistinguishSparseFromUndefined ? !(index in arr) : typeof item === 'undefined');
};
