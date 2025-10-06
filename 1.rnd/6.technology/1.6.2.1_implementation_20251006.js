'use strict';

/* eslint no-invalid-this: 1 */

const ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
const toStr = Object.prototype.toString;
const max = Math.max;
const funcType = '[object Function]';

const concatty = function concatty(a, b) {
    const arr = [];

    for (let i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (let j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

const slicy = function slicy(arrLike, offset) {
    const arr = [];
    for (let i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

const joiny = function (arr, joiner) {
    let str = '';
    for (let i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    const target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    const args = slicy(arguments, 1);

    let bound;
    const binder = function () {
        if (this instanceof bound) {
            const result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    const boundLength = max(0, target.length - args.length);
    const boundArgs = [];
    for (let i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        const Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};
