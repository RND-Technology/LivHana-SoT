'use strict';

const NumberToString = require('./Number/toString');
const StringIndexOf = require('./StringIndexOf');
const StringPad = require('./StringPad');
// var StringToCodePoints = require('./StringToCodePoints');
const UnicodeEscape = require('./UnicodeEscape');
const UTF16EncodeCodePoint = require('./UTF16EncodeCodePoint');

const isLeadingSurrogate = require('../helpers/isLeadingSurrogate');
const isTrailingSurrogate = require('../helpers/isTrailingSurrogate');

const $TypeError = require('es-errors/type');

const isCodePoint = require('../helpers/isCodePoint');
const forEach = require('for-each');
const regexTester = require('safe-regex-test');

const isWhiteSpace = regexTester(/^\s$/);
const isLineTerminator = regexTester(/^[\n\r\u2028\u2029]$/);

// var punctuators = "(){}[]|,.?*+-^$=<>/#&!%:;@~'`\"\\"; // step 1
const syntaxCharacter = '^$\\.*+?()[]{}|';

const otherPunctuators = ",-=<>#&!%:;@~'`\""; // step 3
// var toEscape = StringToCodePoints(otherPunctuators); // step 4

const table64 = {
	'\u0009': 't',
	'\u000a': 'n',
	'\u000b': 'v',
	'\u000c': 'f',
	'\u000d': 'r',
	__proto__: null
};

module.exports = function EncodeForRegExpEscape(c) {
	if (!isCodePoint(c)) {
		throw new $TypeError('Assertion failed: `c` must be a valid Unicode code point');
	}

	const encoded = UTF16EncodeCodePoint(c);

	if (StringIndexOf(syntaxCharacter, encoded, 0) > -1 || encoded === '\u002F') { // step 1
		return '\\' + encoded; // step 1.a
	} else if (encoded in table64) { // step 2
		return '\\' + table64[encoded]; // step 2.a
	}

	if (
		StringIndexOf(otherPunctuators, encoded, 0) > -1
		|| isWhiteSpace(encoded)
		|| isLineTerminator(encoded)
		|| isLeadingSurrogate(c)
		|| isTrailingSurrogate(c)
	) { // step 5
		if (c < 0xFF) { // step 5.a
			const hex = NumberToString(c, 16); // step 5.a.i
			return '\\x' + StringPad(hex, 2, '0', 'START'); // step 5.a.ii
		}

		let escaped = ''; // step 5.b

		const codeUnits = encoded; // step 5.c

		forEach(codeUnits, function (cu) { // step 5.d
			escaped += UnicodeEscape(cu); // step 5.d.i
		});

		return escaped; // step 5.e
	}

	return encoded; // step 6
};
