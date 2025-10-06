'use strict';

const defineProperties = require('define-properties');
const test = require('tape');
const hasSymbols = require('has-symbols')();
const hasToStringTag = require('has-tostringtag');
const functionsHaveNames = require('functions-have-names')();
const functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

const index = require('../Iterator.prototype');
const impl = require('../Iterator.prototype/implementation');

const isEnumerable = Object.prototype.propertyIsEnumerable;

const $Iterator = require('../Iterator/implementation');

module.exports = {
	tests: function (proto, name, t) {
		t.notEqual(proto, null, 'is not null');
		t.equal(typeof proto, 'object', 'is an object');

		t.test('Symbol.iterator', { skip: !hasSymbols }, function (st) {
			st.equal(typeof proto[Symbol.iterator], 'function', 'has a `Symbol.iterator` method');
			st.equal(
				proto[Symbol.iterator].name,
				'[Symbol.iterator]',
				'has name "[Symbol.iterator]"',
				{ skip: functionsHaveNames && !functionsHaveConfigurableNames }
			);
			st.equal(proto[Symbol.iterator](), proto, 'function returns proto');
			st.equal(proto[Symbol.iterator].call($Iterator), $Iterator, 'function returns receiver');

			st.end();
		});

		t.test(
			'Symbol.toStringTag',
			{ skip: !hasToStringTag || 'temporarily skipped pending https://bugs.chromium.org/p/chromium/issues/detail?id=1477372' },
			function (st) {
				st.equal(proto[Symbol.toStringTag], 'Iterator', 'has a `Symbol.toStringTag` property');

				st.end();
			}
		);
	},
	index: function () {
		test('Iterator.prototype: index', function (t) {
			module.exports.tests(index, 'Iterator.prototype', t);

			t.end();
		});
	},
	implementation: function () {
		test('Iterator.prototype: implementation', function (t) {
			module.exports.tests(impl, 'Iterator.prototype', t);

			t.end();
		});
	},
	shimmed: function () {
		test('Iterator.prototype: shimmed', function (t) {
			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Iterator, 'prototype'), 'Iterator.prototype is not enumerable');
				et.end();
			});

			module.exports.tests(Iterator.prototype, 'Iterator.prototype', t);

			t.end();
		});
	}
};
