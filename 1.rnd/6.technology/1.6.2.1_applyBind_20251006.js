'use strict';

const bind = require('function-bind');
const $apply = require('./functionApply');
const actualApply = require('./actualApply');

/** @type {import('./applyBind')} */
module.exports = function applyBind() {
	return actualApply(bind, $apply, arguments);
};
