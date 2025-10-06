"use strict";
const __read = (this && this.__read) || function (o, n) {
    let m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    let i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
const __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
const MersenneTwister = (function () {
    function MersenneTwister(states, index) {
        this.states = states;
        this.index = index;
    }
    MersenneTwister.twist = function (prev) {
        const mt = prev.slice();
        for (var idx = 0; idx !== MersenneTwister.N - MersenneTwister.M; ++idx) {
            const y_1 = (mt[idx] & MersenneTwister.MASK_UPPER) + (mt[idx + 1] & MersenneTwister.MASK_LOWER);
            mt[idx] = mt[idx + MersenneTwister.M] ^ (y_1 >>> 1) ^ (-(y_1 & 1) & MersenneTwister.A);
        }
        for (var idx = MersenneTwister.N - MersenneTwister.M; idx !== MersenneTwister.N - 1; ++idx) {
            const y_2 = (mt[idx] & MersenneTwister.MASK_UPPER) + (mt[idx + 1] & MersenneTwister.MASK_LOWER);
            mt[idx] = mt[idx + MersenneTwister.M - MersenneTwister.N] ^ (y_2 >>> 1) ^ (-(y_2 & 1) & MersenneTwister.A);
        }
        const y = (mt[MersenneTwister.N - 1] & MersenneTwister.MASK_UPPER) + (mt[0] & MersenneTwister.MASK_LOWER);
        mt[MersenneTwister.N - 1] = mt[MersenneTwister.M - 1] ^ (y >>> 1) ^ (-(y & 1) & MersenneTwister.A);
        return mt;
    };
    MersenneTwister.seeded = function (seed) {
        const out = Array(MersenneTwister.N);
        out[0] = seed;
        for (let idx = 1; idx !== MersenneTwister.N; ++idx) {
            const xored = out[idx - 1] ^ (out[idx - 1] >>> 30);
            out[idx] = (Math.imul(MersenneTwister.F, xored) + idx) | 0;
        }
        return out;
    };
    MersenneTwister.from = function (seed) {
        return new MersenneTwister(MersenneTwister.twist(MersenneTwister.seeded(seed)), 0);
    };
    MersenneTwister.prototype.clone = function () {
        return new MersenneTwister(this.states, this.index);
    };
    MersenneTwister.prototype.next = function () {
        const nextRng = new MersenneTwister(this.states, this.index);
        const out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    MersenneTwister.prototype.unsafeNext = function () {
        let y = this.states[this.index];
        y ^= this.states[this.index] >>> MersenneTwister.U;
        y ^= (y << MersenneTwister.S) & MersenneTwister.B;
        y ^= (y << MersenneTwister.T) & MersenneTwister.C;
        y ^= y >>> MersenneTwister.L;
        if (++this.index >= MersenneTwister.N) {
            this.states = MersenneTwister.twist(this.states);
            this.index = 0;
        }
        return y;
    };
    MersenneTwister.prototype.getState = function () {
        return __spreadArray([this.index], __read(this.states), false);
    };
    MersenneTwister.fromState = function (state) {
        const valid = state.length === MersenneTwister.N + 1 && state[0] >= 0 && state[0] < MersenneTwister.N;
        if (!valid) {
            throw new Error('The state must have been produced by a mersenne RandomGenerator');
        }
        return new MersenneTwister(state.slice(1), state[0]);
    };
    MersenneTwister.N = 624;
    MersenneTwister.M = 397;
    MersenneTwister.R = 31;
    MersenneTwister.A = 0x9908b0df;
    MersenneTwister.F = 1812433253;
    MersenneTwister.U = 11;
    MersenneTwister.S = 7;
    MersenneTwister.B = 0x9d2c5680;
    MersenneTwister.T = 15;
    MersenneTwister.C = 0xefc60000;
    MersenneTwister.L = 18;
    MersenneTwister.MASK_LOWER = Math.pow(2, MersenneTwister.R) - 1;
    MersenneTwister.MASK_UPPER = Math.pow(2, MersenneTwister.R);
    return MersenneTwister;
}());
function fromState(state) {
    return MersenneTwister.fromState(state);
}
exports["default"] = Object.assign(function (seed) {
    return MersenneTwister.from(seed);
}, { fromState: fromState });
