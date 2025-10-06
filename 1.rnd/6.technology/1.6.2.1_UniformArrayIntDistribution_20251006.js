"use strict";
exports.__esModule = true;
exports.uniformArrayIntDistribution = void 0;
const UnsafeUniformArrayIntDistribution_1 = require("./UnsafeUniformArrayIntDistribution");
function uniformArrayIntDistribution(from, to, rng) {
    if (rng != null) {
        const nextRng = rng.clone();
        return [(0, UnsafeUniformArrayIntDistribution_1.unsafeUniformArrayIntDistribution)(from, to, nextRng), nextRng];
    }
    return function (rng) {
        const nextRng = rng.clone();
        return [(0, UnsafeUniformArrayIntDistribution_1.unsafeUniformArrayIntDistribution)(from, to, nextRng), nextRng];
    };
}
exports.uniformArrayIntDistribution = uniformArrayIntDistribution;
