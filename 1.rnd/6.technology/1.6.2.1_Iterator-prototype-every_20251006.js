'use strict';

const defineProperties = require('define-properties');
const test = require('tape');
const callBind = require('call-bind');
const functionsHaveNames = require('functions-have-names')();
const hasStrictMode = require('has-strict-mode')();
const forEach = require('for-each');
const debug = require('object-inspect');
const v = require('es-value-fixtures');
const hasSymbols = require('has-symbols/shams')();
const hasPropertyDescriptors = require('has-property-descriptors')();
const iterate = require('iterate-iterator');

const index = require('../Iterator.prototype.every');
const impl = require('../Iterator.prototype.every/implementation');

const fnName = 'every';

const isEnumerable = Object.prototype.propertyIsEnumerable;

const testIterator = require('./helpers/testIterator');

module.exports = {
	tests: function (every, name, t) {
		t['throws'](
			function () { return new every(); }, // eslint-disable-line new-cap
			TypeError,
			'`' + name + '` is not a constructor'
		);

		forEach(v.primitives.concat(v.objects), function (nonIterator) {
			t['throws'](
				function () { iterate(every(nonIterator, function () {})); },
				TypeError,
				debug(nonIterator) + ' is not an Object with a callable `next` method'
			);

			const badNext = { next: nonIterator };
			t['throws'](
				function () { iterate(every(badNext, function () {})); },
				TypeError,
				debug(badNext) + ' is not an Object with a callable `next` method'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { every({ next: function () {} }, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function'
			);
		});

		t.test('observable lookups', { skip: !hasPropertyDescriptors }, function (st) {
			const effects = [];

			const obj = {};
			Object.defineProperty(obj, 'next', {
				configurable: true,
				enumerable: true,
				get: function next() {
					effects.push('get next');
					return function () {
						return { done: true, value: undefined };
					};
				}
			});

			st['throws'](
				function () { every(obj, null); },
				TypeError
			);

			st.deepEqual(effects, []);

			st.end();
		});

		t.test('actual iteration', { skip: !hasSymbols }, function (st) {
			const arr = [1, 2, 3];
			const iterator = callBind(arr[Symbol.iterator], arr);

			st['throws'](
				function () { return new every(iterator()); }, // eslint-disable-line new-cap
				TypeError,
				'`' + name + '` iterator is not a constructor'
			);
			st['throws'](
				function () { return new every(iterator(), function () {}); }, // eslint-disable-line new-cap
				TypeError,
				'`' + name + '` iterator is not a constructor'
			);

			testIterator(iterator(), [1, 2, 3], st, 'original');
			st.equal(every(iterator(), function () { return false; }), false, 'every for always-false');
			st.equal(every(iterator(), function () { return true; }), true, 'every for always-true');
			st.equal(every(iterator(), function (x, i) { return x === 2 && i === 1; }), false, 'every returns false for matching value/index');

			st.end();
		});
	},
	index: function () {
		test('Iterator.prototype.' + fnName + ': index', function (t) {
			module.exports.tests(index, 'Iterator.prototype.' + fnName, t);

			t.end();
		});
	},
	implementation: function () {
		test('Iterator.prototype.' + fnName + ': implementation', function (t) {
			module.exports.tests(callBind(impl), 'Iterator.prototype.' + fnName, t);

			t.end();
		});
	},
	shimmed: function () {
		test('Iterator.prototype.' + fnName + ': shimmed', function (t) {
			t.test('Function name', { skip: !functionsHaveNames }, function (st) {
				st.equal(Iterator.prototype[fnName].name, fnName, 'Iterator#' + fnName + ' has name "' + fnName + '"');
				st.end();
			});

			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Iterator.prototype, fnName), 'Iterator#' + fnName + ' is not enumerable');
				et.end();
			});

			t.test('bad string/this value', { skip: !hasStrictMode }, function (st) {
				st['throws'](function () { return Iterator.prototype[fnName].call(undefined, 'a'); }, TypeError, 'undefined is not an object');
				st['throws'](function () { return Iterator.prototype[fnName].call(null, 'a'); }, TypeError, 'null is not an object');
				st.end();
			});

			module.exports.tests(callBind(Iterator.prototype[fnName]), 'Iterator.prototype.' + fnName, t);

			t.end();
		});
	}
};
