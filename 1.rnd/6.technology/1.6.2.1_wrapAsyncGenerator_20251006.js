"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _wrapAsyncGenerator;
const _OverloadYield = require("./OverloadYield.js");
function _wrapAsyncGenerator(fn) {
  return function () {
    return new AsyncGenerator(fn.apply(this, arguments));
  };
}
function AsyncGenerator(gen) {
  let front, back;
  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      const request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };
      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }
  function resume(key, arg) {
    try {
      const result = gen[key](arg);
      const value = result.value;
      const overloaded = value instanceof _OverloadYield.default;
      Promise.resolve(overloaded ? value.v : value).then(function (arg) {
        if (overloaded) {
          const nextKey = key === "return" ? "return" : "next";
          if (!value.k || arg.done) {
            return resume(nextKey, arg);
          } else {
            arg = gen[nextKey](arg).value;
          }
        }
        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }
  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;
      case "throw":
        front.reject(value);
        break;
      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }
    front = front.next;
    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }
  this._invoke = send;
  if (typeof gen["return"] !== "function") {
    this["return"] = undefined;
  }
}
AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
};
AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};
AsyncGenerator.prototype["throw"] = function (arg) {
  return this._invoke("throw", arg);
};
AsyncGenerator.prototype["return"] = function (arg) {
  return this._invoke("return", arg);
};

//# sourceMappingURL=wrapAsyncGenerator.js.map
