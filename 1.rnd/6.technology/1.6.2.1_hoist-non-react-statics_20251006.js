(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.hoistNonReactStatics = factory());
}(this, (function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	const reactIs_production_min = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports,"__esModule",{value:!0});
	const b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?Symbol.for("react.suspense_list"):
	60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.fundamental"):60117,w=b?Symbol.for("react.responder"):60118,x=b?Symbol.for("react.scope"):60119;function y(a){if("object"===typeof a&&null!==a){const u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function z(a){return y(a)===m}
	exports.typeOf=y;exports.AsyncMode=l;exports.ConcurrentMode=m;exports.ContextConsumer=k;exports.ContextProvider=h;exports.Element=c;exports.ForwardRef=n;exports.Fragment=e;exports.Lazy=t;exports.Memo=r;exports.Portal=d;exports.Profiler=g;exports.StrictMode=f;exports.Suspense=p;
	exports.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===v||a.$$typeof===w||a.$$typeof===x)};exports.isAsyncMode=function(a){return z(a)||y(a)===l};exports.isConcurrentMode=z;exports.isContextConsumer=function(a){return y(a)===k};exports.isContextProvider=function(a){return y(a)===h};
	exports.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};exports.isForwardRef=function(a){return y(a)===n};exports.isFragment=function(a){return y(a)===e};exports.isLazy=function(a){return y(a)===t};exports.isMemo=function(a){return y(a)===r};exports.isPortal=function(a){return y(a)===d};exports.isProfiler=function(a){return y(a)===g};exports.isStrictMode=function(a){return y(a)===f};exports.isSuspense=function(a){return y(a)===p};
	});

	unwrapExports(reactIs_production_min);
	const reactIs_production_min_1 = reactIs_production_min.typeOf;
	const reactIs_production_min_2 = reactIs_production_min.AsyncMode;
	const reactIs_production_min_3 = reactIs_production_min.ConcurrentMode;
	const reactIs_production_min_4 = reactIs_production_min.ContextConsumer;
	const reactIs_production_min_5 = reactIs_production_min.ContextProvider;
	const reactIs_production_min_6 = reactIs_production_min.Element;
	const reactIs_production_min_7 = reactIs_production_min.ForwardRef;
	const reactIs_production_min_8 = reactIs_production_min.Fragment;
	const reactIs_production_min_9 = reactIs_production_min.Lazy;
	const reactIs_production_min_10 = reactIs_production_min.Memo;
	const reactIs_production_min_11 = reactIs_production_min.Portal;
	const reactIs_production_min_12 = reactIs_production_min.Profiler;
	const reactIs_production_min_13 = reactIs_production_min.StrictMode;
	const reactIs_production_min_14 = reactIs_production_min.Suspense;
	const reactIs_production_min_15 = reactIs_production_min.isValidElementType;
	const reactIs_production_min_16 = reactIs_production_min.isAsyncMode;
	const reactIs_production_min_17 = reactIs_production_min.isConcurrentMode;
	const reactIs_production_min_18 = reactIs_production_min.isContextConsumer;
	const reactIs_production_min_19 = reactIs_production_min.isContextProvider;
	const reactIs_production_min_20 = reactIs_production_min.isElement;
	const reactIs_production_min_21 = reactIs_production_min.isForwardRef;
	const reactIs_production_min_22 = reactIs_production_min.isFragment;
	const reactIs_production_min_23 = reactIs_production_min.isLazy;
	const reactIs_production_min_24 = reactIs_production_min.isMemo;
	const reactIs_production_min_25 = reactIs_production_min.isPortal;
	const reactIs_production_min_26 = reactIs_production_min.isProfiler;
	const reactIs_production_min_27 = reactIs_production_min.isStrictMode;
	const reactIs_production_min_28 = reactIs_production_min.isSuspense;

	const reactIs_development = createCommonjsModule(function (module, exports) {



	if (process.env.NODE_ENV !== "production") {
	  (function() {

	Object.defineProperty(exports, '__esModule', { value: true });

	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	const hasSymbol = typeof Symbol === 'function' && Symbol.for;
	const REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
	const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
	const REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
	const REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
	const REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
	const REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
	const REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
	// (unstable) APIs that have been removed. Can we remove the symbols?

	const REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
	const REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
	const REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
	const REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
	const REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
	const REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
	const REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
	const REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
	const REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
	const REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

	function isValidElementType(type) {
	  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
	  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE);
	}

	/**
	 * Forked from fbjs/warning:
	 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
	 *
	 * Only change is we use console.warn instead of console.error,
	 * and do nothing when 'console' is not supported.
	 * This really simplifies the code.
	 * ---
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */
	let lowPriorityWarningWithoutStack = function () {};

	{
	  const printWarning = function (format) {
	    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      args[_key - 1] = arguments[_key];
	    }

	    let argIndex = 0;
	    const message = 'Warning: ' + format.replace(/%s/g, function () {
	      return args[argIndex++];
	    });

	    if (typeof console !== 'undefined') {
	      console.warn(message);
	    }

	    try {
	      // --- Welcome to debugging React ---
	      // This error was thrown as a convenience so that you can use this stack
	      // to find the callsite that caused this warning to fire.
	      throw new Error(message);
	    } catch (x) {}
	  };

	  lowPriorityWarningWithoutStack = function (condition, format) {
	    if (format === undefined) {
	      throw new Error('`lowPriorityWarningWithoutStack(condition, format, ...args)` requires a warning ' + 'message argument');
	    }

	    if (!condition) {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	        args[_key2 - 2] = arguments[_key2];
	      }

	      printWarning.apply(void 0, [format].concat(args));
	    }
	  };
	}

	const lowPriorityWarningWithoutStack$1 = lowPriorityWarningWithoutStack;

	function typeOf(object) {
	  if (typeof object === 'object' && object !== null) {
	    const $$typeof = object.$$typeof;

	    switch ($$typeof) {
	      case REACT_ELEMENT_TYPE:
	        var type = object.type;

	        switch (type) {
	          case REACT_ASYNC_MODE_TYPE:
	          case REACT_CONCURRENT_MODE_TYPE:
	          case REACT_FRAGMENT_TYPE:
	          case REACT_PROFILER_TYPE:
	          case REACT_STRICT_MODE_TYPE:
	          case REACT_SUSPENSE_TYPE:
	            return type;

	          default:
	            var $$typeofType = type && type.$$typeof;

	            switch ($$typeofType) {
	              case REACT_CONTEXT_TYPE:
	              case REACT_FORWARD_REF_TYPE:
	              case REACT_LAZY_TYPE:
	              case REACT_MEMO_TYPE:
	              case REACT_PROVIDER_TYPE:
	                return $$typeofType;

	              default:
	                return $$typeof;
	            }

	        }

	      case REACT_PORTAL_TYPE:
	        return $$typeof;
	    }
	  }

	  return undefined;
	} // AsyncMode is deprecated along with isAsyncMode

	const AsyncMode = REACT_ASYNC_MODE_TYPE;
	const ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
	const ContextConsumer = REACT_CONTEXT_TYPE;
	const ContextProvider = REACT_PROVIDER_TYPE;
	const Element = REACT_ELEMENT_TYPE;
	const ForwardRef = REACT_FORWARD_REF_TYPE;
	const Fragment = REACT_FRAGMENT_TYPE;
	const Lazy = REACT_LAZY_TYPE;
	const Memo = REACT_MEMO_TYPE;
	const Portal = REACT_PORTAL_TYPE;
	const Profiler = REACT_PROFILER_TYPE;
	const StrictMode = REACT_STRICT_MODE_TYPE;
	const Suspense = REACT_SUSPENSE_TYPE;
	let hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

	function isAsyncMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
	      hasWarnedAboutDeprecatedIsAsyncMode = true;
	      lowPriorityWarningWithoutStack$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
	    }
	  }

	  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
	}
	function isConcurrentMode(object) {
	  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
	}
	function isContextConsumer(object) {
	  return typeOf(object) === REACT_CONTEXT_TYPE;
	}
	function isContextProvider(object) {
	  return typeOf(object) === REACT_PROVIDER_TYPE;
	}
	function isElement(object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function isForwardRef(object) {
	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
	}
	function isFragment(object) {
	  return typeOf(object) === REACT_FRAGMENT_TYPE;
	}
	function isLazy(object) {
	  return typeOf(object) === REACT_LAZY_TYPE;
	}
	function isMemo(object) {
	  return typeOf(object) === REACT_MEMO_TYPE;
	}
	function isPortal(object) {
	  return typeOf(object) === REACT_PORTAL_TYPE;
	}
	function isProfiler(object) {
	  return typeOf(object) === REACT_PROFILER_TYPE;
	}
	function isStrictMode(object) {
	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
	}
	function isSuspense(object) {
	  return typeOf(object) === REACT_SUSPENSE_TYPE;
	}

	exports.typeOf = typeOf;
	exports.AsyncMode = AsyncMode;
	exports.ConcurrentMode = ConcurrentMode;
	exports.ContextConsumer = ContextConsumer;
	exports.ContextProvider = ContextProvider;
	exports.Element = Element;
	exports.ForwardRef = ForwardRef;
	exports.Fragment = Fragment;
	exports.Lazy = Lazy;
	exports.Memo = Memo;
	exports.Portal = Portal;
	exports.Profiler = Profiler;
	exports.StrictMode = StrictMode;
	exports.Suspense = Suspense;
	exports.isValidElementType = isValidElementType;
	exports.isAsyncMode = isAsyncMode;
	exports.isConcurrentMode = isConcurrentMode;
	exports.isContextConsumer = isContextConsumer;
	exports.isContextProvider = isContextProvider;
	exports.isElement = isElement;
	exports.isForwardRef = isForwardRef;
	exports.isFragment = isFragment;
	exports.isLazy = isLazy;
	exports.isMemo = isMemo;
	exports.isPortal = isPortal;
	exports.isProfiler = isProfiler;
	exports.isStrictMode = isStrictMode;
	exports.isSuspense = isSuspense;
	  })();
	}
	});

	unwrapExports(reactIs_development);
	const reactIs_development_1 = reactIs_development.typeOf;
	const reactIs_development_2 = reactIs_development.AsyncMode;
	const reactIs_development_3 = reactIs_development.ConcurrentMode;
	const reactIs_development_4 = reactIs_development.ContextConsumer;
	const reactIs_development_5 = reactIs_development.ContextProvider;
	const reactIs_development_6 = reactIs_development.Element;
	const reactIs_development_7 = reactIs_development.ForwardRef;
	const reactIs_development_8 = reactIs_development.Fragment;
	const reactIs_development_9 = reactIs_development.Lazy;
	const reactIs_development_10 = reactIs_development.Memo;
	const reactIs_development_11 = reactIs_development.Portal;
	const reactIs_development_12 = reactIs_development.Profiler;
	const reactIs_development_13 = reactIs_development.StrictMode;
	const reactIs_development_14 = reactIs_development.Suspense;
	const reactIs_development_15 = reactIs_development.isValidElementType;
	const reactIs_development_16 = reactIs_development.isAsyncMode;
	const reactIs_development_17 = reactIs_development.isConcurrentMode;
	const reactIs_development_18 = reactIs_development.isContextConsumer;
	const reactIs_development_19 = reactIs_development.isContextProvider;
	const reactIs_development_20 = reactIs_development.isElement;
	const reactIs_development_21 = reactIs_development.isForwardRef;
	const reactIs_development_22 = reactIs_development.isFragment;
	const reactIs_development_23 = reactIs_development.isLazy;
	const reactIs_development_24 = reactIs_development.isMemo;
	const reactIs_development_25 = reactIs_development.isPortal;
	const reactIs_development_26 = reactIs_development.isProfiler;
	const reactIs_development_27 = reactIs_development.isStrictMode;
	const reactIs_development_28 = reactIs_development.isSuspense;

	const reactIs = createCommonjsModule(function (module) {

	if (process.env.NODE_ENV === 'production') {
	  module.exports = reactIs_production_min;
	} else {
	  module.exports = reactIs_development;
	}
	});
	const reactIs_1 = reactIs.typeOf;
	const reactIs_2 = reactIs.AsyncMode;
	const reactIs_3 = reactIs.ConcurrentMode;
	const reactIs_4 = reactIs.ContextConsumer;
	const reactIs_5 = reactIs.ContextProvider;
	const reactIs_6 = reactIs.Element;
	const reactIs_7 = reactIs.ForwardRef;
	const reactIs_8 = reactIs.Fragment;
	const reactIs_9 = reactIs.Lazy;
	const reactIs_10 = reactIs.Memo;
	const reactIs_11 = reactIs.Portal;
	const reactIs_12 = reactIs.Profiler;
	const reactIs_13 = reactIs.StrictMode;
	const reactIs_14 = reactIs.Suspense;
	const reactIs_15 = reactIs.isValidElementType;
	const reactIs_16 = reactIs.isAsyncMode;
	const reactIs_17 = reactIs.isConcurrentMode;
	const reactIs_18 = reactIs.isContextConsumer;
	const reactIs_19 = reactIs.isContextProvider;
	const reactIs_20 = reactIs.isElement;
	const reactIs_21 = reactIs.isForwardRef;
	const reactIs_22 = reactIs.isFragment;
	const reactIs_23 = reactIs.isLazy;
	const reactIs_24 = reactIs.isMemo;
	const reactIs_25 = reactIs.isPortal;
	const reactIs_26 = reactIs.isProfiler;
	const reactIs_27 = reactIs.isStrictMode;
	const reactIs_28 = reactIs.isSuspense;

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	const REACT_STATICS = {
	  childContextTypes: true,
	  contextType: true,
	  contextTypes: true,
	  defaultProps: true,
	  displayName: true,
	  getDefaultProps: true,
	  getDerivedStateFromError: true,
	  getDerivedStateFromProps: true,
	  mixins: true,
	  propTypes: true,
	  type: true
	};
	const KNOWN_STATICS = {
	  name: true,
	  length: true,
	  prototype: true,
	  caller: true,
	  callee: true,
	  arguments: true,
	  arity: true
	};
	const FORWARD_REF_STATICS = {
	  '$$typeof': true,
	  render: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true
	};
	const MEMO_STATICS = {
	  '$$typeof': true,
	  compare: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true,
	  type: true
	};
	const TYPE_STATICS = {};
	TYPE_STATICS[reactIs_7] = FORWARD_REF_STATICS;
	TYPE_STATICS[reactIs_10] = MEMO_STATICS;

	function getStatics(component) {
	  // React v16.11 and below
	  if (reactIs_24(component)) {
	    return MEMO_STATICS;
	  } // React v16.12 and above


	  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
	}

	const defineProperty = Object.defineProperty;
	const getOwnPropertyNames = Object.getOwnPropertyNames;
	const getOwnPropertySymbols = Object.getOwnPropertySymbols;
	const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	const getPrototypeOf = Object.getPrototypeOf;
	const objectPrototype = Object.prototype;
	function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
	  if (typeof sourceComponent !== 'string') {
	    // don't hoist over string (html) components
	    if (objectPrototype) {
	      const inheritedComponent = getPrototypeOf(sourceComponent);

	      if (inheritedComponent && inheritedComponent !== objectPrototype) {
	        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
	      }
	    }

	    let keys = getOwnPropertyNames(sourceComponent);

	    if (getOwnPropertySymbols) {
	      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
	    }

	    const targetStatics = getStatics(targetComponent);
	    const sourceStatics = getStatics(sourceComponent);

	    for (let i = 0; i < keys.length; ++i) {
	      const key = keys[i];

	      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
	        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);

	        try {
	          // Avoid failures from read-only properties
	          defineProperty(targetComponent, key, descriptor);
	        } catch (e) {}
	      }
	    }
	  }

	  return targetComponent;
	}

	return hoistNonReactStatics;

})));
