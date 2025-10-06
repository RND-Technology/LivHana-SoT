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

const index = require('../Iterator.prototype.filter');
const impl = require('../Iterator.prototype.filter/implementation');

const fnName = 'filter';

const isEnumerable = Object.prototype.propertyIsEnumerable;

const testIterator = require('./helpers/testIterator');

module.exports = {
	tests: function (filter, name, t) {
		t['throws'](
			function () { return new filter(); }, // eslint-disable-line new-cap
			TypeError,
			'`' + name + '` is not a constructor'
		);

		forEach(v.primitives.concat(v.objects), function (nonIterator) {
			t['throws'](
				function () { iterate(filter(nonIterator, function () {})); },
				TypeError,
				debug(nonIterator) + ' is not an Object with a callable `next` method'
			);

			const badNext = { next: nonIterator };
			t['throws'](
				function () { iterate(filter(badNext, function () {})); },
				TypeError,
				debug(badNext) + ' is not an Object with a callable `next` method'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { filter({ next: function () {} }, nonFunction); },
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
				function () { filter(obj, null); },
				TypeError
			);

			st.deepEqual(effects, []);

			st.end();
		});

		t.test('actual iteration', { skip: !hasSymbols }, function (st) {
			const arr = [1, 2, 3];
			const iterator = callBind(arr[Symbol.iterator], arr);

			st['throws'](
				function () { return new filter(iterator()); }, // eslint-disable-line new-cap
				TypeError,
				'`' + name + '` iterator is not a constructor'
			);
			st['throws'](
				function () { return new filter(iterator(), function () {}); }, // eslint-disable-line new-cap
				TypeError,
				'`' + name + '` iterator is not a constructor'
			);

			testIterator(iterator(), [1, 2, 3], st, 'original');
			testIterator(filter(iterator(), function () { return false; }), [], st, 'filter for always-false');
			testIterator(filter(iterator(), function () { return true; }), [1, 2, 3], st, 'filter for always-true');
			testIterator(filter(iterator(), function (x, i) { return x === 2 && i === 1; }), [2], st, 'filter returns value for matching value/index');

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/filter/predicate-args', function (st) {
			const g = function g() {
				const arr = ['a', 'b', 'c'];
				let i = 0;
				return {
					next: function () {
						try {
							return {
								value: arr[i],
								done: i >= arr.length
							};
						} finally {
							i += 1;
						}
					}
				};
			};
			let assertionCount = 0;
			const iter = filter(
				g(),
				function (value, count) {
					if (value === 'a') {
						st.equal(count, 0, 'first iteration');
					} else if (value === 'b') {
						st.equal(count, 1, 'second iteration');
					} else if (value === 'c') {
						st.equal(count, 2, 'third iteration');
					} else {
						st.fail('unexpected iteration');
					}
					assertionCount += 1;
					return true;
				}
			);

			st.equal(assertionCount, 0, 'prior to iteration');

			testIterator(iter, ['a', 'b', 'c'], st, 'iteration');

			st.equal(assertionCount, 3);

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/filter/predicate-throws', function (st) {
			let returnCalls = 0;

			const iter = {
				next: function () {
					return {
						done: false,
						value: 1
					};
				},
				'return': function () {
					returnCalls += 1;
					return {};
				}
			};

			let callbackCalls = 0;
			const iterator = filter(iter, function () {
				callbackCalls += 1;
				throw new SyntaxError();
			});

			st['throws'](function () { iterator.next(); }, SyntaxError, 'next() throws');

			st.equal(callbackCalls, 1);
			st.equal(returnCalls, 1);

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/filter/predicate-throws-then-closing-iterator-also-throws', function (st) {
			const iter = {
				next: function next() {
					return {
						done: false,
						value: 1
					};
				},
				'return': function () {
					throw new EvalError();
				}
			};

			const iterator = filter(iter, function () {
				throw new SyntaxError();
			});

			st['throws'](
				function () { iterator.next(); },
				SyntaxError,
				'when the predicate and return() both throw, the predicate’s exception wins'
			);

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/filter/get-return-method-throws', { skip: !hasPropertyDescriptors }, function (st) {
			const badIterator = {
				next: function next() {
					return {
						done: false,
						value: 1
					};
				}
			};

			Object.defineProperty(badIterator, 'return', { get: function () { throw new SyntaxError(); } });

			const iter = filter(badIterator, function () { return true; });
			iter.next();

			st['throws'](
				function () { iter['return'](); },
				SyntaxError,
				'gets the `return` method, whose getter throws'
			);

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/drop/return-is-forwarded', function (st) {
			let returnCount = 0;

			const badIterator = {
				next: function next() {
					return {
						done: false,
						value: 1
					};
				},
				'return': function () {
					returnCount += 1;
					return {};
				}
			};

			const iter1 = filter(badIterator, function () { return false; });
			st.equal(returnCount, 0, 'iter1, before return()');
			iter1['return']();
			st.equal(returnCount, 1, 'iter1, after return()');

			st.end();
		});

		t.test('262: test/built-ins/Iterator/prototype/drop/return-is-not-forwarded-after-exhaustion', { skip: !hasPropertyDescriptors }, function (st) {
			const makeBadIterator = function makeBadIterator() {
				return {
					next: function next() {
						return {
							done: true,
							value: undefined
						};
					},
					'return': function () {
						throw new SyntaxError();
					}
				};
			};

			const iter1 = filter(makeBadIterator(), function () { return true; });
			st['throws'](
				function () { iter1['return'](); },
				SyntaxError,
				'iter1, return() throws'
			);
			iter1.next();
			iter1['return']();

			// 3 filters (i wish i had pipeline)
			const iter2 = filter(
				filter(
					filter(
						makeBadIterator(),
						function () { return true; }
					),
					function () { return true; }
				),
				function () { return true; }
			);
			st['throws'](
				function () { iter2['return'](); },
				SyntaxError,
				'iter2, return() throws'
			);
			iter2.next();
			iter2['return']();

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
