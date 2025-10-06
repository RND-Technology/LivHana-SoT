const __defProp = Object.defineProperty;
const __defProps = Object.defineProperties;
const __getOwnPropDescs = Object.getOwnPropertyDescriptors;
const __getOwnPropSymbols = Object.getOwnPropertySymbols;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __propIsEnum = Object.prototype.propertyIsEnumerable;
const __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
const __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
const __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/react/index.ts
export * from "@reduxjs/toolkit";

// src/dynamicMiddleware/react/index.ts
import { createDynamicMiddleware as cDM } from "@reduxjs/toolkit";
import { createDispatchHook, ReactReduxContext, useDispatch as useDefaultDispatch } from "react-redux";
const createDynamicMiddleware = () => {
  const instance = cDM();
  const createDispatchWithMiddlewareHookFactory = (context = ReactReduxContext) => {
    const useDispatch = context === ReactReduxContext ? useDefaultDispatch : createDispatchHook(context);
    function createDispatchWithMiddlewareHook2(...middlewares) {
      instance.addMiddleware(...middlewares);
      return useDispatch;
    }
    createDispatchWithMiddlewareHook2.withTypes = () => createDispatchWithMiddlewareHook2;
    return createDispatchWithMiddlewareHook2;
  };
  const createDispatchWithMiddlewareHook = createDispatchWithMiddlewareHookFactory();
  return __spreadProps(__spreadValues({}, instance), {
    createDispatchWithMiddlewareHookFactory,
    createDispatchWithMiddlewareHook
  });
};
export {
  createDynamicMiddleware
};
//# sourceMappingURL=redux-toolkit-react.legacy-esm.js.map