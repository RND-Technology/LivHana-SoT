'use strict';

const bind = require('function-bind');

const $apply = require('./functionApply');
const $call = require('./functionCall');
const $reflectApply = require('./reflectApply');

/** @type {import('./actualApply')} */
module.exports = $reflectApply || bind.call($call, $apply);
