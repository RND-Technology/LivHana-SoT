'use strict';

const hasSymbols = require('has-symbols')();
const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bound');
const isString = require('is-string');

const $iterator = GetIntrinsic('%Symbol.iterator%', true);
const $stringSlice = callBound('String.prototype.slice');
const $String = GetIntrinsic('%String%');

const IsArray = require('./IsArray');

module.exports = function getIteratorMethod(ES, iterable) {
	let usingIterator;
	if (hasSymbols) {
		usingIterator = ES.GetMethod(iterable, $iterator);
	} else if (IsArray(iterable)) {
		usingIterator = function () {
			let i = -1;
			const arr = this; // eslint-disable-line no-invalid-this
			return {
				next: function () {
					i += 1;
					return {
						done: i >= arr.length,
						value: arr[i]
					};
				}
			};
		};
	} else if (isString(iterable)) {
		usingIterator = function () {
			let i = 0;
			return {
				next: function () {
					const nextIndex = ES.AdvanceStringIndex($String(iterable), i, true);
					const value = $stringSlice(iterable, i, nextIndex);
					i = nextIndex;
					const done = nextIndex > iterable.length;
					return {
						done: done,
						value: done ? void undefined : value
					};
				}
			};
		};
	}
	return usingIterator;
};
