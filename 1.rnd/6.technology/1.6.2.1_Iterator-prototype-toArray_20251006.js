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
const iterate = require('iterate-iterator');

const index = require('../Iterator.prototype.toArray');
const impl = require('../Iterator.prototype.toArray/implementation');

const fnName = 'toArray';

const isEnumerable = Object.prototype.propertyIsEnumerable;

const testIterator = require('./helpers/testIterator');

module.exports = {
	tests: function (toArray, name, t) {
		t['throws'](
			function () { return new toArray(); }, // eslint-disable-line new-cap
			TypeError,
			'`' + name + '` is not a constructor'
		);

		forEach(v.primitives.concat(v.objects), function (nonIterator) {
			t['throws'](
				function () { iterate(toArray(nonIterator)); },
				TypeError,
				debug(nonIterator) + ' is not an Object with a callable `next` method'
			);

			const badNext = { next: nonIterator };
			t['throws'](
				function () { iterate(toArray(badNext)); },
				TypeError,
				debug(badNext) + ' is not an Object with a callable `next` method'
			);
		});

		t.test('actual iteration', { skip: !hasSymbols }, function (st) {
			const arr = [1, 2, 3];
			const iterator = callBind(arr[Symbol.iterator], arr);

			st['throws'](
				function () { return new toArray(iterator()); }, // eslint-disable-line new-cap
				TypeError,
				'`' + name + '` iterator is not a constructor'
			);

			testIterator(iterator(), [1, 2, 3], st, 'original');

			st.deepEqual(toArray(iterator()), [1, 2, 3], 'toArray');

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
