'use strict';

const test = require('tape');
const gPO = require('reflect.getprototypeof/polyfill')();
const gOPD = require('gopd');

const hasProto = require('../');
const hasProtoMutator = require('../mutator');

const getter = require('dunder-proto/get');

test('hasProtoMutator', function (t) {
	const result = hasProtoMutator();
	t.equal(typeof result, 'boolean', 'returns a boolean (' + result + ')');

	const obj = { __proto__: null };
	if (result) {
		t.notOk('toString' in obj, 'null object lacks toString');
		t.equal(gPO(obj), null);
		if (gOPD && getter) {
			t.equal(getter(obj), null);
		}
	} else if (hasProto()) {
		t.notOk('toString' in obj, 'null object lacks toString');
		if (gOPD && getter) {
			t.equal(getter(obj), null);
		}
	} else {
		t.ok('toString' in obj, 'without proto, null object has toString');
		t.equal(gPO(obj), Object.prototype);
	}

	t.end();
});
