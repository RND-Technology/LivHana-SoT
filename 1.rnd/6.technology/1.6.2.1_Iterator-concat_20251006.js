'use strict';

const defineProperties = require('define-properties');
const test = require('tape');
const callBind = require('call-bind');
const functionsHaveNames = require('functions-have-names')();
const forEach = require('for-each');
const debug = require('object-inspect');
const v = require('es-value-fixtures');
const hasSymbols = require('has-symbols/shams')();
const mockProperty = require('mock-property');
const hasPropertyDescriptors = require('has-property-descriptors')();

const index = require('../Iterator.concat');
const impl = require('../Iterator.concat/implementation');
const from = require('../Iterator.from/polyfill')();

const isEnumerable = Object.prototype.propertyIsEnumerable;

const testIterator = require('./helpers/testIterator');

module.exports = {
	tests: function (concat, name, t) {
		t['throws'](
			function () { return new concat(); }, // eslint-disable-line new-cap
			TypeError,
			'`' + name + '` itself is not a constructor'
		);
		t['throws'](
			function () { return new concat({}); }, // eslint-disable-line new-cap
			TypeError,
			'`' + name + '` itself is not a constructor, with an argument'
		);

		forEach(v.primitives.concat(v.objects), function (nonIterator) {
			t['throws'](
				function () { concat(nonIterator); },
				TypeError,
				debug(nonIterator) + ' is not an iterable Object'
			);
		});

		t.deepEqual(concat().next(), { value: undefined, done: true }, 'no arguments -> empty iterator');

		t.test('actual iteration', { skip: !hasSymbols }, function (st) {
			forEach(v.nonFunctions, function (nonFunction) {
				const badIterable = {};
				badIterable[Symbol.iterator] = nonFunction;
				st['throws'](
					function () { concat([], badIterable, []); },
					TypeError,
					debug(badIterable) + '[Symbol.iterator] is not a function'
				);
			});

			forEach(v.primitives, function (nonObject) {
				const badIterable = {};
				badIterable[Symbol.iterator] = function () { return nonObject; };
				st['throws'](
					function () { concat([], badIterable, []).next(); },
					TypeError,
					debug(badIterable) + '[Symbol.iterator] does not return an object'
				);
			});

			forEach(v.strings, function (string) {
				st['throws'](
					function () { concat(string); },
					TypeError,
					'non-objects are not considered iterable'
				);
				const stringIt = concat(['a'], [string], ['c']);
				testIterator(stringIt, ['a', string, 'c'], st, 'string iterator: ' + debug(string));
			});

			const arrayIt = concat([1, 2, 3]);
			st.equal(typeof arrayIt.next, 'function', 'has a `next` function');

			st.test('real iterators', { skip: !hasSymbols }, function (s2t) {
				const iter = [1, 2][Symbol.iterator]();
				testIterator(concat(iter, [3]), [1, 2, 3], s2t, 'array iterator + array yields combined results');

				s2t.end();
			});

			st.test('observability in a replaced String iterator', function (s2t) {
				const originalStringIterator = String.prototype[Symbol.iterator];
				let observedType;
				s2t.teardown(mockProperty(String.prototype, Symbol.iterator, {
					get: function () {
						'use strict'; // eslint-disable-line strict, lines-around-directive

						observedType = typeof this;
						return originalStringIterator;
					}
				}));

				concat(from(''));
				s2t.equal(observedType, 'string', 'string primitive -> primitive receiver in Symbol.iterator getter');
				concat(from(Object('')));
				s2t.equal(observedType, 'object', 'boxed string -> boxed string in Symbol.iterator getter');

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/arguments-checked-in-order', { skip: !hasPropertyDescriptors }, function (s2t) {
				let getIterator = 0;

				const iterable1 = {};
				Object.defineProperty(iterable1, Symbol.iterator, {
					get: function () {
						getIterator += 1;
						return function () {
							throw new EvalError();
						};
					}
				});

				const iterable2 = {};
				Object.defineProperty(iterable2, Symbol.iterator, {
					get: function () {
						throw new EvalError();
					}
				});

				s2t.equal(getIterator, 0);

				s2t['throws'](function () { concat(iterable1, null, iterable2); }, TypeError);

				s2t.equal(getIterator, 1);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/fresh-iterator-result', function (s2t) {
				const oldIterResult = {
					done: false,
					value: 123
				};

				const testIterator1 = {
					next: function () {
						return oldIterResult;
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				const iterator = concat(iterable);

				const iterResult = iterator.next();

				s2t.equal(iterResult.done, false);
				s2t.equal(iterResult.value, 123);

				s2t.notEqual(iterResult, oldIterResult);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/get-iterator-method-only-once', { skip: !hasPropertyDescriptors }, function (s2t) {
				let iteratorGets = 0;
				let iteratorCalls = 0;
				const array = [1, 2, 3];

				function CountingIterable() {}
				Object.defineProperty(
					CountingIterable.prototype,
					Symbol.iterator,
					{
						get: function () {
							iteratorGets += 1;

							return function () {
								iteratorCalls += 1;
								return array[Symbol.iterator]();
							};
						}
					}
				);

				const iterable = new CountingIterable();

				s2t.equal(iteratorGets, 0);
				s2t.equal(iteratorCalls, 0);

				const iter = concat(iterable);

				s2t.equal(iteratorGets, 1);
				s2t.equal(iteratorCalls, 0);

				testIterator(iter, array, s2t, 'iterating over the iterator calls the iterator function once');

				s2t.equal(iteratorGets, 1);
				s2t.equal(iteratorCalls, 1);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/get-iterator-method-throws', { skip: !hasPropertyDescriptors }, function (s2t) {
				const iterable = {};
				Object.defineProperty(iterable, Symbol.iterator, {
					get: function () {
						throw new EvalError();
					}
				});

				s2t['throws'](function () { concat(iterable); }, EvalError);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/inner-iterator-created-in-order', function (s2t) {
				const calledIterator = [];

				const iterable1 = {};
				iterable1[Symbol.iterator] = function () {
					calledIterator.push('iterable1');
					return [1][Symbol.iterator]();
				};

				const iterable2 = {};
				iterable2[Symbol.iterator] = function () {
					calledIterator.push('iterable2');
					return [2][Symbol.iterator]();
				};

				const iterator = concat(iterable1, iterable2);

				s2t.deepEqual(calledIterator, []);

				s2t.deepEqual(iterator.next(), { done: false, value: 1 });

				s2t.deepEqual(calledIterator, ['iterable1']);

				s2t.deepEqual(iterator.next(), { done: false, value: 2 });

				s2t.deepEqual(calledIterator, ['iterable1', 'iterable2']);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-called-with-zero-arguments', function (s2t) {
				let nextCalled = 0;

				const testIterator1 = {
					next: function () {
						nextCalled += 1;
						s2t.equal(arguments.length, 0);

						return {
							done: false,
							value: 0
						};
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				const iterator = concat(iterable);
				s2t.equal(nextCalled, 0);

				iterator.next();
				s2t.equal(nextCalled, 1);

				iterator.next(1);
				s2t.equal(nextCalled, 2);

				iterator.next(1, 2);
				s2t.equal(nextCalled, 3);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-returns-non-object', function (s2t) {
				const nonObjectIterator = {
					next: function () {
						return null;
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return nonObjectIterator;
				};

				const iterator = concat(iterable);

				s2t['throws'](function () { iterator.next(); }, TypeError);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-returns-throwing-done', { skip: !hasPropertyDescriptors }, function (s2t) {
				const throwingIterator = {
					next: function () {
						const result = { done: null, value: 1 };
						Object.defineProperty(result, 'done', {
							get: function () {
								throw new EvalError();
							}
						});
						return result;
					},
					'return': function () {
						throw new Error();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return throwingIterator;
				};

				const iterator = concat(iterable);

				s2t['throws'](function () { iterator.next(); }, EvalError);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-returns-throwing-value-done', { skip: !hasPropertyDescriptors }, function (s2t) {
				function ReturnCalledError() {}
				function ValueGetterError() {}

				const throwingIterator = {
					next: function () {
						const result = { value: null, done: true };
						Object.defineProperty(result, 'value', {
							get: function () {
								throw new ValueGetterError();
							}
						});
						return result;
					},
					'return': function () {
						throw new ReturnCalledError();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return throwingIterator;
				};

				const iterator = concat(iterable);

				const iterResult = iterator.next();

				s2t.equal(iterResult.done, true);
				s2t.equal(iterResult.value, undefined);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-returns-throwing-value', { skip: !hasPropertyDescriptors }, function (s2t) {
				const throwingIterator = {
					next: function () {
						const result = { value: null, done: false };
						Object.defineProperty(result, 'value', {
							get: function () {
								throw new EvalError();
							}
						});
						return result;
					},
					'return': function () {
						throw new Error();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return throwingIterator;
				};

				const iterator = concat(iterable);

				s2t['throws'](function () { iterator.next(); }, EvalError);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/next-method-throws', function (s2t) {
				const throwingIterator = {
					next: function () {
						throw new EvalError();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return throwingIterator;
				};

				const iterator = concat(iterable);

				s2t['throws'](function () { iterator.next(); }, EvalError);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/return-is-not-forwarded-after-exhaustion', function (s2t) {
				const testIterator1 = {
					next: function () {
						return {
							done: true,
							value: undefined
						};
					},
					'return': function () {
						throw new EvalError();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				const iterator = concat(iterable);
				iterator.next();
				iterator['return']();

				s2t.end();
			});

			t.test('test262: test/built-ins/Iterator/concat/return-is-not-forwarded-before-initial-start', function (s2t) {
				const testIterator1 = {
					next: function () {
						return {
							done: false,
							value: 1
						};
					},
					'return': function () {
						throw new EvalError();
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				const iterator = concat(iterable);
				iterator['return']();
				iterator.next();
				iterator['return']();

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/return-method-called-with-zero-arguments', function (s2t) {
				let returnCalled = 0;

				const testIterator1 = {
					next: function () {
						return { done: false };
					},
					'return': function () {
						returnCalled += 1;
						s2t.equal(arguments.length, 0);
						return { done: true };
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				let iterator;

				// Call with zero arguments.
				iterator = concat(iterable);
				iterator.next();
				s2t.equal(returnCalled, 0);

				iterator['return']();
				s2t.equal(returnCalled, 1);

				// Call with one argument.
				iterator = concat(iterable);
				iterator.next();
				s2t.equal(returnCalled, 1);

				iterator['return'](1);
				s2t.equal(returnCalled, 2);

				// Call with two arguments.
				iterator = concat(iterable);
				iterator.next();
				s2t.equal(returnCalled, 2);

				iterator['return'](1, 2);
				s2t.equal(returnCalled, 3);

				s2t.end();
			});

			st.test('test262: test/built-ins/Iterator/concat/throws-typeerror-when-generator-is-running-next', function (s2t) {
				let enterCount = 0;

				let iterator;

				const testIterator1 = {
					next: function () {
						enterCount += 1;
						iterator.next();
						return { done: false };
					}
				};

				const iterable = {};
				iterable[Symbol.iterator] = function () {
					return testIterator1;
				};

				iterator = concat(iterable);

				s2t.equal(enterCount, 0);

				s2t['throws'](function () { iterator.next(); }, TypeError);

				s2t.equal(enterCount, 1);

				s2t.end();
			});

			st.end();
		});
	},
	index: function () {
		test('Iterator.concat: index', function (t) {
			module.exports.tests(index, 'Iterator.concat', t);

			t.end();
		});
	},
	implementation: function () {
		test('Iterator.concat: implementation', function (t) {
			module.exports.tests(impl, 'Iterator.concat', t);

			t.end();
		});
	},
	shimmed: function () {
		test('Iterator.concat: shimmed', function (t) {
			t.test('Function name', { skip: !functionsHaveNames }, function (st) {
				st.equal(Iterator.concat.name, 'concat', 'Iterator.concat has name "concat"');
				st.end();
			});

			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Iterator, 'concat'), 'Iterator.concat is not enumerable');
				et.end();
			});

			t.equal(Iterator.concat.length, 0, 'Iterator.concat has length 0');

			module.exports.tests(callBind(Iterator.concat, Iterator), 'Iterator.concat', t);

			t.end();
		});
	}
};
