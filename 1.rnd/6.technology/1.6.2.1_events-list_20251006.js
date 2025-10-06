'use strict';

const EventEmitter = require('../');
const assert = require('assert');

const EE = new EventEmitter();
const m = function() {};
EE.on('foo', function() {});
assert.equal(1, EE.eventNames().length);
assert.equal('foo', EE.eventNames()[0]);
EE.on('bar', m);
assert.equal(2, EE.eventNames().length);
assert.equal('foo', EE.eventNames()[0]);
assert.equal('bar', EE.eventNames()[1]);
EE.removeListener('bar', m);
assert.equal(1, EE.eventNames().length);
assert.equal('foo', EE.eventNames()[0]);

if (typeof Symbol !== 'undefined') {
  const s = Symbol('s');
  EE.on(s, m);
  assert.equal(2, EE.eventNames().length);
  assert.equal('foo', EE.eventNames()[0]);
  assert.equal(s, EE.eventNames()[1]);
  EE.removeListener(s, m);
  assert.equal(1, EE.eventNames().length);
  assert.equal('foo', EE.eventNames()[0]);
}
