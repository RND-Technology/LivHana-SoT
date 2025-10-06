'use strict';

// var Construct = require('es-abstract/2024/Construct');
const CreateRegExpStringIterator = require('es-abstract/2024/CreateRegExpStringIterator');
const Get = require('es-abstract/2024/Get');
const Set = require('es-abstract/2024/Set');
const SpeciesConstructor = require('es-abstract/2024/SpeciesConstructor');
const ToLength = require('es-abstract/2024/ToLength');
const ToString = require('es-abstract/2024/ToString');
const Type = require('es-abstract/2024/Type');
const flagsGetter = require('regexp.prototype.flags');
const setFunctionName = require('set-function-name');
const callBound = require('call-bound');
const GetIntrinsic = require('get-intrinsic');
const $TypeError = require('es-errors/type');

const $indexOf = callBound('String.prototype.indexOf');

const OrigRegExp = GetIntrinsic('%RegExp%');

const supportsConstructingWithFlags = 'flags' in OrigRegExp.prototype;

const constructRegexWithFlags = function constructRegex(C, R) {
	let matcher;
	// workaround for older engines that lack RegExp.prototype.flags
	const flags = 'flags' in R ? Get(R, 'flags') : ToString(flagsGetter(R));
	if (supportsConstructingWithFlags && typeof flags === 'string') {
		matcher = new C(R, flags);
	} else if (C === OrigRegExp) {
		// workaround for older engines that can not construct a RegExp with flags
		matcher = new C(R.source, flags);
	} else {
		matcher = new C(R, flags);
	}
	return { flags: flags, matcher: matcher };
};

const regexMatchAll = setFunctionName(function SymbolMatchAll(string) {
	const R = this;
	if (Type(R) !== 'Object') {
		throw new $TypeError('"this" value must be an Object');
	}
	const S = ToString(string);
	const C = SpeciesConstructor(R, OrigRegExp);

	const tmp = constructRegexWithFlags(C, R);
	// var flags = ToString(Get(R, 'flags'));
	const flags = tmp.flags;
	// var matcher = Construct(C, [R, flags]);
	const matcher = tmp.matcher;

	const lastIndex = ToLength(Get(R, 'lastIndex'));
	Set(matcher, 'lastIndex', lastIndex, true);
	const global = $indexOf(flags, 'g') > -1;
	const fullUnicode = $indexOf(flags, 'u') > -1;
	return CreateRegExpStringIterator(matcher, S, global, fullUnicode);
}, '[Symbol.matchAll]', true);

module.exports = regexMatchAll;
