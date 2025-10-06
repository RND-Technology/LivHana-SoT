"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyDecs2311;
const _checkInRHS = require("./checkInRHS.js");
const _setFunctionName = require("./setFunctionName.js");
const _toPropertyKey = require("./toPropertyKey.js");
function applyDecs2311(targetClass, classDecs, memberDecs, classDecsHaveThis, instanceBrand, parentClass) {
  const symbolMetadata = Symbol.metadata || Symbol["for"]("Symbol.metadata");
  const defineProperty = Object.defineProperty;
  const create = Object.create;
  let metadata;
  const existingNonFields = [create(null), create(null)];
  const hasClassDecs = classDecs.length;
  let _;
  function createRunInitializers(initializers, useStaticThis, hasValue) {
    return function (thisArg, value) {
      if (useStaticThis) {
        value = thisArg;
        thisArg = targetClass;
      }
      for (let i = 0; i < initializers.length; i++) {
        value = initializers[i].apply(thisArg, hasValue ? [value] : []);
      }
      return hasValue ? value : thisArg;
    };
  }
  function assertCallable(fn, hint1, hint2, throwUndefined) {
    if (typeof fn !== "function") {
      if (throwUndefined || fn !== void 0) {
        throw new TypeError(hint1 + " must " + (hint2 || "be") + " a function" + (throwUndefined ? "" : " or undefined"));
      }
    }
    return fn;
  }
  function applyDec(Class, decInfo, decoratorsHaveThis, name, kind, initializers, ret, isStatic, isPrivate, isField, hasPrivateBrand) {
    function assertInstanceIfPrivate(target) {
      if (!hasPrivateBrand(target)) {
        throw new TypeError("Attempted to access private element on non-instance");
      }
    }
    const decs = [].concat(decInfo[0]),
      decVal = decInfo[3],
      isClass = !ret;
    const isAccessor = kind === 1;
    const isGetter = kind === 3;
    const isSetter = kind === 4;
    const isMethod = kind === 2;
    function _bindPropCall(name, useStaticThis, before) {
      return function (_this, value) {
        if (useStaticThis) {
          value = _this;
          _this = Class;
        }
        if (before) {
          before(_this);
        }
        return desc[name].call(_this, value);
      };
    }
    if (!isClass) {
      var desc = {},
        init = [],
        key = isGetter ? "get" : isSetter || isAccessor ? "set" : "value";
      if (isPrivate) {
        if (isField || isAccessor) {
          desc = {
            get: (0, _setFunctionName.default)(function () {
              return decVal(this);
            }, name, "get"),
            set: function (value) {
              decInfo[4](this, value);
            }
          };
        } else {
          desc[key] = decVal;
        }
        if (!isField) {
          (0, _setFunctionName.default)(desc[key], name, isMethod ? "" : key);
        }
      } else if (!isField) {
        desc = Object.getOwnPropertyDescriptor(Class, name);
      }
      if (!isField && !isPrivate) {
        _ = existingNonFields[+isStatic][name];
        if (_ && (_ ^ kind) !== 7) {
          throw new Error("Decorating two elements with the same name (" + desc[key].name + ") is not supported yet");
        }
        existingNonFields[+isStatic][name] = kind < 3 ? 1 : kind;
      }
    }
    let newValue = Class;
    for (let i = decs.length - 1; i >= 0; i -= decoratorsHaveThis ? 2 : 1) {
      const dec = assertCallable(decs[i], "A decorator", "be", true),
        decThis = decoratorsHaveThis ? decs[i - 1] : void 0;
      const decoratorFinishedRef = {};
      const ctx = {
        kind: ["field", "accessor", "method", "getter", "setter", "class"][kind],
        name: name,
        metadata: metadata,
        addInitializer: function (decoratorFinishedRef, initializer) {
          if (decoratorFinishedRef.v) {
            throw new TypeError("attempted to call addInitializer after decoration was finished");
          }
          assertCallable(initializer, "An initializer", "be", true);
          initializers.push(initializer);
        }.bind(null, decoratorFinishedRef)
      };
      if (isClass) {
        _ = dec.call(decThis, newValue, ctx);
        decoratorFinishedRef.v = 1;
        if (assertCallable(_, "class decorators", "return")) {
          newValue = _;
        }
      } else {
        ctx["static"] = isStatic;
        ctx["private"] = isPrivate;
        _ = ctx.access = {
          has: isPrivate ? hasPrivateBrand.bind() : function (target) {
            return name in target;
          }
        };
        if (!isSetter) {
          _.get = isPrivate ? isMethod ? function (_this) {
            assertInstanceIfPrivate(_this);
            return desc.value;
          } : _bindPropCall("get", 0, assertInstanceIfPrivate) : function (target) {
            return target[name];
          };
        }
        if (!isMethod && !isGetter) {
          _.set = isPrivate ? _bindPropCall("set", 0, assertInstanceIfPrivate) : function (target, v) {
            target[name] = v;
          };
        }
        newValue = dec.call(decThis, isAccessor ? {
          get: desc.get,
          set: desc.set
        } : desc[key], ctx);
        decoratorFinishedRef.v = 1;
        if (isAccessor) {
          if (typeof newValue === "object" && newValue) {
            if (_ = assertCallable(newValue.get, "accessor.get")) {
              desc.get = _;
            }
            if (_ = assertCallable(newValue.set, "accessor.set")) {
              desc.set = _;
            }
            if (_ = assertCallable(newValue.init, "accessor.init")) {
              init.unshift(_);
            }
          } else if (newValue !== void 0) {
            throw new TypeError("accessor decorators must return an object with get, set, or init properties or undefined");
          }
        } else if (assertCallable(newValue, (isField ? "field" : "method") + " decorators", "return")) {
          if (isField) {
            init.unshift(newValue);
          } else {
            desc[key] = newValue;
          }
        }
      }
    }
    if (kind < 2) {
      ret.push(createRunInitializers(init, isStatic, 1), createRunInitializers(initializers, isStatic, 0));
    }
    if (!isField && !isClass) {
      if (isPrivate) {
        if (isAccessor) {
          ret.splice(-1, 0, _bindPropCall("get", isStatic), _bindPropCall("set", isStatic));
        } else {
          ret.push(isMethod ? desc[key] : assertCallable.call.bind(desc[key]));
        }
      } else {
        defineProperty(Class, name, desc);
      }
    }
    return newValue;
  }
  function applyMemberDecs() {
    const ret = [];
    let protoInitializers;
    let staticInitializers;
    const pushInitializers = function (initializers) {
      if (initializers) {
        ret.push(createRunInitializers(initializers));
      }
    };
    const applyMemberDecsOfKind = function (isStatic, isField) {
      for (let i = 0; i < memberDecs.length; i++) {
        const decInfo = memberDecs[i];
        const kind = decInfo[1];
        const kindOnly = kind & 7;
        if ((kind & 8) == isStatic && !kindOnly == isField) {
          const name = decInfo[2];
          const isPrivate = !!decInfo[3];
          const decoratorsHaveThis = kind & 16;
          applyDec(isStatic ? targetClass : targetClass.prototype, decInfo, decoratorsHaveThis, isPrivate ? "#" + name : (0, _toPropertyKey.default)(name), kindOnly, kindOnly < 2 ? [] : isStatic ? staticInitializers = staticInitializers || [] : protoInitializers = protoInitializers || [], ret, !!isStatic, isPrivate, isField, isStatic && isPrivate ? function (_) {
            return (0, _checkInRHS.default)(_) === targetClass;
          } : instanceBrand);
        }
      }
    };
    applyMemberDecsOfKind(8, 0);
    applyMemberDecsOfKind(0, 0);
    applyMemberDecsOfKind(8, 1);
    applyMemberDecsOfKind(0, 1);
    pushInitializers(protoInitializers);
    pushInitializers(staticInitializers);
    return ret;
  }
  function defineMetadata(Class) {
    return defineProperty(Class, symbolMetadata, {
      configurable: true,
      enumerable: true,
      value: metadata
    });
  }
  if (parentClass !== undefined) {
    metadata = parentClass[symbolMetadata];
  }
  metadata = create(metadata == null ? null : metadata);
  _ = applyMemberDecs();
  if (!hasClassDecs) defineMetadata(targetClass);
  return {
    e: _,
    get c() {
      const initializers = [];
      return hasClassDecs && [defineMetadata(targetClass = applyDec(targetClass, [classDecs], classDecsHaveThis, targetClass.name, 5, initializers)), createRunInitializers(initializers, 1)];
    }
  };
}

//# sourceMappingURL=applyDecs2311.js.map
