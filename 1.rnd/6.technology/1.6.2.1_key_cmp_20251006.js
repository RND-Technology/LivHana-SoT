const stringify = require('../');

const obj = { c: 8, b: [{z:6,y:5,x:4},7], a: 3 };
const s = stringify(obj, function (a, b) {
    return a.key < b.key ? 1 : -1;
});
console.log(s);
