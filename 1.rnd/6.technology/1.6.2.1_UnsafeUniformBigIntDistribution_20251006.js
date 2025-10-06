"use strict";
exports.__esModule = true;
exports.unsafeUniformBigIntDistribution = void 0;
const SBigInt = typeof BigInt !== 'undefined' ? BigInt : undefined;
function unsafeUniformBigIntDistribution(from, to, rng) {
    const diff = to - from + SBigInt(1);
    const MinRng = SBigInt(-0x80000000);
    const NumValues = SBigInt(0x100000000);
    let FinalNumValues = NumValues;
    let NumIterations = 1;
    while (FinalNumValues < diff) {
        FinalNumValues *= NumValues;
        ++NumIterations;
    }
    const MaxAcceptedRandom = FinalNumValues - (FinalNumValues % diff);
    while (true) {
        let value = SBigInt(0);
        for (let num = 0; num !== NumIterations; ++num) {
            const out = rng.unsafeNext();
            value = NumValues * value + (SBigInt(out) - MinRng);
        }
        if (value < MaxAcceptedRandom) {
            const inDiff = value % diff;
            return inDiff + from;
        }
    }
}
exports.unsafeUniformBigIntDistribution = unsafeUniformBigIntDistribution;
