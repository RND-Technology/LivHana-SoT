"use strict";
exports.__esModule = true;
exports.substractArrayInt64 = exports.fromNumberToArrayInt64 = exports.trimArrayIntInplace = exports.substractArrayIntToNew = exports.addOneToPositiveArrayInt = exports.addArrayIntToNew = void 0;
function addArrayIntToNew(arrayIntA, arrayIntB) {
    if (arrayIntA.sign !== arrayIntB.sign) {
        return substractArrayIntToNew(arrayIntA, { sign: -arrayIntB.sign, data: arrayIntB.data });
    }
    const data = [];
    let reminder = 0;
    const dataA = arrayIntA.data;
    const dataB = arrayIntB.data;
    for (let indexA = dataA.length - 1, indexB = dataB.length - 1; indexA >= 0 || indexB >= 0; --indexA, --indexB) {
        const vA = indexA >= 0 ? dataA[indexA] : 0;
        const vB = indexB >= 0 ? dataB[indexB] : 0;
        const current = vA + vB + reminder;
        data.push(current >>> 0);
        reminder = ~~(current / 0x100000000);
    }
    if (reminder !== 0) {
        data.push(reminder);
    }
    return { sign: arrayIntA.sign, data: data.reverse() };
}
exports.addArrayIntToNew = addArrayIntToNew;
function addOneToPositiveArrayInt(arrayInt) {
    arrayInt.sign = 1;
    const data = arrayInt.data;
    for (let index = data.length - 1; index >= 0; --index) {
        if (data[index] === 0xffffffff) {
            data[index] = 0;
        }
        else {
            data[index] += 1;
            return arrayInt;
        }
    }
    data.unshift(1);
    return arrayInt;
}
exports.addOneToPositiveArrayInt = addOneToPositiveArrayInt;
function isStrictlySmaller(dataA, dataB) {
    const maxLength = Math.max(dataA.length, dataB.length);
    for (let index = 0; index < maxLength; ++index) {
        const indexA = index + dataA.length - maxLength;
        const indexB = index + dataB.length - maxLength;
        const vA = indexA >= 0 ? dataA[indexA] : 0;
        const vB = indexB >= 0 ? dataB[indexB] : 0;
        if (vA < vB)
            return true;
        if (vA > vB)
            return false;
    }
    return false;
}
function substractArrayIntToNew(arrayIntA, arrayIntB) {
    if (arrayIntA.sign !== arrayIntB.sign) {
        return addArrayIntToNew(arrayIntA, { sign: -arrayIntB.sign, data: arrayIntB.data });
    }
    const dataA = arrayIntA.data;
    const dataB = arrayIntB.data;
    if (isStrictlySmaller(dataA, dataB)) {
        const out = substractArrayIntToNew(arrayIntB, arrayIntA);
        out.sign = -out.sign;
        return out;
    }
    const data = [];
    let reminder = 0;
    for (let indexA = dataA.length - 1, indexB = dataB.length - 1; indexA >= 0 || indexB >= 0; --indexA, --indexB) {
        const vA = indexA >= 0 ? dataA[indexA] : 0;
        const vB = indexB >= 0 ? dataB[indexB] : 0;
        const current = vA - vB - reminder;
        data.push(current >>> 0);
        reminder = current < 0 ? 1 : 0;
    }
    return { sign: arrayIntA.sign, data: data.reverse() };
}
exports.substractArrayIntToNew = substractArrayIntToNew;
function trimArrayIntInplace(arrayInt) {
    const data = arrayInt.data;
    let firstNonZero = 0;
    for (; firstNonZero !== data.length && data[firstNonZero] === 0; ++firstNonZero) { }
    if (firstNonZero === data.length) {
        arrayInt.sign = 1;
        arrayInt.data = [0];
        return arrayInt;
    }
    data.splice(0, firstNonZero);
    return arrayInt;
}
exports.trimArrayIntInplace = trimArrayIntInplace;
function fromNumberToArrayInt64(out, n) {
    if (n < 0) {
        const posN = -n;
        out.sign = -1;
        out.data[0] = ~~(posN / 0x100000000);
        out.data[1] = posN >>> 0;
    }
    else {
        out.sign = 1;
        out.data[0] = ~~(n / 0x100000000);
        out.data[1] = n >>> 0;
    }
    return out;
}
exports.fromNumberToArrayInt64 = fromNumberToArrayInt64;
function substractArrayInt64(out, arrayIntA, arrayIntB) {
    const lowA = arrayIntA.data[1];
    const highA = arrayIntA.data[0];
    const signA = arrayIntA.sign;
    const lowB = arrayIntB.data[1];
    const highB = arrayIntB.data[0];
    const signB = arrayIntB.sign;
    out.sign = 1;
    if (signA === 1 && signB === -1) {
        const low_1 = lowA + lowB;
        const high = highA + highB + (low_1 > 0xffffffff ? 1 : 0);
        out.data[0] = high >>> 0;
        out.data[1] = low_1 >>> 0;
        return out;
    }
    let lowFirst = lowA;
    let highFirst = highA;
    let lowSecond = lowB;
    let highSecond = highB;
    if (signA === -1) {
        lowFirst = lowB;
        highFirst = highB;
        lowSecond = lowA;
        highSecond = highA;
    }
    let reminderLow = 0;
    let low = lowFirst - lowSecond;
    if (low < 0) {
        reminderLow = 1;
        low = low >>> 0;
    }
    out.data[0] = highFirst - highSecond - reminderLow;
    out.data[1] = low;
    return out;
}
exports.substractArrayInt64 = substractArrayInt64;
