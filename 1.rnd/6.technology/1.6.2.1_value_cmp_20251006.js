const stringify = require('../');

const obj = { d: 6, c: 5, b: [{z:3,y:2,x:1},9], a: 10 };
const s = stringify(obj, function (a, b) {
    return a.value < b.value ? 1 : -1;
});
console.log(s);
