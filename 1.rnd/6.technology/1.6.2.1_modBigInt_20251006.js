'use strict';

module.exports = function bigIntMod(BigIntRemainder, bigint, modulo) {
	const remain = BigIntRemainder(bigint, modulo);
	return remain >= 0 ? remain : remain + modulo;
};
