"use strict";
exports.__esModule = true;
exports.skipN = exports.unsafeSkipN = exports.generateN = exports.unsafeGenerateN = void 0;
function unsafeGenerateN(rng, num) {
    const out = [];
    for (let idx = 0; idx != num; ++idx) {
        out.push(rng.unsafeNext());
    }
    return out;
}
exports.unsafeGenerateN = unsafeGenerateN;
function generateN(rng, num) {
    const nextRng = rng.clone();
    const out = unsafeGenerateN(nextRng, num);
    return [out, nextRng];
}
exports.generateN = generateN;
function unsafeSkipN(rng, num) {
    for (let idx = 0; idx != num; ++idx) {
        rng.unsafeNext();
    }
}
exports.unsafeSkipN = unsafeSkipN;
function skipN(rng, num) {
    const nextRng = rng.clone();
    unsafeSkipN(nextRng, num);
    return nextRng;
}
exports.skipN = skipN;
