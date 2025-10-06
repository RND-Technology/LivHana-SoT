'use strict';

const inspect = require('../');
const test = require('tape');
const hasToStringTag = require('has-tostringtag/shams')();
const forEach = require('for-each');

test('fakes', { skip: !hasToStringTag }, function (t) {
    forEach([
        'Array',
        'Boolean',
        'Date',
        'Error',
        'Number',
        'RegExp',
        'String'
    ], function (expected) {
        const faker = {};
        faker[Symbol.toStringTag] = expected;

        t.equal(
            inspect(faker),
            '{ [Symbol(Symbol.toStringTag)]: \'' + expected + '\' }',
            'faker masquerading as ' + expected + ' is not shown as one'
        );
    });

    t.end();
});
