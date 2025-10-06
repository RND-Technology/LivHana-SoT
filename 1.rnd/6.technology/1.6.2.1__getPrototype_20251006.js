const overArg = require('./_overArg');

/** Built-in value references. */
const getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;
