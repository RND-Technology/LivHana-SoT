'use strict';

const GetIntrinsic = require('get-intrinsic');
const hasSymbols = require('has-symbols')();

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const IteratorPrototype = GetIntrinsic('%IteratorPrototype%', true);

const AdvanceStringIndex = require('./AdvanceStringIndex');
const CreateIterResultObject = require('./CreateIterResultObject');
const CreateMethodProperty = require('./CreateMethodProperty');
const Get = require('./Get');
const OrdinaryObjectCreate = require('./OrdinaryObjectCreate');
const RegExpExec = require('./RegExpExec');
const Set = require('./Set');
const ToLength = require('./ToLength');
const ToString = require('./ToString');

const SLOT = require('internal-slot');
const setToStringTag = require('es-set-tostringtag');

const RegExpStringIterator = function RegExpStringIterator(R, S, global, fullUnicode) {
	if (typeof S !== 'string') {
		throw new $TypeError('`S` must be a string');
	}
	if (typeof global !== 'boolean') {
		throw new $TypeError('`global` must be a boolean');
	}
	if (typeof fullUnicode !== 'boolean') {
		throw new $TypeError('`fullUnicode` must be a boolean');
	}
	SLOT.set(this, '[[IteratingRegExp]]', R);
	SLOT.set(this, '[[IteratedString]]', S);
	SLOT.set(this, '[[Global]]', global);
	SLOT.set(this, '[[Unicode]]', fullUnicode);
	SLOT.set(this, '[[Done]]', false);
};

if (IteratorPrototype) {
	RegExpStringIterator.prototype = OrdinaryObjectCreate(IteratorPrototype);
}

const RegExpStringIteratorNext = function next() {
	const O = this; // eslint-disable-line no-invalid-this
	if (!isObject(O)) {
		throw new $TypeError('receiver must be an object');
	}
	if (
		!(O instanceof RegExpStringIterator)
		|| !SLOT.has(O, '[[IteratingRegExp]]')
		|| !SLOT.has(O, '[[IteratedString]]')
		|| !SLOT.has(O, '[[Global]]')
		|| !SLOT.has(O, '[[Unicode]]')
		|| !SLOT.has(O, '[[Done]]')
	) {
		throw new $TypeError('"this" value must be a RegExpStringIterator instance');
	}
	if (SLOT.get(O, '[[Done]]')) {
		return CreateIterResultObject(undefined, true);
	}
	const R = SLOT.get(O, '[[IteratingRegExp]]');
	const S = SLOT.get(O, '[[IteratedString]]');
	const global = SLOT.get(O, '[[Global]]');
	const fullUnicode = SLOT.get(O, '[[Unicode]]');
	const match = RegExpExec(R, S);
	if (match === null) {
		SLOT.set(O, '[[Done]]', true);
		return CreateIterResultObject(undefined, true);
	}
	if (global) {
		const matchStr = ToString(Get(match, '0'));
		if (matchStr === '') {
			const thisIndex = ToLength(Get(R, 'lastIndex'));
			const nextIndex = AdvanceStringIndex(S, thisIndex, fullUnicode);
			Set(R, 'lastIndex', nextIndex, true);
		}
		return CreateIterResultObject(match, false);
	}
	SLOT.set(O, '[[Done]]', true);
	return CreateIterResultObject(match, false);
};
CreateMethodProperty(RegExpStringIterator.prototype, 'next', RegExpStringIteratorNext);

if (hasSymbols) {
	setToStringTag(RegExpStringIterator.prototype, 'RegExp String Iterator');

	if (Symbol.iterator && typeof RegExpStringIterator.prototype[Symbol.iterator] !== 'function') {
		const iteratorFn = function SymbolIterator() {
			return this;
		};
		CreateMethodProperty(RegExpStringIterator.prototype, Symbol.iterator, iteratorFn);
	}
}

// https://262.ecma-international.org/11.0/#sec-createregexpstringiterator
module.exports = function CreateRegExpStringIterator(R, S, global, fullUnicode) {
	// assert R.global === global && R.unicode === fullUnicode?
	return new RegExpStringIterator(R, S, global, fullUnicode);
};
