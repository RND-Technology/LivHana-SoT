'use strict';

const inspect = require('../');
const obj = [1, 2, function f(n) { return n + 5; }, 4];
console.log(inspect(obj));
