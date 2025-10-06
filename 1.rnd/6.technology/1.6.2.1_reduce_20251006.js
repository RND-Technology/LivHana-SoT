'use strict';

module.exports = function reduce(arr, fn, init) {
	let acc = init;
	for (let i = 0; i < arr.length; i += 1) {
		acc = fn(acc, arr[i], i);
	}
	return acc;
};
