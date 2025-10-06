"use strict";
exports.__esModule = true;
exports.xorshift128plus = void 0;
const XorShift128Plus = (function () {
    function XorShift128Plus(s01, s00, s11, s10) {
        this.s01 = s01;
        this.s00 = s00;
        this.s11 = s11;
        this.s10 = s10;
    }
    XorShift128Plus.prototype.clone = function () {
        return new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
    };
    XorShift128Plus.prototype.next = function () {
        const nextRng = new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
        const out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    XorShift128Plus.prototype.unsafeNext = function () {
        const a0 = this.s00 ^ (this.s00 << 23);
        const a1 = this.s01 ^ ((this.s01 << 23) | (this.s00 >>> 9));
        const b0 = a0 ^ this.s10 ^ ((a0 >>> 18) | (a1 << 14)) ^ ((this.s10 >>> 5) | (this.s11 << 27));
        const b1 = a1 ^ this.s11 ^ (a1 >>> 18) ^ (this.s11 >>> 5);
        const out = (this.s00 + this.s10) | 0;
        this.s01 = this.s11;
        this.s00 = this.s10;
        this.s11 = b1;
        this.s10 = b0;
        return out;
    };
    XorShift128Plus.prototype.jump = function () {
        const nextRng = new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
        nextRng.unsafeJump();
        return nextRng;
    };
    XorShift128Plus.prototype.unsafeJump = function () {
        let ns01 = 0;
        let ns00 = 0;
        let ns11 = 0;
        let ns10 = 0;
        const jump = [0x635d2dff, 0x8a5cd789, 0x5c472f96, 0x121fd215];
        for (let i = 0; i !== 4; ++i) {
            for (let mask = 1; mask; mask <<= 1) {
                if (jump[i] & mask) {
                    ns01 ^= this.s01;
                    ns00 ^= this.s00;
                    ns11 ^= this.s11;
                    ns10 ^= this.s10;
                }
                this.unsafeNext();
            }
        }
        this.s01 = ns01;
        this.s00 = ns00;
        this.s11 = ns11;
        this.s10 = ns10;
    };
    XorShift128Plus.prototype.getState = function () {
        return [this.s01, this.s00, this.s11, this.s10];
    };
    return XorShift128Plus;
}());
function fromState(state) {
    const valid = state.length === 4;
    if (!valid) {
        throw new Error('The state must have been produced by a xorshift128plus RandomGenerator');
    }
    return new XorShift128Plus(state[0], state[1], state[2], state[3]);
}
exports.xorshift128plus = Object.assign(function (seed) {
    return new XorShift128Plus(-1, ~seed, seed | 0, 0);
}, { fromState: fromState });
