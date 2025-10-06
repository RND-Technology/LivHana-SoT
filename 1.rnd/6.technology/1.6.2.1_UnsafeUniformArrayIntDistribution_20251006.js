"use strict";
exports.__esModule = true;
exports.unsafeUniformArrayIntDistribution = void 0;
const ArrayInt_1 = require("./internals/ArrayInt");
const UnsafeUniformArrayIntDistributionInternal_1 = require("./internals/UnsafeUniformArrayIntDistributionInternal");
function unsafeUniformArrayIntDistribution(from, to, rng) {
    const rangeSize = (0, ArrayInt_1.trimArrayIntInplace)((0, ArrayInt_1.addOneToPositiveArrayInt)((0, ArrayInt_1.substractArrayIntToNew)(to, from)));
    const emptyArrayIntData = rangeSize.data.slice(0);
    const g = (0, UnsafeUniformArrayIntDistributionInternal_1.unsafeUniformArrayIntDistributionInternal)(emptyArrayIntData, rangeSize.data, rng);
    return (0, ArrayInt_1.trimArrayIntInplace)((0, ArrayInt_1.addArrayIntToNew)({ sign: 1, data: g }, from));
}
exports.unsafeUniformArrayIntDistribution = unsafeUniformArrayIntDistribution;
