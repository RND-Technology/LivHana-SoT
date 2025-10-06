'use strict';

const $TypeError = require('es-errors/type');

const UTF16EncodeCodePoint = require('./UTF16EncodeCodePoint');
const IsArray = require('./IsArray');

const forEach = require('../helpers/forEach');
const isCodePoint = require('../helpers/isCodePoint');

// https://262.ecma-international.org/12.0/#sec-codepointstostring

module.exports = function CodePointsToString(text) {
	if (!IsArray(text)) {
		throw new $TypeError('Assertion failed: `text` must be a sequence of Unicode Code Points');
	}
	let result = '';
	forEach(text, function (cp) {
		if (!isCodePoint(cp)) {
			throw new $TypeError('Assertion failed: `text` must be a sequence of Unicode Code Points');
		}
		result += UTF16EncodeCodePoint(cp);
	});
	return result;
};
