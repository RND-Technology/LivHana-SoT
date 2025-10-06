"use strict";
exports.__esModule = true;
exports.unsafeUniformIntDistribution = void 0;
const UnsafeUniformIntDistributionInternal_1 = require("./internals/UnsafeUniformIntDistributionInternal");
const ArrayInt_1 = require("./internals/ArrayInt");
const UnsafeUniformArrayIntDistributionInternal_1 = require("./internals/UnsafeUniformArrayIntDistributionInternal");
const safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
const sharedA = { sign: 1, data: [0, 0] };
const sharedB = { sign: 1, data: [0, 0] };
const sharedC = { sign: 1, data: [0, 0] };
const sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
    const rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger
        ? (0, ArrayInt_1.fromNumberToArrayInt64)(sharedC, rangeSize)
        : (0, ArrayInt_1.substractArrayInt64)(sharedC, (0, ArrayInt_1.fromNumberToArrayInt64)(sharedA, to), (0, ArrayInt_1.fromNumberToArrayInt64)(sharedB, from));
    if (rangeSizeArrayIntValue.data[1] === 0xffffffff) {
        rangeSizeArrayIntValue.data[0] += 1;
        rangeSizeArrayIntValue.data[1] = 0;
    }
    else {
        rangeSizeArrayIntValue.data[1] += 1;
    }
    (0, UnsafeUniformArrayIntDistributionInternal_1.unsafeUniformArrayIntDistributionInternal)(sharedData, rangeSizeArrayIntValue.data, rng);
    return sharedData[0] * 0x100000000 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
    const rangeSize = to - from;
    if (rangeSize <= 0xffffffff) {
        const g = (0, UnsafeUniformIntDistributionInternal_1.unsafeUniformIntDistributionInternal)(rangeSize + 1, rng);
        return g + from;
    }
    return uniformLargeIntInternal(from, to, rangeSize, rng);
}
exports.unsafeUniformIntDistribution = unsafeUniformIntDistribution;
