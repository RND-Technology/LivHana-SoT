"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _regenerator;
const _regeneratorDefine = require("./regeneratorDefine.js");
function _regenerator() {
  let undefined;
  const $Symbol = typeof Symbol === "function" ? Symbol : {};
  const iteratorSymbol = $Symbol.iterator || "@@iterator";
  const toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  let _;
  function wrap(innerFn, outerFn, self, tryLocsList) {
    const protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    const generator = Object.create(protoGenerator.prototype);
    (0, _regeneratorDefine.default)(generator, "_invoke", makeInvokeMethod(innerFn, self, tryLocsList), true);
    return generator;
  }
  const ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  _ = Object.getPrototypeOf;
  const IteratorPrototype = [][iteratorSymbol] ? _(_([][iteratorSymbol]())) : ((0, _regeneratorDefine.default)(_ = {}, iteratorSymbol, function () {
    return this;
  }), _);
  const Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  (0, _regeneratorDefine.default)(Gp, "constructor", GeneratorFunctionPrototype);
  (0, _regeneratorDefine.default)(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = "GeneratorFunction";
  (0, _regeneratorDefine.default)(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction");
  (0, _regeneratorDefine.default)(Gp);
  (0, _regeneratorDefine.default)(Gp, toStringTagSymbol, "Generator");
  (0, _regeneratorDefine.default)(Gp, iteratorSymbol, function () {
    return this;
  });
  (0, _regeneratorDefine.default)(Gp, "toString", function () {
    return "[object Generator]";
  });
  function mark(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      (0, _regeneratorDefine.default)(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  }
  function makeInvokeMethod(innerFn, self, tryLocsList) {
    let state = 0;
    function invoke(_methodName, _method, _arg) {
      if (state > 1) {
        throw TypeError("Generator is already running");
      } else if (done) {
        if (_method === 1) {
          Context_dispatchExceptionOrFinishOrAbrupt(_method, _arg);
        }
      }
      method = _method;
      arg = _arg;
      while ((_ = method < 2 ? undefined : arg) || !done) {
        if (!delegateIterator) {
          if (!method) {
            ctx.v = arg;
          } else if (method < 3) {
            if (method > 1) ctx.n = -1;
            Context_dispatchExceptionOrFinishOrAbrupt(method, arg);
          } else {
            ctx.n = arg;
          }
        }
        try {
          state = 2;
          if (delegateIterator) {
            if (!method) _methodName = "next";
            if (_ = delegateIterator[_methodName]) {
              if (!(_ = _.call(delegateIterator, arg))) {
                throw TypeError("iterator result is not an object");
              }
              if (!_.done) {
                return _;
              }
              arg = _.value;
              if (method < 2) {
                method = 0;
              }
            } else {
              if (method === 1 && (_ = delegateIterator["return"])) {
                _.call(delegateIterator);
              }
              if (method < 2) {
                arg = TypeError("The iterator does not provide a '" + _methodName + "' method");
                method = 1;
              }
            }
            delegateIterator = undefined;
          } else {
            if (done = ctx.n < 0) {
              _ = arg;
            } else {
              _ = innerFn.call(self, ctx);
            }
            if (_ !== ContinueSentinel) {
              break;
            }
          }
        } catch (e) {
          delegateIterator = undefined;
          method = 1;
          arg = e;
        } finally {
          state = 1;
        }
      }
      return {
        value: _,
        done: done
      };
    }
    const tryEntries = tryLocsList || [];
    var done = false;
    let delegateIterator;
    let method;
    let arg;
    var ctx = {
      p: 0,
      n: 0,
      v: undefined,
      a: Context_dispatchExceptionOrFinishOrAbrupt,
      f: Context_dispatchExceptionOrFinishOrAbrupt.bind(undefined, 4),
      d: function (iterable, nextLoc) {
        delegateIterator = iterable;
        method = 0;
        arg = undefined;
        ctx.n = nextLoc;
        return ContinueSentinel;
      }
    };
    function Context_dispatchExceptionOrFinishOrAbrupt(_type, _arg) {
      method = _type;
      arg = _arg;
      for (_ = 0; !done && state && !shouldReturn && _ < tryEntries.length; _++) {
        const entry = tryEntries[_];
        const prev = ctx.p;
        const finallyLoc = entry[2];
        var shouldReturn;
        if (_type > 3) {
          if (shouldReturn = finallyLoc === _arg) {
            arg = entry[(method = entry[4]) ? 5 : (method = 3, 3)];
            entry[4] = entry[5] = undefined;
          }
        } else {
          if (entry[0] <= prev) {
            if (shouldReturn = _type < 2 && prev < entry[1]) {
              method = 0;
              ctx.v = _arg;
              ctx.n = entry[1];
            } else if (prev < finallyLoc) {
              if (shouldReturn = _type < 3 || entry[0] > _arg || _arg > finallyLoc) {
                entry[4] = _type;
                entry[5] = _arg;
                ctx.n = finallyLoc;
                method = 0;
              }
            }
          }
        }
      }
      if (shouldReturn || _type > 1) {
        return ContinueSentinel;
      }
      done = true;
      throw _arg;
    }
    return invoke;
  }
  return (exports.default = _regenerator = function () {
    return {
      w: wrap,
      m: mark
    };
  })();
}

//# sourceMappingURL=regenerator.js.map
