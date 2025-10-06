"use strict";
exports.__esModule = true;
exports.uniformBigIntDistribution = void 0;
const UnsafeUniformBigIntDistribution_1 = require("./UnsafeUniformBigIntDistribution");
function uniformBigIntDistribution(from, to, rng) {
    if (rng != null) {
        const nextRng = rng.clone();
        return [(0, UnsafeUniformBigIntDistribution_1.unsafeUniformBigIntDistribution)(from, to, nextRng), nextRng];
    }
    return function (rng) {
        const nextRng = rng.clone();
        return [(0, UnsafeUniformBigIntDistribution_1.unsafeUniformBigIntDistribution)(from, to, nextRng), nextRng];
    };
}
exports.uniformBigIntDistribution = uniformBigIntDistribution;
