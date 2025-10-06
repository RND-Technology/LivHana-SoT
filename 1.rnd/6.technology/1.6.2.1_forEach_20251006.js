'use strict';

module.exports = function forEach(array, callback) {
	for (let i = 0; i < array.length; i += 1) {
		callback(array[i], i, array); // eslint-disable-line callback-return
	}
};
