'use strict';

const inspect = require('../');
const obj = { a: 1, b: [3, 4] };
obj.c = obj;
console.log(inspect(obj));
