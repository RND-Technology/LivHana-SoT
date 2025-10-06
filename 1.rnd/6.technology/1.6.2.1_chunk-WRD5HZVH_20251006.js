import {
  require_react
} from "./chunk-OU5AQDZK.js";
import {
  __commonJS
} from "./chunk-EWTE5DHJ.js";

// node_modules/scheduler/cjs/scheduler.development.js
const require_scheduler_development = __commonJS({
  "node_modules/scheduler/cjs/scheduler.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        const enableSchedulerDebugging = false;
        const enableProfiling = false;
        const frameYieldMs = 5;
        function push(heap, node) {
          const index = heap.length;
          heap.push(node);
          siftUp(heap, node, index);
        }
        function peek(heap) {
          return heap.length === 0 ? null : heap[0];
        }
        function pop(heap) {
          if (heap.length === 0) {
            return null;
          }
          const first = heap[0];
          const last = heap.pop();
          if (last !== first) {
            heap[0] = last;
            siftDown(heap, last, 0);
          }
          return first;
        }
        function siftUp(heap, node, i) {
          let index = i;
          while (index > 0) {
            const parentIndex = index - 1 >>> 1;
            const parent = heap[parentIndex];
            if (compare(parent, node) > 0) {
              heap[parentIndex] = node;
              heap[index] = parent;
              index = parentIndex;
            } else {
              return;
            }
          }
        }
        function siftDown(heap, node, i) {
          let index = i;
          const length = heap.length;
          const halfLength = length >>> 1;
          while (index < halfLength) {
            const leftIndex = (index + 1) * 2 - 1;
            const left = heap[leftIndex];
            const rightIndex = leftIndex + 1;
            const right = heap[rightIndex];
            if (compare(left, node) < 0) {
              if (rightIndex < length && compare(right, left) < 0) {
                heap[index] = right;
                heap[rightIndex] = node;
                index = rightIndex;
              } else {
                heap[index] = left;
                heap[leftIndex] = node;
                index = leftIndex;
              }
            } else if (rightIndex < length && compare(right, node) < 0) {
              heap[index] = right;
              heap[rightIndex] = node;
              index = rightIndex;
            } else {
              return;
            }
          }
        }
        function compare(a, b) {
          const diff = a.sortIndex - b.sortIndex;
          return diff !== 0 ? diff : a.id - b.id;
        }
        const ImmediatePriority = 1;
        const UserBlockingPriority = 2;
        const NormalPriority = 3;
        const LowPriority = 4;
        const IdlePriority = 5;
        function markTaskErrored(task, ms) {
        }
        const hasPerformanceNow = typeof performance === "object" && typeof performance.now === "function";
        if (hasPerformanceNow) {
          const localPerformance = performance;
          exports.unstable_now = function() {
            return localPerformance.now();
          };
        } else {
          const localDate = Date;
          const initialTime = localDate.now();
          exports.unstable_now = function() {
            return localDate.now() - initialTime;
          };
        }
        const maxSigned31BitInt = 1073741823;
        const IMMEDIATE_PRIORITY_TIMEOUT = -1;
        const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
        const NORMAL_PRIORITY_TIMEOUT = 5e3;
        const LOW_PRIORITY_TIMEOUT = 1e4;
        const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
        const taskQueue = [];
        const timerQueue = [];
        let taskIdCounter = 1;
        let currentTask = null;
        let currentPriorityLevel = NormalPriority;
        let isPerformingWork = false;
        let isHostCallbackScheduled = false;
        let isHostTimeoutScheduled = false;
        const localSetTimeout = typeof setTimeout === "function" ? setTimeout : null;
        const localClearTimeout = typeof clearTimeout === "function" ? clearTimeout : null;
        const localSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : null;
        const isInputPending = typeof navigator !== "undefined" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 ? navigator.scheduling.isInputPending.bind(navigator.scheduling) : null;
        function advanceTimers(currentTime) {
          let timer = peek(timerQueue);
          while (timer !== null) {
            if (timer.callback === null) {
              pop(timerQueue);
            } else if (timer.startTime <= currentTime) {
              pop(timerQueue);
              timer.sortIndex = timer.expirationTime;
              push(taskQueue, timer);
            } else {
              return;
            }
            timer = peek(timerQueue);
          }
        }
        function handleTimeout(currentTime) {
          isHostTimeoutScheduled = false;
          advanceTimers(currentTime);
          if (!isHostCallbackScheduled) {
            if (peek(taskQueue) !== null) {
              isHostCallbackScheduled = true;
              requestHostCallback(flushWork);
            } else {
              const firstTimer = peek(timerQueue);
              if (firstTimer !== null) {
                requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
              }
            }
          }
        }
        function flushWork(hasTimeRemaining, initialTime2) {
          isHostCallbackScheduled = false;
          if (isHostTimeoutScheduled) {
            isHostTimeoutScheduled = false;
            cancelHostTimeout();
          }
          isPerformingWork = true;
          const previousPriorityLevel = currentPriorityLevel;
          try {
            if (enableProfiling) {
              try {
                return workLoop(hasTimeRemaining, initialTime2);
              } catch (error) {
                if (currentTask !== null) {
                  const currentTime = exports.unstable_now();
                  markTaskErrored(currentTask, currentTime);
                  currentTask.isQueued = false;
                }
                throw error;
              }
            } else {
              return workLoop(hasTimeRemaining, initialTime2);
            }
          } finally {
            currentTask = null;
            currentPriorityLevel = previousPriorityLevel;
            isPerformingWork = false;
          }
        }
        function workLoop(hasTimeRemaining, initialTime2) {
          let currentTime = initialTime2;
          advanceTimers(currentTime);
          currentTask = peek(taskQueue);
          while (currentTask !== null && !enableSchedulerDebugging) {
            if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
              break;
            }
            const callback = currentTask.callback;
            if (typeof callback === "function") {
              currentTask.callback = null;
              currentPriorityLevel = currentTask.priorityLevel;
              const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
              const continuationCallback = callback(didUserCallbackTimeout);
              currentTime = exports.unstable_now();
              if (typeof continuationCallback === "function") {
                currentTask.callback = continuationCallback;
              } else {
                if (currentTask === peek(taskQueue)) {
                  pop(taskQueue);
                }
              }
              advanceTimers(currentTime);
            } else {
              pop(taskQueue);
            }
            currentTask = peek(taskQueue);
          }
          if (currentTask !== null) {
            return true;
          } else {
            const firstTimer = peek(timerQueue);
            if (firstTimer !== null) {
              requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
            }
            return false;
          }
        }
        function unstable_runWithPriority(priorityLevel, eventHandler) {
          switch (priorityLevel) {
            case ImmediatePriority:
            case UserBlockingPriority:
            case NormalPriority:
            case LowPriority:
            case IdlePriority:
              break;
            default:
              priorityLevel = NormalPriority;
          }
          const previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = priorityLevel;
          try {
            return eventHandler();
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        }
        function unstable_next(eventHandler) {
          let priorityLevel;
          switch (currentPriorityLevel) {
            case ImmediatePriority:
            case UserBlockingPriority:
            case NormalPriority:
              priorityLevel = NormalPriority;
              break;
            default:
              priorityLevel = currentPriorityLevel;
              break;
          }
          const previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = priorityLevel;
          try {
            return eventHandler();
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        }
        function unstable_wrapCallback(callback) {
          const parentPriorityLevel = currentPriorityLevel;
          return function() {
            const previousPriorityLevel = currentPriorityLevel;
            currentPriorityLevel = parentPriorityLevel;
            try {
              return callback.apply(this, arguments);
            } finally {
              currentPriorityLevel = previousPriorityLevel;
            }
          };
        }
        function unstable_scheduleCallback(priorityLevel, callback, options) {
          const currentTime = exports.unstable_now();
          let startTime2;
          if (typeof options === "object" && options !== null) {
            const delay = options.delay;
            if (typeof delay === "number" && delay > 0) {
              startTime2 = currentTime + delay;
            } else {
              startTime2 = currentTime;
            }
          } else {
            startTime2 = currentTime;
          }
          let timeout;
          switch (priorityLevel) {
            case ImmediatePriority:
              timeout = IMMEDIATE_PRIORITY_TIMEOUT;
              break;
            case UserBlockingPriority:
              timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
              break;
            case IdlePriority:
              timeout = IDLE_PRIORITY_TIMEOUT;
              break;
            case LowPriority:
              timeout = LOW_PRIORITY_TIMEOUT;
              break;
            case NormalPriority:
            default:
              timeout = NORMAL_PRIORITY_TIMEOUT;
              break;
          }
          const expirationTime = startTime2 + timeout;
          const newTask = {
            id: taskIdCounter++,
            callback,
            priorityLevel,
            startTime: startTime2,
            expirationTime,
            sortIndex: -1
          };
          if (startTime2 > currentTime) {
            newTask.sortIndex = startTime2;
            push(timerQueue, newTask);
            if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
              if (isHostTimeoutScheduled) {
                cancelHostTimeout();
              } else {
                isHostTimeoutScheduled = true;
              }
              requestHostTimeout(handleTimeout, startTime2 - currentTime);
            }
          } else {
            newTask.sortIndex = expirationTime;
            push(taskQueue, newTask);
            if (!isHostCallbackScheduled && !isPerformingWork) {
              isHostCallbackScheduled = true;
              requestHostCallback(flushWork);
            }
          }
          return newTask;
        }
        function unstable_pauseExecution() {
        }
        function unstable_continueExecution() {
          if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
          }
        }
        function unstable_getFirstCallbackNode() {
          return peek(taskQueue);
        }
        function unstable_cancelCallback(task) {
          task.callback = null;
        }
        function unstable_getCurrentPriorityLevel() {
          return currentPriorityLevel;
        }
        let isMessageLoopRunning = false;
        let scheduledHostCallback = null;
        let taskTimeoutID = -1;
        let frameInterval = frameYieldMs;
        let startTime = -1;
        function shouldYieldToHost() {
          const timeElapsed = exports.unstable_now() - startTime;
          if (timeElapsed < frameInterval) {
            return false;
          }
          return true;
        }
        function requestPaint() {
        }
        function forceFrameRate(fps) {
          if (fps < 0 || fps > 125) {
            console["error"]("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
            return;
          }
          if (fps > 0) {
            frameInterval = Math.floor(1e3 / fps);
          } else {
            frameInterval = frameYieldMs;
          }
        }
        const performWorkUntilDeadline = function() {
          if (scheduledHostCallback !== null) {
            const currentTime = exports.unstable_now();
            startTime = currentTime;
            const hasTimeRemaining = true;
            let hasMoreWork = true;
            try {
              hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
            } finally {
              if (hasMoreWork) {
                schedulePerformWorkUntilDeadline();
              } else {
                isMessageLoopRunning = false;
                scheduledHostCallback = null;
              }
            }
          } else {
            isMessageLoopRunning = false;
          }
        };
        let schedulePerformWorkUntilDeadline;
        if (typeof localSetImmediate === "function") {
          schedulePerformWorkUntilDeadline = function() {
            localSetImmediate(performWorkUntilDeadline);
          };
        } else if (typeof MessageChannel !== "undefined") {
          const channel = new MessageChannel();
          const port = channel.port2;
          channel.port1.onmessage = performWorkUntilDeadline;
          schedulePerformWorkUntilDeadline = function() {
            port.postMessage(null);
          };
        } else {
          schedulePerformWorkUntilDeadline = function() {
            localSetTimeout(performWorkUntilDeadline, 0);
          };
        }
        function requestHostCallback(callback) {
          scheduledHostCallback = callback;
          if (!isMessageLoopRunning) {
            isMessageLoopRunning = true;
            schedulePerformWorkUntilDeadline();
          }
        }
        function requestHostTimeout(callback, ms) {
          taskTimeoutID = localSetTimeout(function() {
            callback(exports.unstable_now());
          }, ms);
        }
        function cancelHostTimeout() {
          localClearTimeout(taskTimeoutID);
          taskTimeoutID = -1;
        }
        const unstable_requestPaint = requestPaint;
        const unstable_Profiling = null;
        exports.unstable_IdlePriority = IdlePriority;
        exports.unstable_ImmediatePriority = ImmediatePriority;
        exports.unstable_LowPriority = LowPriority;
        exports.unstable_NormalPriority = NormalPriority;
        exports.unstable_Profiling = unstable_Profiling;
        exports.unstable_UserBlockingPriority = UserBlockingPriority;
        exports.unstable_cancelCallback = unstable_cancelCallback;
        exports.unstable_continueExecution = unstable_continueExecution;
        exports.unstable_forceFrameRate = forceFrameRate;
        exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
        exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
        exports.unstable_next = unstable_next;
        exports.unstable_pauseExecution = unstable_pauseExecution;
        exports.unstable_requestPaint = unstable_requestPaint;
        exports.unstable_runWithPriority = unstable_runWithPriority;
        exports.unstable_scheduleCallback = unstable_scheduleCallback;
        exports.unstable_shouldYield = shouldYieldToHost;
        exports.unstable_wrapCallback = unstable_wrapCallback;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/scheduler/index.js
const require_scheduler = __commonJS({
  "node_modules/scheduler/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_scheduler_development();
    }
  }
});

// node_modules/react-dom/cjs/react-dom.development.js
const require_react_dom_development = __commonJS({
  "node_modules/react-dom/cjs/react-dom.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        const React = require_react();
        const Scheduler = require_scheduler();
        const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        let suppressWarning = false;
        function setSuppressWarning(newSuppressWarning) {
          {
            suppressWarning = newSuppressWarning;
          }
        }
        function warn(format) {
          {
            if (!suppressWarning) {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            if (!suppressWarning) {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            const ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            const stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            const argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        const FunctionComponent = 0;
        const ClassComponent = 1;
        const IndeterminateComponent = 2;
        const HostRoot = 3;
        const HostPortal = 4;
        const HostComponent = 5;
        const HostText = 6;
        const Fragment = 7;
        const Mode = 8;
        const ContextConsumer = 9;
        const ContextProvider = 10;
        const ForwardRef = 11;
        const Profiler = 12;
        const SuspenseComponent = 13;
        const MemoComponent = 14;
        const SimpleMemoComponent = 15;
        const LazyComponent = 16;
        const IncompleteClassComponent = 17;
        const DehydratedFragment = 18;
        const SuspenseListComponent = 19;
        const ScopeComponent = 21;
        const OffscreenComponent = 22;
        const LegacyHiddenComponent = 23;
        const CacheComponent = 24;
        const TracingMarkerComponent = 25;
        const enableClientRenderFallbackOnTextMismatch = true;
        const enableNewReconciler = false;
        const enableLazyContextPropagation = false;
        const enableLegacyHidden = false;
        const enableSuspenseAvoidThisFallback = false;
        const disableCommentsAsDOMContainers = true;
        const enableCustomElementPropertySupport = false;
        const warnAboutStringRefs = true;
        const enableSchedulingProfiler = true;
        const enableProfilerTimer = true;
        const enableProfilerCommitHooks = true;
        const allNativeEvents = /* @__PURE__ */ new Set();
        const registrationNameDependencies = {};
        const possibleRegistrationNames = {};
        function registerTwoPhaseEvent(registrationName, dependencies) {
          registerDirectEvent(registrationName, dependencies);
          registerDirectEvent(registrationName + "Capture", dependencies);
        }
        function registerDirectEvent(registrationName, dependencies) {
          {
            if (registrationNameDependencies[registrationName]) {
              error("EventRegistry: More than one plugin attempted to publish the same registration name, `%s`.", registrationName);
            }
          }
          registrationNameDependencies[registrationName] = dependencies;
          {
            const lowerCasedName = registrationName.toLowerCase();
            possibleRegistrationNames[lowerCasedName] = registrationName;
            if (registrationName === "onDoubleClick") {
              possibleRegistrationNames.ondblclick = registrationName;
            }
          }
          for (let i = 0; i < dependencies.length; i++) {
            allNativeEvents.add(dependencies[i]);
          }
        }
        const canUseDOM = !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
        const hasOwnProperty = Object.prototype.hasOwnProperty;
        function typeName(value) {
          {
            const hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            const type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkAttributeStringCoercion(value, attributeName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", attributeName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkPropStringCoercion(value, propName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` prop is an unsupported type %s. This value must be coerced to a string before before using it here.", propName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkCSSPropertyStringCoercion(value, propName) {
          {
            if (willCoercionThrow(value)) {
              error("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", propName, typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkHtmlStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function checkFormFieldValueStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("Form field values (value, checked, defaultValue, or defaultChecked props) must be strings, not %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        const RESERVED = 0;
        const STRING = 1;
        const BOOLEANISH_STRING = 2;
        const BOOLEAN = 3;
        const OVERLOADED_BOOLEAN = 4;
        const NUMERIC = 5;
        const POSITIVE_NUMERIC = 6;
        const ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
        const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
        const VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + ATTRIBUTE_NAME_START_CHAR + "][" + ATTRIBUTE_NAME_CHAR + "]*$");
        const illegalAttributeNameCache = {};
        const validatedAttributeNameCache = {};
        function isAttributeNameSafe(attributeName) {
          if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
            return true;
          }
          if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
            return false;
          }
          if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
            validatedAttributeNameCache[attributeName] = true;
            return true;
          }
          illegalAttributeNameCache[attributeName] = true;
          {
            error("Invalid attribute name: `%s`", attributeName);
          }
          return false;
        }
        function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
          if (propertyInfo !== null) {
            return propertyInfo.type === RESERVED;
          }
          if (isCustomComponentTag) {
            return false;
          }
          if (name.length > 2 && (name[0] === "o" || name[0] === "O") && (name[1] === "n" || name[1] === "N")) {
            return true;
          }
          return false;
        }
        function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
          if (propertyInfo !== null && propertyInfo.type === RESERVED) {
            return false;
          }
          switch (typeof value) {
            case "function":
            case "symbol":
              return true;
            case "boolean": {
              if (isCustomComponentTag) {
                return false;
              }
              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                const prefix2 = name.toLowerCase().slice(0, 5);
                return prefix2 !== "data-" && prefix2 !== "aria-";
              }
            }
            default:
              return false;
          }
        }
        function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
          if (value === null || typeof value === "undefined") {
            return true;
          }
          if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
            return true;
          }
          if (isCustomComponentTag) {
            return false;
          }
          if (propertyInfo !== null) {
            switch (propertyInfo.type) {
              case BOOLEAN:
                return !value;
              case OVERLOADED_BOOLEAN:
                return value === false;
              case NUMERIC:
                return isNaN(value);
              case POSITIVE_NUMERIC:
                return isNaN(value) || value < 1;
            }
          }
          return false;
        }
        function getPropertyInfo(name) {
          return properties.hasOwnProperty(name) ? properties[name] : null;
        }
        function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL2, removeEmptyString) {
          this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
          this.attributeName = attributeName;
          this.attributeNamespace = attributeNamespace;
          this.mustUseProperty = mustUseProperty;
          this.propertyName = name;
          this.type = type;
          this.sanitizeURL = sanitizeURL2;
          this.removeEmptyString = removeEmptyString;
        }
        var properties = {};
        const reservedProps = [
          "children",
          "dangerouslySetInnerHTML",
          // TODO: This prevents the assignment of defaultValue to regular
          // elements (not just inputs). Now that ReactDOMInput assigns to the
          // defaultValue property -- do we need this?
          "defaultValue",
          "defaultChecked",
          "innerHTML",
          "suppressContentEditableWarning",
          "suppressHydrationWarning",
          "style"
        ];
        reservedProps.forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            RESERVED,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(_ref) {
          const name = _ref[0], attributeName = _ref[1];
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEANISH_STRING,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "allowFullScreen",
          "async",
          // Note: there is a special case that prevents it from being written to the DOM
          // on the client side because the browsers are inconsistent. Instead we call focus().
          "autoFocus",
          "autoPlay",
          "controls",
          "default",
          "defer",
          "disabled",
          "disablePictureInPicture",
          "disableRemotePlayback",
          "formNoValidate",
          "hidden",
          "loop",
          "noModule",
          "noValidate",
          "open",
          "playsInline",
          "readOnly",
          "required",
          "reversed",
          "scoped",
          "seamless",
          // Microdata
          "itemScope"
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "checked",
          // Note: `option.selected` is not updated if `select.multiple` is
          // disabled with `removeAttribute`. We have special logic for handling this.
          "multiple",
          "muted",
          "selected"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            BOOLEAN,
            true,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "capture",
          "download"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            OVERLOADED_BOOLEAN,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "cols",
          "rows",
          "size",
          "span"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            POSITIVE_NUMERIC,
            false,
            // mustUseProperty
            name,
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        ["rowSpan", "start"].forEach(function(name) {
          properties[name] = new PropertyInfoRecord(
            name,
            NUMERIC,
            false,
            // mustUseProperty
            name.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        const CAMELIZE = /[\-\:]([a-z])/g;
        const capitalize = function(token) {
          return token[1].toUpperCase();
        };
        [
          "accent-height",
          "alignment-baseline",
          "arabic-form",
          "baseline-shift",
          "cap-height",
          "clip-path",
          "clip-rule",
          "color-interpolation",
          "color-interpolation-filters",
          "color-profile",
          "color-rendering",
          "dominant-baseline",
          "enable-background",
          "fill-opacity",
          "fill-rule",
          "flood-color",
          "flood-opacity",
          "font-family",
          "font-size",
          "font-size-adjust",
          "font-stretch",
          "font-style",
          "font-variant",
          "font-weight",
          "glyph-name",
          "glyph-orientation-horizontal",
          "glyph-orientation-vertical",
          "horiz-adv-x",
          "horiz-origin-x",
          "image-rendering",
          "letter-spacing",
          "lighting-color",
          "marker-end",
          "marker-mid",
          "marker-start",
          "overline-position",
          "overline-thickness",
          "paint-order",
          "panose-1",
          "pointer-events",
          "rendering-intent",
          "shape-rendering",
          "stop-color",
          "stop-opacity",
          "strikethrough-position",
          "strikethrough-thickness",
          "stroke-dasharray",
          "stroke-dashoffset",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-miterlimit",
          "stroke-opacity",
          "stroke-width",
          "text-anchor",
          "text-decoration",
          "text-rendering",
          "underline-position",
          "underline-thickness",
          "unicode-bidi",
          "unicode-range",
          "units-per-em",
          "v-alphabetic",
          "v-hanging",
          "v-ideographic",
          "v-mathematical",
          "vector-effect",
          "vert-adv-y",
          "vert-origin-x",
          "vert-origin-y",
          "word-spacing",
          "writing-mode",
          "xmlns:xlink",
          "x-height"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          const name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xlink:actuate",
          "xlink:arcrole",
          "xlink:role",
          "xlink:show",
          "xlink:title",
          "xlink:type"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          const name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/1999/xlink",
            false,
            // sanitizeURL
            false
          );
        });
        [
          "xml:base",
          "xml:lang",
          "xml:space"
          // NOTE: if you add a camelCased prop to this list,
          // you'll need to set attributeName to name.toLowerCase()
          // instead in the assignment below.
        ].forEach(function(attributeName) {
          const name = attributeName.replace(CAMELIZE, capitalize);
          properties[name] = new PropertyInfoRecord(
            name,
            STRING,
            false,
            // mustUseProperty
            attributeName,
            "http://www.w3.org/XML/1998/namespace",
            false,
            // sanitizeURL
            false
          );
        });
        ["tabIndex", "crossOrigin"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            false,
            // sanitizeURL
            false
          );
        });
        const xlinkHref = "xlinkHref";
        properties[xlinkHref] = new PropertyInfoRecord(
          "xlinkHref",
          STRING,
          false,
          // mustUseProperty
          "xlink:href",
          "http://www.w3.org/1999/xlink",
          true,
          // sanitizeURL
          false
        );
        ["src", "href", "action", "formAction"].forEach(function(attributeName) {
          properties[attributeName] = new PropertyInfoRecord(
            attributeName,
            STRING,
            false,
            // mustUseProperty
            attributeName.toLowerCase(),
            // attributeName
            null,
            // attributeNamespace
            true,
            // sanitizeURL
            true
          );
        });
        const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
        let didWarn = false;
        function sanitizeURL(url) {
          {
            if (!didWarn && isJavaScriptProtocol.test(url)) {
              didWarn = true;
              error("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(url));
            }
          }
        }
        function getValueForProperty(node, name, expected, propertyInfo) {
          {
            if (propertyInfo.mustUseProperty) {
              const propertyName = propertyInfo.propertyName;
              return node[propertyName];
            } else {
              {
                checkAttributeStringCoercion(expected, name);
              }
              if (propertyInfo.sanitizeURL) {
                sanitizeURL("" + expected);
              }
              const attributeName = propertyInfo.attributeName;
              let stringValue = null;
              if (propertyInfo.type === OVERLOADED_BOOLEAN) {
                if (node.hasAttribute(attributeName)) {
                  const value = node.getAttribute(attributeName);
                  if (value === "") {
                    return true;
                  }
                  if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
                    return value;
                  }
                  if (value === "" + expected) {
                    return expected;
                  }
                  return value;
                }
              } else if (node.hasAttribute(attributeName)) {
                if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
                  return node.getAttribute(attributeName);
                }
                if (propertyInfo.type === BOOLEAN) {
                  return expected;
                }
                stringValue = node.getAttribute(attributeName);
              }
              if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
                return stringValue === null ? expected : stringValue;
              } else if (stringValue === "" + expected) {
                return expected;
              } else {
                return stringValue;
              }
            }
          }
        }
        function getValueForAttribute(node, name, expected, isCustomComponentTag) {
          {
            if (!isAttributeNameSafe(name)) {
              return;
            }
            if (!node.hasAttribute(name)) {
              return expected === void 0 ? void 0 : null;
            }
            const value = node.getAttribute(name);
            {
              checkAttributeStringCoercion(expected, name);
            }
            if (value === "" + expected) {
              return expected;
            }
            return value;
          }
        }
        function setValueForProperty(node, name, value, isCustomComponentTag) {
          const propertyInfo = getPropertyInfo(name);
          if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
            return;
          }
          if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
            value = null;
          }
          if (isCustomComponentTag || propertyInfo === null) {
            if (isAttributeNameSafe(name)) {
              const _attributeName = name;
              if (value === null) {
                node.removeAttribute(_attributeName);
              } else {
                {
                  checkAttributeStringCoercion(value, name);
                }
                node.setAttribute(_attributeName, "" + value);
              }
            }
            return;
          }
          const mustUseProperty = propertyInfo.mustUseProperty;
          if (mustUseProperty) {
            const propertyName = propertyInfo.propertyName;
            if (value === null) {
              const type = propertyInfo.type;
              node[propertyName] = type === BOOLEAN ? false : "";
            } else {
              node[propertyName] = value;
            }
            return;
          }
          const attributeName = propertyInfo.attributeName, attributeNamespace = propertyInfo.attributeNamespace;
          if (value === null) {
            node.removeAttribute(attributeName);
          } else {
            const _type = propertyInfo.type;
            let attributeValue;
            if (_type === BOOLEAN || _type === OVERLOADED_BOOLEAN && value === true) {
              attributeValue = "";
            } else {
              {
                {
                  checkAttributeStringCoercion(value, attributeName);
                }
                attributeValue = "" + value;
              }
              if (propertyInfo.sanitizeURL) {
                sanitizeURL(attributeValue.toString());
              }
            }
            if (attributeNamespace) {
              node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
            } else {
              node.setAttribute(attributeName, attributeValue);
            }
          }
        }
        const REACT_ELEMENT_TYPE = Symbol.for("react.element");
        const REACT_PORTAL_TYPE = Symbol.for("react.portal");
        const REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        const REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        const REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        const REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        const REACT_CONTEXT_TYPE = Symbol.for("react.context");
        const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        const REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        const REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        const REACT_MEMO_TYPE = Symbol.for("react.memo");
        const REACT_LAZY_TYPE = Symbol.for("react.lazy");
        const REACT_SCOPE_TYPE = Symbol.for("react.scope");
        const REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for("react.debug_trace_mode");
        const REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        const REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
        const REACT_CACHE_TYPE = Symbol.for("react.cache");
        const REACT_TRACING_MARKER_TYPE = Symbol.for("react.tracing_marker");
        const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        const FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          const maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        const assign = Object.assign;
        let disabledDepth = 0;
        let prevLog;
        let prevInfo;
        let prevWarn;
        let prevError;
        let prevGroup;
        let prevGroupCollapsed;
        let prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              const props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              const props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        const ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        let prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                const match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        let reentry = false;
        let componentFrameCache;
        {
          const PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            const frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          let control;
          reentry = true;
          const previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          let previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              const Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              const sampleLines = sample.stack.split("\n");
              const controlLines = control.stack.split("\n");
              let s = sampleLines.length - 1;
              let c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        let _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          const name = fn ? fn.displayName || fn.name : "";
          const syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeClassComponentFrame(ctor, source, ownerFn) {
          {
            return describeNativeComponentFrame(ctor, true);
          }
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          const prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                const lazyComponent = type;
                const payload = lazyComponent._payload;
                const init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        function describeFiber(fiber) {
          const owner = fiber._debugOwner ? fiber._debugOwner.type : null;
          const source = fiber._debugSource;
          switch (fiber.tag) {
            case HostComponent:
              return describeBuiltInComponentFrame(fiber.type);
            case LazyComponent:
              return describeBuiltInComponentFrame("Lazy");
            case SuspenseComponent:
              return describeBuiltInComponentFrame("Suspense");
            case SuspenseListComponent:
              return describeBuiltInComponentFrame("SuspenseList");
            case FunctionComponent:
            case IndeterminateComponent:
            case SimpleMemoComponent:
              return describeFunctionComponentFrame(fiber.type);
            case ForwardRef:
              return describeFunctionComponentFrame(fiber.type.render);
            case ClassComponent:
              return describeClassComponentFrame(fiber.type);
            default:
              return "";
          }
        }
        function getStackByFiberInDevAndProd(workInProgress2) {
          try {
            let info = "";
            let node = workInProgress2;
            do {
              info += describeFiber(node);
              node = node.return;
            } while (node);
            return info;
          } catch (x) {
            return "\nError generating stack: " + x.message + "\n" + x.stack;
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          const displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          const functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                const lazyComponent = type;
                const payload = lazyComponent._payload;
                const init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        function getWrappedName$1(outerType, innerType, wrapperName) {
          const functionName = innerType.displayName || innerType.name || "";
          return outerType.displayName || (functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName);
        }
        function getContextName$1(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromFiber(fiber) {
          const tag = fiber.tag, type = fiber.type;
          switch (tag) {
            case CacheComponent:
              return "Cache";
            case ContextConsumer:
              var context = type;
              return getContextName$1(context) + ".Consumer";
            case ContextProvider:
              var provider = type;
              return getContextName$1(provider._context) + ".Provider";
            case DehydratedFragment:
              return "DehydratedFragment";
            case ForwardRef:
              return getWrappedName$1(type, type.render, "ForwardRef");
            case Fragment:
              return "Fragment";
            case HostComponent:
              return type;
            case HostPortal:
              return "Portal";
            case HostRoot:
              return "Root";
            case HostText:
              return "Text";
            case LazyComponent:
              return getComponentNameFromType(type);
            case Mode:
              if (type === REACT_STRICT_MODE_TYPE) {
                return "StrictMode";
              }
              return "Mode";
            case OffscreenComponent:
              return "Offscreen";
            case Profiler:
              return "Profiler";
            case ScopeComponent:
              return "Scope";
            case SuspenseComponent:
              return "Suspense";
            case SuspenseListComponent:
              return "SuspenseList";
            case TracingMarkerComponent:
              return "TracingMarker";
            case ClassComponent:
            case FunctionComponent:
            case IncompleteClassComponent:
            case IndeterminateComponent:
            case MemoComponent:
            case SimpleMemoComponent:
              if (typeof type === "function") {
                return type.displayName || type.name || null;
              }
              if (typeof type === "string") {
                return type;
              }
              break;
          }
          return null;
        }
        const ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        let current = null;
        let isRendering = false;
        function getCurrentFiberOwnerNameInDevOrNull() {
          {
            if (current === null) {
              return null;
            }
            const owner = current._debugOwner;
            if (owner !== null && typeof owner !== "undefined") {
              return getComponentNameFromFiber(owner);
            }
          }
          return null;
        }
        function getCurrentFiberStackInDev() {
          {
            if (current === null) {
              return "";
            }
            return getStackByFiberInDevAndProd(current);
          }
        }
        function resetCurrentFiber() {
          {
            ReactDebugCurrentFrame.getCurrentStack = null;
            current = null;
            isRendering = false;
          }
        }
        function setCurrentFiber(fiber) {
          {
            ReactDebugCurrentFrame.getCurrentStack = fiber === null ? null : getCurrentFiberStackInDev;
            current = fiber;
            isRendering = false;
          }
        }
        function getCurrentFiber() {
          {
            return current;
          }
        }
        function setIsRendering(rendering) {
          {
            isRendering = rendering;
          }
        }
        function toString(value) {
          return "" + value;
        }
        function getToStringValue(value) {
          switch (typeof value) {
            case "boolean":
            case "number":
            case "string":
            case "undefined":
              return value;
            case "object":
              {
                checkFormFieldValueStringCoercion(value);
              }
              return value;
            default:
              return "";
          }
        }
        const hasReadOnlyValue = {
          button: true,
          checkbox: true,
          image: true,
          hidden: true,
          radio: true,
          reset: true,
          submit: true
        };
        function checkControlledValueProps(tagName, props) {
          {
            if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
              error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.");
            }
            if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
              error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
            }
          }
        }
        function isCheckable(elem) {
          const type = elem.type;
          const nodeName = elem.nodeName;
          return nodeName && nodeName.toLowerCase() === "input" && (type === "checkbox" || type === "radio");
        }
        function getTracker(node) {
          return node._valueTracker;
        }
        function detachTracker(node) {
          node._valueTracker = null;
        }
        function getValueFromNode(node) {
          let value = "";
          if (!node) {
            return value;
          }
          if (isCheckable(node)) {
            value = node.checked ? "true" : "false";
          } else {
            value = node.value;
          }
          return value;
        }
        function trackValueOnNode(node) {
          const valueField = isCheckable(node) ? "checked" : "value";
          const descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
          {
            checkFormFieldValueStringCoercion(node[valueField]);
          }
          let currentValue = "" + node[valueField];
          if (node.hasOwnProperty(valueField) || typeof descriptor === "undefined" || typeof descriptor.get !== "function" || typeof descriptor.set !== "function") {
            return;
          }
          const get2 = descriptor.get, set2 = descriptor.set;
          Object.defineProperty(node, valueField, {
            configurable: true,
            get: function() {
              return get2.call(this);
            },
            set: function(value) {
              {
                checkFormFieldValueStringCoercion(value);
              }
              currentValue = "" + value;
              set2.call(this, value);
            }
          });
          Object.defineProperty(node, valueField, {
            enumerable: descriptor.enumerable
          });
          const tracker = {
            getValue: function() {
              return currentValue;
            },
            setValue: function(value) {
              {
                checkFormFieldValueStringCoercion(value);
              }
              currentValue = "" + value;
            },
            stopTracking: function() {
              detachTracker(node);
              delete node[valueField];
            }
          };
          return tracker;
        }
        function track(node) {
          if (getTracker(node)) {
            return;
          }
          node._valueTracker = trackValueOnNode(node);
        }
        function updateValueIfChanged(node) {
          if (!node) {
            return false;
          }
          const tracker = getTracker(node);
          if (!tracker) {
            return true;
          }
          const lastValue = tracker.getValue();
          const nextValue = getValueFromNode(node);
          if (nextValue !== lastValue) {
            tracker.setValue(nextValue);
            return true;
          }
          return false;
        }
        function getActiveElement(doc) {
          doc = doc || (typeof document !== "undefined" ? document : void 0);
          if (typeof doc === "undefined") {
            return null;
          }
          try {
            return doc.activeElement || doc.body;
          } catch (e) {
            return doc.body;
          }
        }
        let didWarnValueDefaultValue = false;
        let didWarnCheckedDefaultChecked = false;
        let didWarnControlledToUncontrolled = false;
        let didWarnUncontrolledToControlled = false;
        function isControlled(props) {
          const usesChecked = props.type === "checkbox" || props.type === "radio";
          return usesChecked ? props.checked != null : props.value != null;
        }
        function getHostProps(element, props) {
          const node = element;
          const checked = props.checked;
          const hostProps = assign({}, props, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: checked != null ? checked : node._wrapperState.initialChecked
          });
          return hostProps;
        }
        function initWrapperState(element, props) {
          {
            checkControlledValueProps("input", props);
            if (props.checked !== void 0 && props.defaultChecked !== void 0 && !didWarnCheckedDefaultChecked) {
              error("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", getCurrentFiberOwnerNameInDevOrNull() || "A component", props.type);
              didWarnCheckedDefaultChecked = true;
            }
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnValueDefaultValue) {
              error("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", getCurrentFiberOwnerNameInDevOrNull() || "A component", props.type);
              didWarnValueDefaultValue = true;
            }
          }
          const node = element;
          const defaultValue = props.defaultValue == null ? "" : props.defaultValue;
          node._wrapperState = {
            initialChecked: props.checked != null ? props.checked : props.defaultChecked,
            initialValue: getToStringValue(props.value != null ? props.value : defaultValue),
            controlled: isControlled(props)
          };
        }
        function updateChecked(element, props) {
          const node = element;
          const checked = props.checked;
          if (checked != null) {
            setValueForProperty(node, "checked", checked, false);
          }
        }
        function updateWrapper(element, props) {
          const node = element;
          {
            const controlled = isControlled(props);
            if (!node._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
              error("A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components");
              didWarnUncontrolledToControlled = true;
            }
            if (node._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
              error("A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components");
              didWarnControlledToUncontrolled = true;
            }
          }
          updateChecked(element, props);
          const value = getToStringValue(props.value);
          const type = props.type;
          if (value != null) {
            if (type === "number") {
              if (value === 0 && node.value === "" || // We explicitly want to coerce to number here if possible.
              // eslint-disable-next-line
              node.value != value) {
                node.value = toString(value);
              }
            } else if (node.value !== toString(value)) {
              node.value = toString(value);
            }
          } else if (type === "submit" || type === "reset") {
            node.removeAttribute("value");
            return;
          }
          {
            if (props.hasOwnProperty("value")) {
              setDefaultValue(node, props.type, value);
            } else if (props.hasOwnProperty("defaultValue")) {
              setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
            }
          }
          {
            if (props.checked == null && props.defaultChecked != null) {
              node.defaultChecked = !!props.defaultChecked;
            }
          }
        }
        function postMountWrapper(element, props, isHydrating2) {
          const node = element;
          if (props.hasOwnProperty("value") || props.hasOwnProperty("defaultValue")) {
            const type = props.type;
            const isButton = type === "submit" || type === "reset";
            if (isButton && (props.value === void 0 || props.value === null)) {
              return;
            }
            const initialValue = toString(node._wrapperState.initialValue);
            if (!isHydrating2) {
              {
                if (initialValue !== node.value) {
                  node.value = initialValue;
                }
              }
            }
            {
              node.defaultValue = initialValue;
            }
          }
          const name = node.name;
          if (name !== "") {
            node.name = "";
          }
          {
            node.defaultChecked = !node.defaultChecked;
            node.defaultChecked = !!node._wrapperState.initialChecked;
          }
          if (name !== "") {
            node.name = name;
          }
        }
        function restoreControlledState(element, props) {
          const node = element;
          updateWrapper(node, props);
          updateNamedCousins(node, props);
        }
        function updateNamedCousins(rootNode, props) {
          const name = props.name;
          if (props.type === "radio" && name != null) {
            let queryRoot = rootNode;
            while (queryRoot.parentNode) {
              queryRoot = queryRoot.parentNode;
            }
            {
              checkAttributeStringCoercion(name, "name");
            }
            const group = queryRoot.querySelectorAll("input[name=" + JSON.stringify("" + name) + '][type="radio"]');
            for (let i = 0; i < group.length; i++) {
              const otherNode = group[i];
              if (otherNode === rootNode || otherNode.form !== rootNode.form) {
                continue;
              }
              const otherProps = getFiberCurrentPropsFromNode(otherNode);
              if (!otherProps) {
                throw new Error("ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.");
              }
              updateValueIfChanged(otherNode);
              updateWrapper(otherNode, otherProps);
            }
          }
        }
        function setDefaultValue(node, type, value) {
          if (
            // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
            type !== "number" || getActiveElement(node.ownerDocument) !== node
          ) {
            if (value == null) {
              node.defaultValue = toString(node._wrapperState.initialValue);
            } else if (node.defaultValue !== toString(value)) {
              node.defaultValue = toString(value);
            }
          }
        }
        let didWarnSelectedSetOnOption = false;
        let didWarnInvalidChild = false;
        let didWarnInvalidInnerHTML = false;
        function validateProps(element, props) {
          {
            if (props.value == null) {
              if (typeof props.children === "object" && props.children !== null) {
                React.Children.forEach(props.children, function(child) {
                  if (child == null) {
                    return;
                  }
                  if (typeof child === "string" || typeof child === "number") {
                    return;
                  }
                  if (!didWarnInvalidChild) {
                    didWarnInvalidChild = true;
                    error("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.");
                  }
                });
              } else if (props.dangerouslySetInnerHTML != null) {
                if (!didWarnInvalidInnerHTML) {
                  didWarnInvalidInnerHTML = true;
                  error("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.");
                }
              }
            }
            if (props.selected != null && !didWarnSelectedSetOnOption) {
              error("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.");
              didWarnSelectedSetOnOption = true;
            }
          }
        }
        function postMountWrapper$1(element, props) {
          if (props.value != null) {
            element.setAttribute("value", toString(getToStringValue(props.value)));
          }
        }
        const isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        let didWarnValueDefaultValue$1;
        {
          didWarnValueDefaultValue$1 = false;
        }
        function getDeclarationErrorAddendum() {
          const ownerName = getCurrentFiberOwnerNameInDevOrNull();
          if (ownerName) {
            return "\n\nCheck the render method of `" + ownerName + "`.";
          }
          return "";
        }
        const valuePropNames = ["value", "defaultValue"];
        function checkSelectPropTypes(props) {
          {
            checkControlledValueProps("select", props);
            for (let i = 0; i < valuePropNames.length; i++) {
              const propName = valuePropNames[i];
              if (props[propName] == null) {
                continue;
              }
              const propNameIsArray = isArray(props[propName]);
              if (props.multiple && !propNameIsArray) {
                error("The `%s` prop supplied to <select> must be an array if `multiple` is true.%s", propName, getDeclarationErrorAddendum());
              } else if (!props.multiple && propNameIsArray) {
                error("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.%s", propName, getDeclarationErrorAddendum());
              }
            }
          }
        }
        function updateOptions(node, multiple, propValue, setDefaultSelected) {
          const options2 = node.options;
          if (multiple) {
            const selectedValues = propValue;
            const selectedValue = {};
            for (let i = 0; i < selectedValues.length; i++) {
              selectedValue["$" + selectedValues[i]] = true;
            }
            for (let _i = 0; _i < options2.length; _i++) {
              const selected = selectedValue.hasOwnProperty("$" + options2[_i].value);
              if (options2[_i].selected !== selected) {
                options2[_i].selected = selected;
              }
              if (selected && setDefaultSelected) {
                options2[_i].defaultSelected = true;
              }
            }
          } else {
            const _selectedValue = toString(getToStringValue(propValue));
            let defaultSelected = null;
            for (let _i2 = 0; _i2 < options2.length; _i2++) {
              if (options2[_i2].value === _selectedValue) {
                options2[_i2].selected = true;
                if (setDefaultSelected) {
                  options2[_i2].defaultSelected = true;
                }
                return;
              }
              if (defaultSelected === null && !options2[_i2].disabled) {
                defaultSelected = options2[_i2];
              }
            }
            if (defaultSelected !== null) {
              defaultSelected.selected = true;
            }
          }
        }
        function getHostProps$1(element, props) {
          return assign({}, props, {
            value: void 0
          });
        }
        function initWrapperState$1(element, props) {
          const node = element;
          {
            checkSelectPropTypes(props);
          }
          node._wrapperState = {
            wasMultiple: !!props.multiple
          };
          {
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnValueDefaultValue$1) {
              error("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components");
              didWarnValueDefaultValue$1 = true;
            }
          }
        }
        function postMountWrapper$2(element, props) {
          const node = element;
          node.multiple = !!props.multiple;
          const value = props.value;
          if (value != null) {
            updateOptions(node, !!props.multiple, value, false);
          } else if (props.defaultValue != null) {
            updateOptions(node, !!props.multiple, props.defaultValue, true);
          }
        }
        function postUpdateWrapper(element, props) {
          const node = element;
          const wasMultiple = node._wrapperState.wasMultiple;
          node._wrapperState.wasMultiple = !!props.multiple;
          const value = props.value;
          if (value != null) {
            updateOptions(node, !!props.multiple, value, false);
          } else if (wasMultiple !== !!props.multiple) {
            if (props.defaultValue != null) {
              updateOptions(node, !!props.multiple, props.defaultValue, true);
            } else {
              updateOptions(node, !!props.multiple, props.multiple ? [] : "", false);
            }
          }
        }
        function restoreControlledState$1(element, props) {
          const node = element;
          const value = props.value;
          if (value != null) {
            updateOptions(node, !!props.multiple, value, false);
          }
        }
        let didWarnValDefaultVal = false;
        function getHostProps$2(element, props) {
          const node = element;
          if (props.dangerouslySetInnerHTML != null) {
            throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
          }
          const hostProps = assign({}, props, {
            value: void 0,
            defaultValue: void 0,
            children: toString(node._wrapperState.initialValue)
          });
          return hostProps;
        }
        function initWrapperState$2(element, props) {
          const node = element;
          {
            checkControlledValueProps("textarea", props);
            if (props.value !== void 0 && props.defaultValue !== void 0 && !didWarnValDefaultVal) {
              error("%s contains a textarea with both value and defaultValue props. Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components", getCurrentFiberOwnerNameInDevOrNull() || "A component");
              didWarnValDefaultVal = true;
            }
          }
          let initialValue = props.value;
          if (initialValue == null) {
            let children = props.children, defaultValue = props.defaultValue;
            if (children != null) {
              {
                error("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
              }
              {
                if (defaultValue != null) {
                  throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
                }
                if (isArray(children)) {
                  if (children.length > 1) {
                    throw new Error("<textarea> can only have at most one child.");
                  }
                  children = children[0];
                }
                defaultValue = children;
              }
            }
            if (defaultValue == null) {
              defaultValue = "";
            }
            initialValue = defaultValue;
          }
          node._wrapperState = {
            initialValue: getToStringValue(initialValue)
          };
        }
        function updateWrapper$1(element, props) {
          const node = element;
          const value = getToStringValue(props.value);
          const defaultValue = getToStringValue(props.defaultValue);
          if (value != null) {
            const newValue = toString(value);
            if (newValue !== node.value) {
              node.value = newValue;
            }
            if (props.defaultValue == null && node.defaultValue !== newValue) {
              node.defaultValue = newValue;
            }
          }
          if (defaultValue != null) {
            node.defaultValue = toString(defaultValue);
          }
        }
        function postMountWrapper$3(element, props) {
          const node = element;
          const textContent = node.textContent;
          if (textContent === node._wrapperState.initialValue) {
            if (textContent !== "" && textContent !== null) {
              node.value = textContent;
            }
          }
        }
        function restoreControlledState$2(element, props) {
          updateWrapper$1(element, props);
        }
        const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
        const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
        const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
        function getIntrinsicNamespace(type) {
          switch (type) {
            case "svg":
              return SVG_NAMESPACE;
            case "math":
              return MATH_NAMESPACE;
            default:
              return HTML_NAMESPACE;
          }
        }
        function getChildNamespace(parentNamespace, type) {
          if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
            return getIntrinsicNamespace(type);
          }
          if (parentNamespace === SVG_NAMESPACE && type === "foreignObject") {
            return HTML_NAMESPACE;
          }
          return parentNamespace;
        }
        const createMicrosoftUnsafeLocalFunction = function(func) {
          if (typeof MSApp !== "undefined" && MSApp.execUnsafeLocalFunction) {
            return function(arg0, arg1, arg2, arg3) {
              MSApp.execUnsafeLocalFunction(function() {
                return func(arg0, arg1, arg2, arg3);
              });
            };
          } else {
            return func;
          }
        };
        let reusableSVGContainer;
        const setInnerHTML = createMicrosoftUnsafeLocalFunction(function(node, html) {
          if (node.namespaceURI === SVG_NAMESPACE) {
            if (!("innerHTML" in node)) {
              reusableSVGContainer = reusableSVGContainer || document.createElement("div");
              reusableSVGContainer.innerHTML = "<svg>" + html.valueOf().toString() + "</svg>";
              const svgNode = reusableSVGContainer.firstChild;
              while (node.firstChild) {
                node.removeChild(node.firstChild);
              }
              while (svgNode.firstChild) {
                node.appendChild(svgNode.firstChild);
              }
              return;
            }
          }
          node.innerHTML = html;
        });
        const ELEMENT_NODE = 1;
        const TEXT_NODE = 3;
        const COMMENT_NODE = 8;
        const DOCUMENT_NODE = 9;
        const DOCUMENT_FRAGMENT_NODE = 11;
        const setTextContent = function(node, text) {
          if (text) {
            const firstChild = node.firstChild;
            if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
              firstChild.nodeValue = text;
              return;
            }
          }
          node.textContent = text;
        };
        const shorthandToLonghand = {
          animation: ["animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationTimingFunction"],
          background: ["backgroundAttachment", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize"],
          backgroundPosition: ["backgroundPositionX", "backgroundPositionY"],
          border: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderTopColor", "borderTopStyle", "borderTopWidth"],
          borderBlockEnd: ["borderBlockEndColor", "borderBlockEndStyle", "borderBlockEndWidth"],
          borderBlockStart: ["borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth"],
          borderBottom: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth"],
          borderColor: ["borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"],
          borderImage: ["borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth"],
          borderInlineEnd: ["borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth"],
          borderInlineStart: ["borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth"],
          borderLeft: ["borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
          borderRadius: ["borderBottomLeftRadius", "borderBottomRightRadius", "borderTopLeftRadius", "borderTopRightRadius"],
          borderRight: ["borderRightColor", "borderRightStyle", "borderRightWidth"],
          borderStyle: ["borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopStyle"],
          borderTop: ["borderTopColor", "borderTopStyle", "borderTopWidth"],
          borderWidth: ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth"],
          columnRule: ["columnRuleColor", "columnRuleStyle", "columnRuleWidth"],
          columns: ["columnCount", "columnWidth"],
          flex: ["flexBasis", "flexGrow", "flexShrink"],
          flexFlow: ["flexDirection", "flexWrap"],
          font: ["fontFamily", "fontFeatureSettings", "fontKerning", "fontLanguageOverride", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontWeight", "lineHeight"],
          fontVariant: ["fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition"],
          gap: ["columnGap", "rowGap"],
          grid: ["gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
          gridArea: ["gridColumnEnd", "gridColumnStart", "gridRowEnd", "gridRowStart"],
          gridColumn: ["gridColumnEnd", "gridColumnStart"],
          gridColumnGap: ["columnGap"],
          gridGap: ["columnGap", "rowGap"],
          gridRow: ["gridRowEnd", "gridRowStart"],
          gridRowGap: ["rowGap"],
          gridTemplate: ["gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
          listStyle: ["listStyleImage", "listStylePosition", "listStyleType"],
          margin: ["marginBottom", "marginLeft", "marginRight", "marginTop"],
          marker: ["markerEnd", "markerMid", "markerStart"],
          mask: ["maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPositionX", "maskPositionY", "maskRepeat", "maskSize"],
          maskPosition: ["maskPositionX", "maskPositionY"],
          outline: ["outlineColor", "outlineStyle", "outlineWidth"],
          overflow: ["overflowX", "overflowY"],
          padding: ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"],
          placeContent: ["alignContent", "justifyContent"],
          placeItems: ["alignItems", "justifyItems"],
          placeSelf: ["alignSelf", "justifySelf"],
          textDecoration: ["textDecorationColor", "textDecorationLine", "textDecorationStyle"],
          textEmphasis: ["textEmphasisColor", "textEmphasisStyle"],
          transition: ["transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction"],
          wordWrap: ["overflowWrap"]
        };
        const isUnitlessNumber = {
          animationIterationCount: true,
          aspectRatio: true,
          borderImageOutset: true,
          borderImageSlice: true,
          borderImageWidth: true,
          boxFlex: true,
          boxFlexGroup: true,
          boxOrdinalGroup: true,
          columnCount: true,
          columns: true,
          flex: true,
          flexGrow: true,
          flexPositive: true,
          flexShrink: true,
          flexNegative: true,
          flexOrder: true,
          gridArea: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowSpan: true,
          gridRowStart: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnSpan: true,
          gridColumnStart: true,
          fontWeight: true,
          lineClamp: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          tabSize: true,
          widows: true,
          zIndex: true,
          zoom: true,
          // SVG-related properties
          fillOpacity: true,
          floodOpacity: true,
          stopOpacity: true,
          strokeDasharray: true,
          strokeDashoffset: true,
          strokeMiterlimit: true,
          strokeOpacity: true,
          strokeWidth: true
        };
        function prefixKey(prefix2, key) {
          return prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
        }
        const prefixes = ["Webkit", "ms", "Moz", "O"];
        Object.keys(isUnitlessNumber).forEach(function(prop) {
          prefixes.forEach(function(prefix2) {
            isUnitlessNumber[prefixKey(prefix2, prop)] = isUnitlessNumber[prop];
          });
        });
        function dangerousStyleValue(name, value, isCustomProperty) {
          const isEmpty = value == null || typeof value === "boolean" || value === "";
          if (isEmpty) {
            return "";
          }
          if (!isCustomProperty && typeof value === "number" && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
            return value + "px";
          }
          {
            checkCSSPropertyStringCoercion(value, name);
          }
          return ("" + value).trim();
        }
        const uppercasePattern = /([A-Z])/g;
        const msPattern = /^ms-/;
        function hyphenateStyleName(name) {
          return name.replace(uppercasePattern, "-$1").toLowerCase().replace(msPattern, "-ms-");
        }
        let warnValidStyle = function() {
        };
        {
          const badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
          const msPattern$1 = /^-ms-/;
          const hyphenPattern = /-(.)/g;
          const badStyleValueWithSemicolonPattern = /;\s*$/;
          const warnedStyleNames = {};
          const warnedStyleValues = {};
          let warnedForNaNValue = false;
          let warnedForInfinityValue = false;
          const camelize = function(string) {
            return string.replace(hyphenPattern, function(_, character) {
              return character.toUpperCase();
            });
          };
          const warnHyphenatedStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error(
              "Unsupported style property %s. Did you mean %s?",
              name,
              // As Andi Smith suggests
              // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
              // is converted to lowercase `ms`.
              camelize(name.replace(msPattern$1, "ms-"))
            );
          };
          const warnBadVendoredStyleName = function(name) {
            if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
              return;
            }
            warnedStyleNames[name] = true;
            error("Unsupported vendor-prefixed style property %s. Did you mean %s?", name, name.charAt(0).toUpperCase() + name.slice(1));
          };
          const warnStyleValueWithSemicolon = function(name, value) {
            if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
              return;
            }
            warnedStyleValues[value] = true;
            error(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, name, value.replace(badStyleValueWithSemicolonPattern, ""));
          };
          const warnStyleValueIsNaN = function(name, value) {
            if (warnedForNaNValue) {
              return;
            }
            warnedForNaNValue = true;
            error("`NaN` is an invalid value for the `%s` css style property.", name);
          };
          const warnStyleValueIsInfinity = function(name, value) {
            if (warnedForInfinityValue) {
              return;
            }
            warnedForInfinityValue = true;
            error("`Infinity` is an invalid value for the `%s` css style property.", name);
          };
          warnValidStyle = function(name, value) {
            if (name.indexOf("-") > -1) {
              warnHyphenatedStyleName(name);
            } else if (badVendoredStyleNamePattern.test(name)) {
              warnBadVendoredStyleName(name);
            } else if (badStyleValueWithSemicolonPattern.test(value)) {
              warnStyleValueWithSemicolon(name, value);
            }
            if (typeof value === "number") {
              if (isNaN(value)) {
                warnStyleValueIsNaN(name, value);
              } else if (!isFinite(value)) {
                warnStyleValueIsInfinity(name, value);
              }
            }
          };
        }
        const warnValidStyle$1 = warnValidStyle;
        function createDangerousStringForStyles(styles) {
          {
            let serialized = "";
            let delimiter = "";
            for (const styleName in styles) {
              if (!styles.hasOwnProperty(styleName)) {
                continue;
              }
              const styleValue = styles[styleName];
              if (styleValue != null) {
                const isCustomProperty = styleName.indexOf("--") === 0;
                serialized += delimiter + (isCustomProperty ? styleName : hyphenateStyleName(styleName)) + ":";
                serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
                delimiter = ";";
              }
            }
            return serialized || null;
          }
        }
        function setValueForStyles(node, styles) {
          const style2 = node.style;
          for (let styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
              continue;
            }
            const isCustomProperty = styleName.indexOf("--") === 0;
            {
              if (!isCustomProperty) {
                warnValidStyle$1(styleName, styles[styleName]);
              }
            }
            const styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
            if (styleName === "float") {
              styleName = "cssFloat";
            }
            if (isCustomProperty) {
              style2.setProperty(styleName, styleValue);
            } else {
              style2[styleName] = styleValue;
            }
          }
        }
        function isValueEmpty(value) {
          return value == null || typeof value === "boolean" || value === "";
        }
        function expandShorthandMap(styles) {
          const expanded = {};
          for (const key in styles) {
            const longhands = shorthandToLonghand[key] || [key];
            for (let i = 0; i < longhands.length; i++) {
              expanded[longhands[i]] = key;
            }
          }
          return expanded;
        }
        function validateShorthandPropertyCollisionInDev(styleUpdates, nextStyles) {
          {
            if (!nextStyles) {
              return;
            }
            const expandedUpdates = expandShorthandMap(styleUpdates);
            const expandedStyles = expandShorthandMap(nextStyles);
            const warnedAbout = {};
            for (const key in expandedUpdates) {
              const originalKey = expandedUpdates[key];
              const correctOriginalKey = expandedStyles[key];
              if (correctOriginalKey && originalKey !== correctOriginalKey) {
                const warningKey = originalKey + "," + correctOriginalKey;
                if (warnedAbout[warningKey]) {
                  continue;
                }
                warnedAbout[warningKey] = true;
                error("%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.", isValueEmpty(styleUpdates[originalKey]) ? "Removing" : "Updating", originalKey, correctOriginalKey);
              }
            }
          }
        }
        const omittedCloseTags = {
          area: true,
          base: true,
          br: true,
          col: true,
          embed: true,
          hr: true,
          img: true,
          input: true,
          keygen: true,
          link: true,
          meta: true,
          param: true,
          source: true,
          track: true,
          wbr: true
          // NOTE: menuitem's close tag should be omitted, but that causes problems.
        };
        const voidElementTags = assign({
          menuitem: true
        }, omittedCloseTags);
        const HTML = "__html";
        function assertValidProps(tag, props) {
          if (!props) {
            return;
          }
          if (voidElementTags[tag]) {
            if (props.children != null || props.dangerouslySetInnerHTML != null) {
              throw new Error(tag + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            }
          }
          if (props.dangerouslySetInnerHTML != null) {
            if (props.children != null) {
              throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
            if (typeof props.dangerouslySetInnerHTML !== "object" || !(HTML in props.dangerouslySetInnerHTML)) {
              throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
            }
          }
          {
            if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
              error("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.");
            }
          }
          if (props.style != null && typeof props.style !== "object") {
            throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
          }
        }
        function isCustomComponent(tagName, props) {
          if (tagName.indexOf("-") === -1) {
            return typeof props.is === "string";
          }
          switch (tagName) {
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return false;
            default:
              return true;
          }
        }
        const possibleStandardNames = {
          // HTML
          accept: "accept",
          acceptcharset: "acceptCharset",
          "accept-charset": "acceptCharset",
          accesskey: "accessKey",
          action: "action",
          allowfullscreen: "allowFullScreen",
          alt: "alt",
          as: "as",
          async: "async",
          autocapitalize: "autoCapitalize",
          autocomplete: "autoComplete",
          autocorrect: "autoCorrect",
          autofocus: "autoFocus",
          autoplay: "autoPlay",
          autosave: "autoSave",
          capture: "capture",
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          challenge: "challenge",
          charset: "charSet",
          checked: "checked",
          children: "children",
          cite: "cite",
          class: "className",
          classid: "classID",
          classname: "className",
          cols: "cols",
          colspan: "colSpan",
          content: "content",
          contenteditable: "contentEditable",
          contextmenu: "contextMenu",
          controls: "controls",
          controlslist: "controlsList",
          coords: "coords",
          crossorigin: "crossOrigin",
          dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
          data: "data",
          datetime: "dateTime",
          default: "default",
          defaultchecked: "defaultChecked",
          defaultvalue: "defaultValue",
          defer: "defer",
          dir: "dir",
          disabled: "disabled",
          disablepictureinpicture: "disablePictureInPicture",
          disableremoteplayback: "disableRemotePlayback",
          download: "download",
          draggable: "draggable",
          enctype: "encType",
          enterkeyhint: "enterKeyHint",
          for: "htmlFor",
          form: "form",
          formmethod: "formMethod",
          formaction: "formAction",
          formenctype: "formEncType",
          formnovalidate: "formNoValidate",
          formtarget: "formTarget",
          frameborder: "frameBorder",
          headers: "headers",
          height: "height",
          hidden: "hidden",
          high: "high",
          href: "href",
          hreflang: "hrefLang",
          htmlfor: "htmlFor",
          httpequiv: "httpEquiv",
          "http-equiv": "httpEquiv",
          icon: "icon",
          id: "id",
          imagesizes: "imageSizes",
          imagesrcset: "imageSrcSet",
          innerhtml: "innerHTML",
          inputmode: "inputMode",
          integrity: "integrity",
          is: "is",
          itemid: "itemID",
          itemprop: "itemProp",
          itemref: "itemRef",
          itemscope: "itemScope",
          itemtype: "itemType",
          keyparams: "keyParams",
          keytype: "keyType",
          kind: "kind",
          label: "label",
          lang: "lang",
          list: "list",
          loop: "loop",
          low: "low",
          manifest: "manifest",
          marginwidth: "marginWidth",
          marginheight: "marginHeight",
          max: "max",
          maxlength: "maxLength",
          media: "media",
          mediagroup: "mediaGroup",
          method: "method",
          min: "min",
          minlength: "minLength",
          multiple: "multiple",
          muted: "muted",
          name: "name",
          nomodule: "noModule",
          nonce: "nonce",
          novalidate: "noValidate",
          open: "open",
          optimum: "optimum",
          pattern: "pattern",
          placeholder: "placeholder",
          playsinline: "playsInline",
          poster: "poster",
          preload: "preload",
          profile: "profile",
          radiogroup: "radioGroup",
          readonly: "readOnly",
          referrerpolicy: "referrerPolicy",
          rel: "rel",
          required: "required",
          reversed: "reversed",
          role: "role",
          rows: "rows",
          rowspan: "rowSpan",
          sandbox: "sandbox",
          scope: "scope",
          scoped: "scoped",
          scrolling: "scrolling",
          seamless: "seamless",
          selected: "selected",
          shape: "shape",
          size: "size",
          sizes: "sizes",
          span: "span",
          spellcheck: "spellCheck",
          src: "src",
          srcdoc: "srcDoc",
          srclang: "srcLang",
          srcset: "srcSet",
          start: "start",
          step: "step",
          style: "style",
          summary: "summary",
          tabindex: "tabIndex",
          target: "target",
          title: "title",
          type: "type",
          usemap: "useMap",
          value: "value",
          width: "width",
          wmode: "wmode",
          wrap: "wrap",
          // SVG
          about: "about",
          accentheight: "accentHeight",
          "accent-height": "accentHeight",
          accumulate: "accumulate",
          additive: "additive",
          alignmentbaseline: "alignmentBaseline",
          "alignment-baseline": "alignmentBaseline",
          allowreorder: "allowReorder",
          alphabetic: "alphabetic",
          amplitude: "amplitude",
          arabicform: "arabicForm",
          "arabic-form": "arabicForm",
          ascent: "ascent",
          attributename: "attributeName",
          attributetype: "attributeType",
          autoreverse: "autoReverse",
          azimuth: "azimuth",
          basefrequency: "baseFrequency",
          baselineshift: "baselineShift",
          "baseline-shift": "baselineShift",
          baseprofile: "baseProfile",
          bbox: "bbox",
          begin: "begin",
          bias: "bias",
          by: "by",
          calcmode: "calcMode",
          capheight: "capHeight",
          "cap-height": "capHeight",
          clip: "clip",
          clippath: "clipPath",
          "clip-path": "clipPath",
          clippathunits: "clipPathUnits",
          cliprule: "clipRule",
          "clip-rule": "clipRule",
          color: "color",
          colorinterpolation: "colorInterpolation",
          "color-interpolation": "colorInterpolation",
          colorinterpolationfilters: "colorInterpolationFilters",
          "color-interpolation-filters": "colorInterpolationFilters",
          colorprofile: "colorProfile",
          "color-profile": "colorProfile",
          colorrendering: "colorRendering",
          "color-rendering": "colorRendering",
          contentscripttype: "contentScriptType",
          contentstyletype: "contentStyleType",
          cursor: "cursor",
          cx: "cx",
          cy: "cy",
          d: "d",
          datatype: "datatype",
          decelerate: "decelerate",
          descent: "descent",
          diffuseconstant: "diffuseConstant",
          direction: "direction",
          display: "display",
          divisor: "divisor",
          dominantbaseline: "dominantBaseline",
          "dominant-baseline": "dominantBaseline",
          dur: "dur",
          dx: "dx",
          dy: "dy",
          edgemode: "edgeMode",
          elevation: "elevation",
          enablebackground: "enableBackground",
          "enable-background": "enableBackground",
          end: "end",
          exponent: "exponent",
          externalresourcesrequired: "externalResourcesRequired",
          fill: "fill",
          fillopacity: "fillOpacity",
          "fill-opacity": "fillOpacity",
          fillrule: "fillRule",
          "fill-rule": "fillRule",
          filter: "filter",
          filterres: "filterRes",
          filterunits: "filterUnits",
          floodopacity: "floodOpacity",
          "flood-opacity": "floodOpacity",
          floodcolor: "floodColor",
          "flood-color": "floodColor",
          focusable: "focusable",
          fontfamily: "fontFamily",
          "font-family": "fontFamily",
          fontsize: "fontSize",
          "font-size": "fontSize",
          fontsizeadjust: "fontSizeAdjust",
          "font-size-adjust": "fontSizeAdjust",
          fontstretch: "fontStretch",
          "font-stretch": "fontStretch",
          fontstyle: "fontStyle",
          "font-style": "fontStyle",
          fontvariant: "fontVariant",
          "font-variant": "fontVariant",
          fontweight: "fontWeight",
          "font-weight": "fontWeight",
          format: "format",
          from: "from",
          fx: "fx",
          fy: "fy",
          g1: "g1",
          g2: "g2",
          glyphname: "glyphName",
          "glyph-name": "glyphName",
          glyphorientationhorizontal: "glyphOrientationHorizontal",
          "glyph-orientation-horizontal": "glyphOrientationHorizontal",
          glyphorientationvertical: "glyphOrientationVertical",
          "glyph-orientation-vertical": "glyphOrientationVertical",
          glyphref: "glyphRef",
          gradienttransform: "gradientTransform",
          gradientunits: "gradientUnits",
          hanging: "hanging",
          horizadvx: "horizAdvX",
          "horiz-adv-x": "horizAdvX",
          horizoriginx: "horizOriginX",
          "horiz-origin-x": "horizOriginX",
          ideographic: "ideographic",
          imagerendering: "imageRendering",
          "image-rendering": "imageRendering",
          in2: "in2",
          in: "in",
          inlist: "inlist",
          intercept: "intercept",
          k1: "k1",
          k2: "k2",
          k3: "k3",
          k4: "k4",
          k: "k",
          kernelmatrix: "kernelMatrix",
          kernelunitlength: "kernelUnitLength",
          kerning: "kerning",
          keypoints: "keyPoints",
          keysplines: "keySplines",
          keytimes: "keyTimes",
          lengthadjust: "lengthAdjust",
          letterspacing: "letterSpacing",
          "letter-spacing": "letterSpacing",
          lightingcolor: "lightingColor",
          "lighting-color": "lightingColor",
          limitingconeangle: "limitingConeAngle",
          local: "local",
          markerend: "markerEnd",
          "marker-end": "markerEnd",
          markerheight: "markerHeight",
          markermid: "markerMid",
          "marker-mid": "markerMid",
          markerstart: "markerStart",
          "marker-start": "markerStart",
          markerunits: "markerUnits",
          markerwidth: "markerWidth",
          mask: "mask",
          maskcontentunits: "maskContentUnits",
          maskunits: "maskUnits",
          mathematical: "mathematical",
          mode: "mode",
          numoctaves: "numOctaves",
          offset: "offset",
          opacity: "opacity",
          operator: "operator",
          order: "order",
          orient: "orient",
          orientation: "orientation",
          origin: "origin",
          overflow: "overflow",
          overlineposition: "overlinePosition",
          "overline-position": "overlinePosition",
          overlinethickness: "overlineThickness",
          "overline-thickness": "overlineThickness",
          paintorder: "paintOrder",
          "paint-order": "paintOrder",
          panose1: "panose1",
          "panose-1": "panose1",
          pathlength: "pathLength",
          patterncontentunits: "patternContentUnits",
          patterntransform: "patternTransform",
          patternunits: "patternUnits",
          pointerevents: "pointerEvents",
          "pointer-events": "pointerEvents",
          points: "points",
          pointsatx: "pointsAtX",
          pointsaty: "pointsAtY",
          pointsatz: "pointsAtZ",
          prefix: "prefix",
          preservealpha: "preserveAlpha",
          preserveaspectratio: "preserveAspectRatio",
          primitiveunits: "primitiveUnits",
          property: "property",
          r: "r",
          radius: "radius",
          refx: "refX",
          refy: "refY",
          renderingintent: "renderingIntent",
          "rendering-intent": "renderingIntent",
          repeatcount: "repeatCount",
          repeatdur: "repeatDur",
          requiredextensions: "requiredExtensions",
          requiredfeatures: "requiredFeatures",
          resource: "resource",
          restart: "restart",
          result: "result",
          results: "results",
          rotate: "rotate",
          rx: "rx",
          ry: "ry",
          scale: "scale",
          security: "security",
          seed: "seed",
          shaperendering: "shapeRendering",
          "shape-rendering": "shapeRendering",
          slope: "slope",
          spacing: "spacing",
          specularconstant: "specularConstant",
          specularexponent: "specularExponent",
          speed: "speed",
          spreadmethod: "spreadMethod",
          startoffset: "startOffset",
          stddeviation: "stdDeviation",
          stemh: "stemh",
          stemv: "stemv",
          stitchtiles: "stitchTiles",
          stopcolor: "stopColor",
          "stop-color": "stopColor",
          stopopacity: "stopOpacity",
          "stop-opacity": "stopOpacity",
          strikethroughposition: "strikethroughPosition",
          "strikethrough-position": "strikethroughPosition",
          strikethroughthickness: "strikethroughThickness",
          "strikethrough-thickness": "strikethroughThickness",
          string: "string",
          stroke: "stroke",
          strokedasharray: "strokeDasharray",
          "stroke-dasharray": "strokeDasharray",
          strokedashoffset: "strokeDashoffset",
          "stroke-dashoffset": "strokeDashoffset",
          strokelinecap: "strokeLinecap",
          "stroke-linecap": "strokeLinecap",
          strokelinejoin: "strokeLinejoin",
          "stroke-linejoin": "strokeLinejoin",
          strokemiterlimit: "strokeMiterlimit",
          "stroke-miterlimit": "strokeMiterlimit",
          strokewidth: "strokeWidth",
          "stroke-width": "strokeWidth",
          strokeopacity: "strokeOpacity",
          "stroke-opacity": "strokeOpacity",
          suppresscontenteditablewarning: "suppressContentEditableWarning",
          suppresshydrationwarning: "suppressHydrationWarning",
          surfacescale: "surfaceScale",
          systemlanguage: "systemLanguage",
          tablevalues: "tableValues",
          targetx: "targetX",
          targety: "targetY",
          textanchor: "textAnchor",
          "text-anchor": "textAnchor",
          textdecoration: "textDecoration",
          "text-decoration": "textDecoration",
          textlength: "textLength",
          textrendering: "textRendering",
          "text-rendering": "textRendering",
          to: "to",
          transform: "transform",
          typeof: "typeof",
          u1: "u1",
          u2: "u2",
          underlineposition: "underlinePosition",
          "underline-position": "underlinePosition",
          underlinethickness: "underlineThickness",
          "underline-thickness": "underlineThickness",
          unicode: "unicode",
          unicodebidi: "unicodeBidi",
          "unicode-bidi": "unicodeBidi",
          unicoderange: "unicodeRange",
          "unicode-range": "unicodeRange",
          unitsperem: "unitsPerEm",
          "units-per-em": "unitsPerEm",
          unselectable: "unselectable",
          valphabetic: "vAlphabetic",
          "v-alphabetic": "vAlphabetic",
          values: "values",
          vectoreffect: "vectorEffect",
          "vector-effect": "vectorEffect",
          version: "version",
          vertadvy: "vertAdvY",
          "vert-adv-y": "vertAdvY",
          vertoriginx: "vertOriginX",
          "vert-origin-x": "vertOriginX",
          vertoriginy: "vertOriginY",
          "vert-origin-y": "vertOriginY",
          vhanging: "vHanging",
          "v-hanging": "vHanging",
          videographic: "vIdeographic",
          "v-ideographic": "vIdeographic",
          viewbox: "viewBox",
          viewtarget: "viewTarget",
          visibility: "visibility",
          vmathematical: "vMathematical",
          "v-mathematical": "vMathematical",
          vocab: "vocab",
          widths: "widths",
          wordspacing: "wordSpacing",
          "word-spacing": "wordSpacing",
          writingmode: "writingMode",
          "writing-mode": "writingMode",
          x1: "x1",
          x2: "x2",
          x: "x",
          xchannelselector: "xChannelSelector",
          xheight: "xHeight",
          "x-height": "xHeight",
          xlinkactuate: "xlinkActuate",
          "xlink:actuate": "xlinkActuate",
          xlinkarcrole: "xlinkArcrole",
          "xlink:arcrole": "xlinkArcrole",
          xlinkhref: "xlinkHref",
          "xlink:href": "xlinkHref",
          xlinkrole: "xlinkRole",
          "xlink:role": "xlinkRole",
          xlinkshow: "xlinkShow",
          "xlink:show": "xlinkShow",
          xlinktitle: "xlinkTitle",
          "xlink:title": "xlinkTitle",
          xlinktype: "xlinkType",
          "xlink:type": "xlinkType",
          xmlbase: "xmlBase",
          "xml:base": "xmlBase",
          xmllang: "xmlLang",
          "xml:lang": "xmlLang",
          xmlns: "xmlns",
          "xml:space": "xmlSpace",
          xmlnsxlink: "xmlnsXlink",
          "xmlns:xlink": "xmlnsXlink",
          xmlspace: "xmlSpace",
          y1: "y1",
          y2: "y2",
          y: "y",
          ychannelselector: "yChannelSelector",
          z: "z",
          zoomandpan: "zoomAndPan"
        };
        const ariaProperties = {
          "aria-current": 0,
          // state
          "aria-description": 0,
          "aria-details": 0,
          "aria-disabled": 0,
          // state
          "aria-hidden": 0,
          // state
          "aria-invalid": 0,
          // state
          "aria-keyshortcuts": 0,
          "aria-label": 0,
          "aria-roledescription": 0,
          // Widget Attributes
          "aria-autocomplete": 0,
          "aria-checked": 0,
          "aria-expanded": 0,
          "aria-haspopup": 0,
          "aria-level": 0,
          "aria-modal": 0,
          "aria-multiline": 0,
          "aria-multiselectable": 0,
          "aria-orientation": 0,
          "aria-placeholder": 0,
          "aria-pressed": 0,
          "aria-readonly": 0,
          "aria-required": 0,
          "aria-selected": 0,
          "aria-sort": 0,
          "aria-valuemax": 0,
          "aria-valuemin": 0,
          "aria-valuenow": 0,
          "aria-valuetext": 0,
          // Live Region Attributes
          "aria-atomic": 0,
          "aria-busy": 0,
          "aria-live": 0,
          "aria-relevant": 0,
          // Drag-and-Drop Attributes
          "aria-dropeffect": 0,
          "aria-grabbed": 0,
          // Relationship Attributes
          "aria-activedescendant": 0,
          "aria-colcount": 0,
          "aria-colindex": 0,
          "aria-colspan": 0,
          "aria-controls": 0,
          "aria-describedby": 0,
          "aria-errormessage": 0,
          "aria-flowto": 0,
          "aria-labelledby": 0,
          "aria-owns": 0,
          "aria-posinset": 0,
          "aria-rowcount": 0,
          "aria-rowindex": 0,
          "aria-rowspan": 0,
          "aria-setsize": 0
        };
        const warnedProperties = {};
        const rARIA = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
        const rARIACamel = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
        function validateProperty(tagName, name) {
          {
            if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
              return true;
            }
            if (rARIACamel.test(name)) {
              const ariaName = "aria-" + name.slice(4).toLowerCase();
              const correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
              if (correctName == null) {
                error("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", name);
                warnedProperties[name] = true;
                return true;
              }
              if (name !== correctName) {
                error("Invalid ARIA attribute `%s`. Did you mean `%s`?", name, correctName);
                warnedProperties[name] = true;
                return true;
              }
            }
            if (rARIA.test(name)) {
              const lowerCasedName = name.toLowerCase();
              const standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
              if (standardName == null) {
                warnedProperties[name] = true;
                return false;
              }
              if (name !== standardName) {
                error("Unknown ARIA attribute `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties[name] = true;
                return true;
              }
            }
          }
          return true;
        }
        function warnInvalidARIAProps(type, props) {
          {
            const invalidProps = [];
            for (const key in props) {
              const isValid = validateProperty(type, key);
              if (!isValid) {
                invalidProps.push(key);
              }
            }
            const unknownPropString = invalidProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (invalidProps.length === 1) {
              error("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            } else if (invalidProps.length > 1) {
              error("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", unknownPropString, type);
            }
          }
        }
        function validateProperties(type, props) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnInvalidARIAProps(type, props);
        }
        let didWarnValueNull = false;
        function validateProperties$1(type, props) {
          {
            if (type !== "input" && type !== "textarea" && type !== "select") {
              return;
            }
            if (props != null && props.value === null && !didWarnValueNull) {
              didWarnValueNull = true;
              if (type === "select" && props.multiple) {
                error("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", type);
              } else {
                error("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", type);
              }
            }
          }
        }
        let validateProperty$1 = function() {
        };
        {
          const warnedProperties$1 = {};
          const EVENT_NAME_REGEX = /^on./;
          const INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
          const rARIA$1 = new RegExp("^(aria)-[" + ATTRIBUTE_NAME_CHAR + "]*$");
          const rARIACamel$1 = new RegExp("^(aria)[A-Z][" + ATTRIBUTE_NAME_CHAR + "]*$");
          validateProperty$1 = function(tagName, name, value, eventRegistry) {
            if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
              return true;
            }
            const lowerCasedName = name.toLowerCase();
            if (lowerCasedName === "onfocusin" || lowerCasedName === "onfocusout") {
              error("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (eventRegistry != null) {
              const registrationNameDependencies2 = eventRegistry.registrationNameDependencies, possibleRegistrationNames2 = eventRegistry.possibleRegistrationNames;
              if (registrationNameDependencies2.hasOwnProperty(name)) {
                return true;
              }
              const registrationName = possibleRegistrationNames2.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames2[lowerCasedName] : null;
              if (registrationName != null) {
                error("Invalid event handler property `%s`. Did you mean `%s`?", name, registrationName);
                warnedProperties$1[name] = true;
                return true;
              }
              if (EVENT_NAME_REGEX.test(name)) {
                error("Unknown event handler property `%s`. It will be ignored.", name);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (EVENT_NAME_REGEX.test(name)) {
              if (INVALID_EVENT_NAME_REGEX.test(name)) {
                error("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
              return true;
            }
            if (lowerCasedName === "innerhtml") {
              error("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "aria") {
              error("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead.");
              warnedProperties$1[name] = true;
              return true;
            }
            if (lowerCasedName === "is" && value !== null && value !== void 0 && typeof value !== "string") {
              error("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof value);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "number" && isNaN(value)) {
              error("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", name);
              warnedProperties$1[name] = true;
              return true;
            }
            const propertyInfo = getPropertyInfo(name);
            const isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;
            if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
              const standardName = possibleStandardNames[lowerCasedName];
              if (standardName !== name) {
                error("Invalid DOM property `%s`. Did you mean `%s`?", name, standardName);
                warnedProperties$1[name] = true;
                return true;
              }
            } else if (!isReserved && name !== lowerCasedName) {
              error("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", name, lowerCasedName);
              warnedProperties$1[name] = true;
              return true;
            }
            if (typeof value === "boolean" && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              if (value) {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', value, name, name, value, name);
              } else {
                error('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
              }
              warnedProperties$1[name] = true;
              return true;
            }
            if (isReserved) {
              return true;
            }
            if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
              warnedProperties$1[name] = true;
              return false;
            }
            if ((value === "false" || value === "true") && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
              error("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", value, name, value === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
              warnedProperties$1[name] = true;
              return true;
            }
            return true;
          };
        }
        const warnUnknownProperties = function(type, props, eventRegistry) {
          {
            const unknownProps = [];
            for (const key in props) {
              const isValid = validateProperty$1(type, key, props[key], eventRegistry);
              if (!isValid) {
                unknownProps.push(key);
              }
            }
            const unknownPropString = unknownProps.map(function(prop) {
              return "`" + prop + "`";
            }).join(", ");
            if (unknownProps.length === 1) {
              error("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            } else if (unknownProps.length > 1) {
              error("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", unknownPropString, type);
            }
          }
        };
        function validateProperties$2(type, props, eventRegistry) {
          if (isCustomComponent(type, props)) {
            return;
          }
          warnUnknownProperties(type, props, eventRegistry);
        }
        const IS_EVENT_HANDLE_NON_MANAGED_NODE = 1;
        const IS_NON_DELEGATED = 1 << 1;
        const IS_CAPTURE_PHASE = 1 << 2;
        const SHOULD_NOT_PROCESS_POLYFILL_EVENT_PLUGINS = IS_EVENT_HANDLE_NON_MANAGED_NODE | IS_NON_DELEGATED | IS_CAPTURE_PHASE;
        let currentReplayingEvent = null;
        function setReplayingEvent(event) {
          {
            if (currentReplayingEvent !== null) {
              error("Expected currently replaying event to be null. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
          currentReplayingEvent = event;
        }
        function resetReplayingEvent() {
          {
            if (currentReplayingEvent === null) {
              error("Expected currently replaying event to not be null. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
          currentReplayingEvent = null;
        }
        function isReplayingEvent(event) {
          return event === currentReplayingEvent;
        }
        function getEventTarget(nativeEvent) {
          let target = nativeEvent.target || nativeEvent.srcElement || window;
          if (target.correspondingUseElement) {
            target = target.correspondingUseElement;
          }
          return target.nodeType === TEXT_NODE ? target.parentNode : target;
        }
        let restoreImpl = null;
        let restoreTarget = null;
        let restoreQueue = null;
        function restoreStateOfTarget(target) {
          const internalInstance = getInstanceFromNode(target);
          if (!internalInstance) {
            return;
          }
          if (typeof restoreImpl !== "function") {
            throw new Error("setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.");
          }
          const stateNode = internalInstance.stateNode;
          if (stateNode) {
            const _props = getFiberCurrentPropsFromNode(stateNode);
            restoreImpl(internalInstance.stateNode, internalInstance.type, _props);
          }
        }
        function setRestoreImplementation(impl) {
          restoreImpl = impl;
        }
        function enqueueStateRestore(target) {
          if (restoreTarget) {
            if (restoreQueue) {
              restoreQueue.push(target);
            } else {
              restoreQueue = [target];
            }
          } else {
            restoreTarget = target;
          }
        }
        function needsStateRestore() {
          return restoreTarget !== null || restoreQueue !== null;
        }
        function restoreStateIfNeeded() {
          if (!restoreTarget) {
            return;
          }
          const target = restoreTarget;
          const queuedTargets = restoreQueue;
          restoreTarget = null;
          restoreQueue = null;
          restoreStateOfTarget(target);
          if (queuedTargets) {
            for (let i = 0; i < queuedTargets.length; i++) {
              restoreStateOfTarget(queuedTargets[i]);
            }
          }
        }
        let batchedUpdatesImpl = function(fn, bookkeeping) {
          return fn(bookkeeping);
        };
        let flushSyncImpl = function() {
        };
        let isInsideEventHandler = false;
        function finishEventHandler() {
          const controlledComponentsHavePendingUpdates = needsStateRestore();
          if (controlledComponentsHavePendingUpdates) {
            flushSyncImpl();
            restoreStateIfNeeded();
          }
        }
        function batchedUpdates(fn, a, b) {
          if (isInsideEventHandler) {
            return fn(a, b);
          }
          isInsideEventHandler = true;
          try {
            return batchedUpdatesImpl(fn, a, b);
          } finally {
            isInsideEventHandler = false;
            finishEventHandler();
          }
        }
        function setBatchingImplementation(_batchedUpdatesImpl, _discreteUpdatesImpl, _flushSyncImpl) {
          batchedUpdatesImpl = _batchedUpdatesImpl;
          flushSyncImpl = _flushSyncImpl;
        }
        function isInteractive(tag) {
          return tag === "button" || tag === "input" || tag === "select" || tag === "textarea";
        }
        function shouldPreventMouseEvent(name, type, props) {
          switch (name) {
            case "onClick":
            case "onClickCapture":
            case "onDoubleClick":
            case "onDoubleClickCapture":
            case "onMouseDown":
            case "onMouseDownCapture":
            case "onMouseMove":
            case "onMouseMoveCapture":
            case "onMouseUp":
            case "onMouseUpCapture":
            case "onMouseEnter":
              return !!(props.disabled && isInteractive(type));
            default:
              return false;
          }
        }
        function getListener(inst, registrationName) {
          const stateNode = inst.stateNode;
          if (stateNode === null) {
            return null;
          }
          const props = getFiberCurrentPropsFromNode(stateNode);
          if (props === null) {
            return null;
          }
          const listener = props[registrationName];
          if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
            return null;
          }
          if (listener && typeof listener !== "function") {
            throw new Error("Expected `" + registrationName + "` listener to be a function, instead got a value of `" + typeof listener + "` type.");
          }
          return listener;
        }
        let passiveBrowserEventsSupported = false;
        if (canUseDOM) {
          try {
            const options = {};
            Object.defineProperty(options, "passive", {
              get: function() {
                passiveBrowserEventsSupported = true;
              }
            });
            window.addEventListener("test", options, options);
            window.removeEventListener("test", options, options);
          } catch (e) {
            passiveBrowserEventsSupported = false;
          }
        }
        function invokeGuardedCallbackProd(name, func, context, a, b, c, d, e, f) {
          const funcArgs = Array.prototype.slice.call(arguments, 3);
          try {
            func.apply(context, funcArgs);
          } catch (error2) {
            this.onError(error2);
          }
        }
        let invokeGuardedCallbackImpl = invokeGuardedCallbackProd;
        {
          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof document !== "undefined" && typeof document.createEvent === "function") {
            const fakeNode = document.createElement("react");
            invokeGuardedCallbackImpl = function invokeGuardedCallbackDev(name, func, context, a, b, c, d, e, f) {
              if (typeof document === "undefined" || document === null) {
                throw new Error("The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.");
              }
              const evt = document.createEvent("Event");
              let didCall = false;
              let didError = true;
              const windowEvent = window.event;
              const windowEventDescriptor = Object.getOwnPropertyDescriptor(window, "event");
              function restoreAfterDispatch() {
                fakeNode.removeEventListener(evtType, callCallback2, false);
                if (typeof window.event !== "undefined" && window.hasOwnProperty("event")) {
                  window.event = windowEvent;
                }
              }
              const funcArgs = Array.prototype.slice.call(arguments, 3);
              function callCallback2() {
                didCall = true;
                restoreAfterDispatch();
                func.apply(context, funcArgs);
                didError = false;
              }
              let error2;
              let didSetError = false;
              let isCrossOriginError = false;
              function handleWindowError(event) {
                error2 = event.error;
                didSetError = true;
                if (error2 === null && event.colno === 0 && event.lineno === 0) {
                  isCrossOriginError = true;
                }
                if (event.defaultPrevented) {
                  if (error2 != null && typeof error2 === "object") {
                    try {
                      error2._suppressLogging = true;
                    } catch (inner) {
                    }
                  }
                }
              }
              var evtType = "react-" + (name ? name : "invokeguardedcallback");
              window.addEventListener("error", handleWindowError);
              fakeNode.addEventListener(evtType, callCallback2, false);
              evt.initEvent(evtType, false, false);
              fakeNode.dispatchEvent(evt);
              if (windowEventDescriptor) {
                Object.defineProperty(window, "event", windowEventDescriptor);
              }
              if (didCall && didError) {
                if (!didSetError) {
                  error2 = new Error(`An error was thrown inside one of your components, but React doesn't know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It's possible that these don't work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.`);
                } else if (isCrossOriginError) {
                  error2 = new Error("A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://reactjs.org/link/crossorigin-error for more information.");
                }
                this.onError(error2);
              }
              window.removeEventListener("error", handleWindowError);
              if (!didCall) {
                restoreAfterDispatch();
                return invokeGuardedCallbackProd.apply(this, arguments);
              }
            };
          }
        }
        const invokeGuardedCallbackImpl$1 = invokeGuardedCallbackImpl;
        let hasError = false;
        let caughtError = null;
        let hasRethrowError = false;
        let rethrowError = null;
        const reporter = {
          onError: function(error2) {
            hasError = true;
            caughtError = error2;
          }
        };
        function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
          hasError = false;
          caughtError = null;
          invokeGuardedCallbackImpl$1.apply(reporter, arguments);
        }
        function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
          invokeGuardedCallback.apply(this, arguments);
          if (hasError) {
            const error2 = clearCaughtError();
            if (!hasRethrowError) {
              hasRethrowError = true;
              rethrowError = error2;
            }
          }
        }
        function rethrowCaughtError() {
          if (hasRethrowError) {
            const error2 = rethrowError;
            hasRethrowError = false;
            rethrowError = null;
            throw error2;
          }
        }
        function hasCaughtError() {
          return hasError;
        }
        function clearCaughtError() {
          if (hasError) {
            const error2 = caughtError;
            hasError = false;
            caughtError = null;
            return error2;
          } else {
            throw new Error("clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
        function get(key) {
          return key._reactInternals;
        }
        function has(key) {
          return key._reactInternals !== void 0;
        }
        function set(key, value) {
          key._reactInternals = value;
        }
        const NoFlags = (
          /*                      */
          0
        );
        const PerformedWork = (
          /*                */
          1
        );
        const Placement = (
          /*                    */
          2
        );
        const Update = (
          /*                       */
          4
        );
        const ChildDeletion = (
          /*                */
          16
        );
        const ContentReset = (
          /*                 */
          32
        );
        const Callback = (
          /*                     */
          64
        );
        const DidCapture = (
          /*                   */
          128
        );
        const ForceClientRender = (
          /*            */
          256
        );
        const Ref = (
          /*                          */
          512
        );
        const Snapshot = (
          /*                     */
          1024
        );
        const Passive = (
          /*                      */
          2048
        );
        const Hydrating = (
          /*                    */
          4096
        );
        const Visibility = (
          /*                   */
          8192
        );
        const StoreConsistency = (
          /*             */
          16384
        );
        const LifecycleEffectMask = Passive | Update | Callback | Ref | Snapshot | StoreConsistency;
        const HostEffectMask = (
          /*               */
          32767
        );
        const Incomplete = (
          /*                   */
          32768
        );
        const ShouldCapture = (
          /*                */
          65536
        );
        const ForceUpdateForLegacySuspense = (
          /* */
          131072
        );
        const Forked = (
          /*                       */
          1048576
        );
        const RefStatic = (
          /*                    */
          2097152
        );
        const LayoutStatic = (
          /*                 */
          4194304
        );
        const PassiveStatic = (
          /*                */
          8388608
        );
        const MountLayoutDev = (
          /*               */
          16777216
        );
        const MountPassiveDev = (
          /*              */
          33554432
        );
        const BeforeMutationMask = (
          // TODO: Remove Update flag from before mutation phase by re-landing Visibility
          // flag logic (see #20043)
          Update | Snapshot | 0
        );
        const MutationMask = Placement | Update | ChildDeletion | ContentReset | Ref | Hydrating | Visibility;
        const LayoutMask = Update | Callback | Ref | Visibility;
        const PassiveMask = Passive | ChildDeletion;
        const StaticMask = LayoutStatic | PassiveStatic | RefStatic;
        const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
        function getNearestMountedFiber(fiber) {
          let node = fiber;
          let nearestMounted = fiber;
          if (!fiber.alternate) {
            let nextNode = node;
            do {
              node = nextNode;
              if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
                nearestMounted = node.return;
              }
              nextNode = node.return;
            } while (nextNode);
          } else {
            while (node.return) {
              node = node.return;
            }
          }
          if (node.tag === HostRoot) {
            return nearestMounted;
          }
          return null;
        }
        function getSuspenseInstanceFromFiber(fiber) {
          if (fiber.tag === SuspenseComponent) {
            let suspenseState = fiber.memoizedState;
            if (suspenseState === null) {
              const current2 = fiber.alternate;
              if (current2 !== null) {
                suspenseState = current2.memoizedState;
              }
            }
            if (suspenseState !== null) {
              return suspenseState.dehydrated;
            }
          }
          return null;
        }
        function getContainerFromFiber(fiber) {
          return fiber.tag === HostRoot ? fiber.stateNode.containerInfo : null;
        }
        function isFiberMounted(fiber) {
          return getNearestMountedFiber(fiber) === fiber;
        }
        function isMounted(component) {
          {
            const owner = ReactCurrentOwner.current;
            if (owner !== null && owner.tag === ClassComponent) {
              const ownerFiber = owner;
              const instance = ownerFiber.stateNode;
              if (!instance._warnedAboutRefsInRender) {
                error("%s is accessing isMounted inside its render() function. render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", getComponentNameFromFiber(ownerFiber) || "A component");
              }
              instance._warnedAboutRefsInRender = true;
            }
          }
          const fiber = get(component);
          if (!fiber) {
            return false;
          }
          return getNearestMountedFiber(fiber) === fiber;
        }
        function assertIsMounted(fiber) {
          if (getNearestMountedFiber(fiber) !== fiber) {
            throw new Error("Unable to find node on an unmounted component.");
          }
        }
        function findCurrentFiberUsingSlowPath(fiber) {
          const alternate = fiber.alternate;
          if (!alternate) {
            const nearestMounted = getNearestMountedFiber(fiber);
            if (nearestMounted === null) {
              throw new Error("Unable to find node on an unmounted component.");
            }
            if (nearestMounted !== fiber) {
              return null;
            }
            return fiber;
          }
          let a = fiber;
          let b = alternate;
          while (true) {
            const parentA = a.return;
            if (parentA === null) {
              break;
            }
            const parentB = parentA.alternate;
            if (parentB === null) {
              const nextParent = parentA.return;
              if (nextParent !== null) {
                a = b = nextParent;
                continue;
              }
              break;
            }
            if (parentA.child === parentB.child) {
              let child = parentA.child;
              while (child) {
                if (child === a) {
                  assertIsMounted(parentA);
                  return fiber;
                }
                if (child === b) {
                  assertIsMounted(parentA);
                  return alternate;
                }
                child = child.sibling;
              }
              throw new Error("Unable to find node on an unmounted component.");
            }
            if (a.return !== b.return) {
              a = parentA;
              b = parentB;
            } else {
              let didFindChild = false;
              let _child = parentA.child;
              while (_child) {
                if (_child === a) {
                  didFindChild = true;
                  a = parentA;
                  b = parentB;
                  break;
                }
                if (_child === b) {
                  didFindChild = true;
                  b = parentA;
                  a = parentB;
                  break;
                }
                _child = _child.sibling;
              }
              if (!didFindChild) {
                _child = parentB.child;
                while (_child) {
                  if (_child === a) {
                    didFindChild = true;
                    a = parentB;
                    b = parentA;
                    break;
                  }
                  if (_child === b) {
                    didFindChild = true;
                    b = parentB;
                    a = parentA;
                    break;
                  }
                  _child = _child.sibling;
                }
                if (!didFindChild) {
                  throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
                }
              }
            }
            if (a.alternate !== b) {
              throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
          if (a.tag !== HostRoot) {
            throw new Error("Unable to find node on an unmounted component.");
          }
          if (a.stateNode.current === a) {
            return fiber;
          }
          return alternate;
        }
        function findCurrentHostFiber(parent) {
          const currentParent = findCurrentFiberUsingSlowPath(parent);
          return currentParent !== null ? findCurrentHostFiberImpl(currentParent) : null;
        }
        function findCurrentHostFiberImpl(node) {
          if (node.tag === HostComponent || node.tag === HostText) {
            return node;
          }
          let child = node.child;
          while (child !== null) {
            const match = findCurrentHostFiberImpl(child);
            if (match !== null) {
              return match;
            }
            child = child.sibling;
          }
          return null;
        }
        function findCurrentHostFiberWithNoPortals(parent) {
          const currentParent = findCurrentFiberUsingSlowPath(parent);
          return currentParent !== null ? findCurrentHostFiberWithNoPortalsImpl(currentParent) : null;
        }
        function findCurrentHostFiberWithNoPortalsImpl(node) {
          if (node.tag === HostComponent || node.tag === HostText) {
            return node;
          }
          let child = node.child;
          while (child !== null) {
            if (child.tag !== HostPortal) {
              const match = findCurrentHostFiberWithNoPortalsImpl(child);
              if (match !== null) {
                return match;
              }
            }
            child = child.sibling;
          }
          return null;
        }
        const scheduleCallback = Scheduler.unstable_scheduleCallback;
        const cancelCallback = Scheduler.unstable_cancelCallback;
        const shouldYield = Scheduler.unstable_shouldYield;
        const requestPaint = Scheduler.unstable_requestPaint;
        const now = Scheduler.unstable_now;
        const getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
        const ImmediatePriority = Scheduler.unstable_ImmediatePriority;
        const UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
        const NormalPriority = Scheduler.unstable_NormalPriority;
        const LowPriority = Scheduler.unstable_LowPriority;
        const IdlePriority = Scheduler.unstable_IdlePriority;
        const unstable_yieldValue = Scheduler.unstable_yieldValue;
        const unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
        let rendererID = null;
        let injectedHook = null;
        let injectedProfilingHooks = null;
        let hasLoggedError = false;
        const isDevToolsPresent = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined";
        function injectInternals(internals) {
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined") {
            return false;
          }
          const hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (hook.isDisabled) {
            return true;
          }
          if (!hook.supportsFiber) {
            {
              error("The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://reactjs.org/link/react-devtools");
            }
            return true;
          }
          try {
            if (enableSchedulingProfiler) {
              internals = assign({}, internals, {
                getLaneLabelMap,
                injectProfilingHooks
              });
            }
            rendererID = hook.inject(internals);
            injectedHook = hook;
          } catch (err) {
            {
              error("React instrumentation encountered an error: %s.", err);
            }
          }
          if (hook.checkDCE) {
            return true;
          } else {
            return false;
          }
        }
        function onScheduleRoot(root2, children) {
          {
            if (injectedHook && typeof injectedHook.onScheduleFiberRoot === "function") {
              try {
                injectedHook.onScheduleFiberRoot(rendererID, root2, children);
              } catch (err) {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error("React instrumentation encountered an error: %s", err);
                }
              }
            }
          }
        }
        function onCommitRoot(root2, eventPriority) {
          if (injectedHook && typeof injectedHook.onCommitFiberRoot === "function") {
            try {
              const didError = (root2.current.flags & DidCapture) === DidCapture;
              if (enableProfilerTimer) {
                let schedulerPriority;
                switch (eventPriority) {
                  case DiscreteEventPriority:
                    schedulerPriority = ImmediatePriority;
                    break;
                  case ContinuousEventPriority:
                    schedulerPriority = UserBlockingPriority;
                    break;
                  case DefaultEventPriority:
                    schedulerPriority = NormalPriority;
                    break;
                  case IdleEventPriority:
                    schedulerPriority = IdlePriority;
                    break;
                  default:
                    schedulerPriority = NormalPriority;
                    break;
                }
                injectedHook.onCommitFiberRoot(rendererID, root2, schedulerPriority, didError);
              } else {
                injectedHook.onCommitFiberRoot(rendererID, root2, void 0, didError);
              }
            } catch (err) {
              {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error("React instrumentation encountered an error: %s", err);
                }
              }
            }
          }
        }
        function onPostCommitRoot(root2) {
          if (injectedHook && typeof injectedHook.onPostCommitFiberRoot === "function") {
            try {
              injectedHook.onPostCommitFiberRoot(rendererID, root2);
            } catch (err) {
              {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error("React instrumentation encountered an error: %s", err);
                }
              }
            }
          }
        }
        function onCommitUnmount(fiber) {
          if (injectedHook && typeof injectedHook.onCommitFiberUnmount === "function") {
            try {
              injectedHook.onCommitFiberUnmount(rendererID, fiber);
            } catch (err) {
              {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error("React instrumentation encountered an error: %s", err);
                }
              }
            }
          }
        }
        function setIsStrictModeForDevtools(newIsStrictMode) {
          {
            if (typeof unstable_yieldValue === "function") {
              unstable_setDisableYieldValue(newIsStrictMode);
              setSuppressWarning(newIsStrictMode);
            }
            if (injectedHook && typeof injectedHook.setStrictMode === "function") {
              try {
                injectedHook.setStrictMode(rendererID, newIsStrictMode);
              } catch (err) {
                {
                  if (!hasLoggedError) {
                    hasLoggedError = true;
                    error("React instrumentation encountered an error: %s", err);
                  }
                }
              }
            }
          }
        }
        function injectProfilingHooks(profilingHooks) {
          injectedProfilingHooks = profilingHooks;
        }
        function getLaneLabelMap() {
          {
            const map = /* @__PURE__ */ new Map();
            let lane = 1;
            for (let index2 = 0; index2 < TotalLanes; index2++) {
              const label = getLabelForLane(lane);
              map.set(lane, label);
              lane *= 2;
            }
            return map;
          }
        }
        function markCommitStarted(lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markCommitStarted === "function") {
              injectedProfilingHooks.markCommitStarted(lanes);
            }
          }
        }
        function markCommitStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markCommitStopped === "function") {
              injectedProfilingHooks.markCommitStopped();
            }
          }
        }
        function markComponentRenderStarted(fiber) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentRenderStarted === "function") {
              injectedProfilingHooks.markComponentRenderStarted(fiber);
            }
          }
        }
        function markComponentRenderStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentRenderStopped === "function") {
              injectedProfilingHooks.markComponentRenderStopped();
            }
          }
        }
        function markComponentPassiveEffectMountStarted(fiber) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectMountStarted === "function") {
              injectedProfilingHooks.markComponentPassiveEffectMountStarted(fiber);
            }
          }
        }
        function markComponentPassiveEffectMountStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectMountStopped === "function") {
              injectedProfilingHooks.markComponentPassiveEffectMountStopped();
            }
          }
        }
        function markComponentPassiveEffectUnmountStarted(fiber) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectUnmountStarted === "function") {
              injectedProfilingHooks.markComponentPassiveEffectUnmountStarted(fiber);
            }
          }
        }
        function markComponentPassiveEffectUnmountStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectUnmountStopped === "function") {
              injectedProfilingHooks.markComponentPassiveEffectUnmountStopped();
            }
          }
        }
        function markComponentLayoutEffectMountStarted(fiber) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectMountStarted === "function") {
              injectedProfilingHooks.markComponentLayoutEffectMountStarted(fiber);
            }
          }
        }
        function markComponentLayoutEffectMountStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectMountStopped === "function") {
              injectedProfilingHooks.markComponentLayoutEffectMountStopped();
            }
          }
        }
        function markComponentLayoutEffectUnmountStarted(fiber) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectUnmountStarted === "function") {
              injectedProfilingHooks.markComponentLayoutEffectUnmountStarted(fiber);
            }
          }
        }
        function markComponentLayoutEffectUnmountStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectUnmountStopped === "function") {
              injectedProfilingHooks.markComponentLayoutEffectUnmountStopped();
            }
          }
        }
        function markComponentErrored(fiber, thrownValue, lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentErrored === "function") {
              injectedProfilingHooks.markComponentErrored(fiber, thrownValue, lanes);
            }
          }
        }
        function markComponentSuspended(fiber, wakeable, lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentSuspended === "function") {
              injectedProfilingHooks.markComponentSuspended(fiber, wakeable, lanes);
            }
          }
        }
        function markLayoutEffectsStarted(lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markLayoutEffectsStarted === "function") {
              injectedProfilingHooks.markLayoutEffectsStarted(lanes);
            }
          }
        }
        function markLayoutEffectsStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markLayoutEffectsStopped === "function") {
              injectedProfilingHooks.markLayoutEffectsStopped();
            }
          }
        }
        function markPassiveEffectsStarted(lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markPassiveEffectsStarted === "function") {
              injectedProfilingHooks.markPassiveEffectsStarted(lanes);
            }
          }
        }
        function markPassiveEffectsStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markPassiveEffectsStopped === "function") {
              injectedProfilingHooks.markPassiveEffectsStopped();
            }
          }
        }
        function markRenderStarted(lanes) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderStarted === "function") {
              injectedProfilingHooks.markRenderStarted(lanes);
            }
          }
        }
        function markRenderYielded() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderYielded === "function") {
              injectedProfilingHooks.markRenderYielded();
            }
          }
        }
        function markRenderStopped() {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderStopped === "function") {
              injectedProfilingHooks.markRenderStopped();
            }
          }
        }
        function markRenderScheduled(lane) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderScheduled === "function") {
              injectedProfilingHooks.markRenderScheduled(lane);
            }
          }
        }
        function markForceUpdateScheduled(fiber, lane) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markForceUpdateScheduled === "function") {
              injectedProfilingHooks.markForceUpdateScheduled(fiber, lane);
            }
          }
        }
        function markStateUpdateScheduled(fiber, lane) {
          {
            if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markStateUpdateScheduled === "function") {
              injectedProfilingHooks.markStateUpdateScheduled(fiber, lane);
            }
          }
        }
        const NoMode = (
          /*                         */
          0
        );
        const ConcurrentMode = (
          /*                 */
          1
        );
        const ProfileMode = (
          /*                    */
          2
        );
        const StrictLegacyMode = (
          /*               */
          8
        );
        const StrictEffectsMode = (
          /*              */
          16
        );
        const clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
        const log = Math.log;
        const LN2 = Math.LN2;
        function clz32Fallback(x) {
          const asUint = x >>> 0;
          if (asUint === 0) {
            return 32;
          }
          return 31 - (log(asUint) / LN2 | 0) | 0;
        }
        var TotalLanes = 31;
        const NoLanes = (
          /*                        */
          0
        );
        const NoLane = (
          /*                          */
          0
        );
        const SyncLane = (
          /*                        */
          1
        );
        const InputContinuousHydrationLane = (
          /*    */
          2
        );
        const InputContinuousLane = (
          /*             */
          4
        );
        const DefaultHydrationLane = (
          /*            */
          8
        );
        const DefaultLane = (
          /*                     */
          16
        );
        const TransitionHydrationLane = (
          /*                */
          32
        );
        const TransitionLanes = (
          /*                       */
          4194240
        );
        const TransitionLane1 = (
          /*                        */
          64
        );
        const TransitionLane2 = (
          /*                        */
          128
        );
        const TransitionLane3 = (
          /*                        */
          256
        );
        const TransitionLane4 = (
          /*                        */
          512
        );
        const TransitionLane5 = (
          /*                        */
          1024
        );
        const TransitionLane6 = (
          /*                        */
          2048
        );
        const TransitionLane7 = (
          /*                        */
          4096
        );
        const TransitionLane8 = (
          /*                        */
          8192
        );
        const TransitionLane9 = (
          /*                        */
          16384
        );
        const TransitionLane10 = (
          /*                       */
          32768
        );
        const TransitionLane11 = (
          /*                       */
          65536
        );
        const TransitionLane12 = (
          /*                       */
          131072
        );
        const TransitionLane13 = (
          /*                       */
          262144
        );
        const TransitionLane14 = (
          /*                       */
          524288
        );
        const TransitionLane15 = (
          /*                       */
          1048576
        );
        const TransitionLane16 = (
          /*                       */
          2097152
        );
        const RetryLanes = (
          /*                            */
          130023424
        );
        const RetryLane1 = (
          /*                             */
          4194304
        );
        const RetryLane2 = (
          /*                             */
          8388608
        );
        const RetryLane3 = (
          /*                             */
          16777216
        );
        const RetryLane4 = (
          /*                             */
          33554432
        );
        const RetryLane5 = (
          /*                             */
          67108864
        );
        const SomeRetryLane = RetryLane1;
        const SelectiveHydrationLane = (
          /*          */
          134217728
        );
        const NonIdleLanes = (
          /*                          */
          268435455
        );
        const IdleHydrationLane = (
          /*               */
          268435456
        );
        const IdleLane = (
          /*                        */
          536870912
        );
        const OffscreenLane = (
          /*                   */
          1073741824
        );
        function getLabelForLane(lane) {
          {
            if (lane & SyncLane) {
              return "Sync";
            }
            if (lane & InputContinuousHydrationLane) {
              return "InputContinuousHydration";
            }
            if (lane & InputContinuousLane) {
              return "InputContinuous";
            }
            if (lane & DefaultHydrationLane) {
              return "DefaultHydration";
            }
            if (lane & DefaultLane) {
              return "Default";
            }
            if (lane & TransitionHydrationLane) {
              return "TransitionHydration";
            }
            if (lane & TransitionLanes) {
              return "Transition";
            }
            if (lane & RetryLanes) {
              return "Retry";
            }
            if (lane & SelectiveHydrationLane) {
              return "SelectiveHydration";
            }
            if (lane & IdleHydrationLane) {
              return "IdleHydration";
            }
            if (lane & IdleLane) {
              return "Idle";
            }
            if (lane & OffscreenLane) {
              return "Offscreen";
            }
          }
        }
        const NoTimestamp = -1;
        let nextTransitionLane = TransitionLane1;
        let nextRetryLane = RetryLane1;
        function getHighestPriorityLanes(lanes) {
          switch (getHighestPriorityLane(lanes)) {
            case SyncLane:
              return SyncLane;
            case InputContinuousHydrationLane:
              return InputContinuousHydrationLane;
            case InputContinuousLane:
              return InputContinuousLane;
            case DefaultHydrationLane:
              return DefaultHydrationLane;
            case DefaultLane:
              return DefaultLane;
            case TransitionHydrationLane:
              return TransitionHydrationLane;
            case TransitionLane1:
            case TransitionLane2:
            case TransitionLane3:
            case TransitionLane4:
            case TransitionLane5:
            case TransitionLane6:
            case TransitionLane7:
            case TransitionLane8:
            case TransitionLane9:
            case TransitionLane10:
            case TransitionLane11:
            case TransitionLane12:
            case TransitionLane13:
            case TransitionLane14:
            case TransitionLane15:
            case TransitionLane16:
              return lanes & TransitionLanes;
            case RetryLane1:
            case RetryLane2:
            case RetryLane3:
            case RetryLane4:
            case RetryLane5:
              return lanes & RetryLanes;
            case SelectiveHydrationLane:
              return SelectiveHydrationLane;
            case IdleHydrationLane:
              return IdleHydrationLane;
            case IdleLane:
              return IdleLane;
            case OffscreenLane:
              return OffscreenLane;
            default:
              {
                error("Should have found matching lanes. This is a bug in React.");
              }
              return lanes;
          }
        }
        function getNextLanes(root2, wipLanes) {
          const pendingLanes = root2.pendingLanes;
          if (pendingLanes === NoLanes) {
            return NoLanes;
          }
          let nextLanes = NoLanes;
          const suspendedLanes = root2.suspendedLanes;
          const pingedLanes = root2.pingedLanes;
          const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
          if (nonIdlePendingLanes !== NoLanes) {
            const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
            if (nonIdleUnblockedLanes !== NoLanes) {
              nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
            } else {
              const nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;
              if (nonIdlePingedLanes !== NoLanes) {
                nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
              }
            }
          } else {
            const unblockedLanes = pendingLanes & ~suspendedLanes;
            if (unblockedLanes !== NoLanes) {
              nextLanes = getHighestPriorityLanes(unblockedLanes);
            } else {
              if (pingedLanes !== NoLanes) {
                nextLanes = getHighestPriorityLanes(pingedLanes);
              }
            }
          }
          if (nextLanes === NoLanes) {
            return NoLanes;
          }
          if (wipLanes !== NoLanes && wipLanes !== nextLanes && // If we already suspended with a delay, then interrupting is fine. Don't
          // bother waiting until the root is complete.
          (wipLanes & suspendedLanes) === NoLanes) {
            const nextLane = getHighestPriorityLane(nextLanes);
            const wipLane = getHighestPriorityLane(wipLanes);
            if (
              // Tests whether the next lane is equal or lower priority than the wip
              // one. This works because the bits decrease in priority as you go left.
              nextLane >= wipLane || // Default priority updates should not interrupt transition updates. The
              // only difference between default updates and transition updates is that
              // default updates do not support refresh transitions.
              nextLane === DefaultLane && (wipLane & TransitionLanes) !== NoLanes
            ) {
              return wipLanes;
            }
          }
          if ((nextLanes & InputContinuousLane) !== NoLanes) {
            nextLanes |= pendingLanes & DefaultLane;
          }
          const entangledLanes = root2.entangledLanes;
          if (entangledLanes !== NoLanes) {
            const entanglements = root2.entanglements;
            let lanes = nextLanes & entangledLanes;
            while (lanes > 0) {
              const index2 = pickArbitraryLaneIndex(lanes);
              const lane = 1 << index2;
              nextLanes |= entanglements[index2];
              lanes &= ~lane;
            }
          }
          return nextLanes;
        }
        function getMostRecentEventTime(root2, lanes) {
          const eventTimes = root2.eventTimes;
          let mostRecentEventTime = NoTimestamp;
          while (lanes > 0) {
            const index2 = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index2;
            const eventTime = eventTimes[index2];
            if (eventTime > mostRecentEventTime) {
              mostRecentEventTime = eventTime;
            }
            lanes &= ~lane;
          }
          return mostRecentEventTime;
        }
        function computeExpirationTime(lane, currentTime) {
          switch (lane) {
            case SyncLane:
            case InputContinuousHydrationLane:
            case InputContinuousLane:
              return currentTime + 250;
            case DefaultHydrationLane:
            case DefaultLane:
            case TransitionHydrationLane:
            case TransitionLane1:
            case TransitionLane2:
            case TransitionLane3:
            case TransitionLane4:
            case TransitionLane5:
            case TransitionLane6:
            case TransitionLane7:
            case TransitionLane8:
            case TransitionLane9:
            case TransitionLane10:
            case TransitionLane11:
            case TransitionLane12:
            case TransitionLane13:
            case TransitionLane14:
            case TransitionLane15:
            case TransitionLane16:
              return currentTime + 5e3;
            case RetryLane1:
            case RetryLane2:
            case RetryLane3:
            case RetryLane4:
            case RetryLane5:
              return NoTimestamp;
            case SelectiveHydrationLane:
            case IdleHydrationLane:
            case IdleLane:
            case OffscreenLane:
              return NoTimestamp;
            default:
              {
                error("Should have found matching lanes. This is a bug in React.");
              }
              return NoTimestamp;
          }
        }
        function markStarvedLanesAsExpired(root2, currentTime) {
          const pendingLanes = root2.pendingLanes;
          const suspendedLanes = root2.suspendedLanes;
          const pingedLanes = root2.pingedLanes;
          const expirationTimes = root2.expirationTimes;
          let lanes = pendingLanes;
          while (lanes > 0) {
            const index2 = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index2;
            const expirationTime = expirationTimes[index2];
            if (expirationTime === NoTimestamp) {
              if ((lane & suspendedLanes) === NoLanes || (lane & pingedLanes) !== NoLanes) {
                expirationTimes[index2] = computeExpirationTime(lane, currentTime);
              }
            } else if (expirationTime <= currentTime) {
              root2.expiredLanes |= lane;
            }
            lanes &= ~lane;
          }
        }
        function getHighestPriorityPendingLanes(root2) {
          return getHighestPriorityLanes(root2.pendingLanes);
        }
        function getLanesToRetrySynchronouslyOnError(root2) {
          const everythingButOffscreen = root2.pendingLanes & ~OffscreenLane;
          if (everythingButOffscreen !== NoLanes) {
            return everythingButOffscreen;
          }
          if (everythingButOffscreen & OffscreenLane) {
            return OffscreenLane;
          }
          return NoLanes;
        }
        function includesSyncLane(lanes) {
          return (lanes & SyncLane) !== NoLanes;
        }
        function includesNonIdleWork(lanes) {
          return (lanes & NonIdleLanes) !== NoLanes;
        }
        function includesOnlyRetries(lanes) {
          return (lanes & RetryLanes) === lanes;
        }
        function includesOnlyNonUrgentLanes(lanes) {
          const UrgentLanes = SyncLane | InputContinuousLane | DefaultLane;
          return (lanes & UrgentLanes) === NoLanes;
        }
        function includesOnlyTransitions(lanes) {
          return (lanes & TransitionLanes) === lanes;
        }
        function includesBlockingLane(root2, lanes) {
          const SyncDefaultLanes = InputContinuousHydrationLane | InputContinuousLane | DefaultHydrationLane | DefaultLane;
          return (lanes & SyncDefaultLanes) !== NoLanes;
        }
        function includesExpiredLane(root2, lanes) {
          return (lanes & root2.expiredLanes) !== NoLanes;
        }
        function isTransitionLane(lane) {
          return (lane & TransitionLanes) !== NoLanes;
        }
        function claimNextTransitionLane() {
          const lane = nextTransitionLane;
          nextTransitionLane <<= 1;
          if ((nextTransitionLane & TransitionLanes) === NoLanes) {
            nextTransitionLane = TransitionLane1;
          }
          return lane;
        }
        function claimNextRetryLane() {
          const lane = nextRetryLane;
          nextRetryLane <<= 1;
          if ((nextRetryLane & RetryLanes) === NoLanes) {
            nextRetryLane = RetryLane1;
          }
          return lane;
        }
        function getHighestPriorityLane(lanes) {
          return lanes & -lanes;
        }
        function pickArbitraryLane(lanes) {
          return getHighestPriorityLane(lanes);
        }
        function pickArbitraryLaneIndex(lanes) {
          return 31 - clz32(lanes);
        }
        function laneToIndex(lane) {
          return pickArbitraryLaneIndex(lane);
        }
        function includesSomeLane(a, b) {
          return (a & b) !== NoLanes;
        }
        function isSubsetOfLanes(set2, subset) {
          return (set2 & subset) === subset;
        }
        function mergeLanes(a, b) {
          return a | b;
        }
        function removeLanes(set2, subset) {
          return set2 & ~subset;
        }
        function intersectLanes(a, b) {
          return a & b;
        }
        function laneToLanes(lane) {
          return lane;
        }
        function higherPriorityLane(a, b) {
          return a !== NoLane && a < b ? a : b;
        }
        function createLaneMap(initial) {
          const laneMap = [];
          for (let i = 0; i < TotalLanes; i++) {
            laneMap.push(initial);
          }
          return laneMap;
        }
        function markRootUpdated(root2, updateLane, eventTime) {
          root2.pendingLanes |= updateLane;
          if (updateLane !== IdleLane) {
            root2.suspendedLanes = NoLanes;
            root2.pingedLanes = NoLanes;
          }
          const eventTimes = root2.eventTimes;
          const index2 = laneToIndex(updateLane);
          eventTimes[index2] = eventTime;
        }
        function markRootSuspended(root2, suspendedLanes) {
          root2.suspendedLanes |= suspendedLanes;
          root2.pingedLanes &= ~suspendedLanes;
          const expirationTimes = root2.expirationTimes;
          let lanes = suspendedLanes;
          while (lanes > 0) {
            const index2 = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index2;
            expirationTimes[index2] = NoTimestamp;
            lanes &= ~lane;
          }
        }
        function markRootPinged(root2, pingedLanes, eventTime) {
          root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
        }
        function markRootFinished(root2, remainingLanes) {
          const noLongerPendingLanes = root2.pendingLanes & ~remainingLanes;
          root2.pendingLanes = remainingLanes;
          root2.suspendedLanes = NoLanes;
          root2.pingedLanes = NoLanes;
          root2.expiredLanes &= remainingLanes;
          root2.mutableReadLanes &= remainingLanes;
          root2.entangledLanes &= remainingLanes;
          const entanglements = root2.entanglements;
          const eventTimes = root2.eventTimes;
          const expirationTimes = root2.expirationTimes;
          let lanes = noLongerPendingLanes;
          while (lanes > 0) {
            const index2 = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index2;
            entanglements[index2] = NoLanes;
            eventTimes[index2] = NoTimestamp;
            expirationTimes[index2] = NoTimestamp;
            lanes &= ~lane;
          }
        }
        function markRootEntangled(root2, entangledLanes) {
          const rootEntangledLanes = root2.entangledLanes |= entangledLanes;
          const entanglements = root2.entanglements;
          let lanes = rootEntangledLanes;
          while (lanes) {
            const index2 = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index2;
            if (
              // Is this one of the newly entangled lanes?
              lane & entangledLanes | // Is this lane transitively entangled with the newly entangled lanes?
              entanglements[index2] & entangledLanes
            ) {
              entanglements[index2] |= entangledLanes;
            }
            lanes &= ~lane;
          }
        }
        function getBumpedLaneForHydration(root2, renderLanes2) {
          const renderLane = getHighestPriorityLane(renderLanes2);
          let lane;
          switch (renderLane) {
            case InputContinuousLane:
              lane = InputContinuousHydrationLane;
              break;
            case DefaultLane:
              lane = DefaultHydrationLane;
              break;
            case TransitionLane1:
            case TransitionLane2:
            case TransitionLane3:
            case TransitionLane4:
            case TransitionLane5:
            case TransitionLane6:
            case TransitionLane7:
            case TransitionLane8:
            case TransitionLane9:
            case TransitionLane10:
            case TransitionLane11:
            case TransitionLane12:
            case TransitionLane13:
            case TransitionLane14:
            case TransitionLane15:
            case TransitionLane16:
            case RetryLane1:
            case RetryLane2:
            case RetryLane3:
            case RetryLane4:
            case RetryLane5:
              lane = TransitionHydrationLane;
              break;
            case IdleLane:
              lane = IdleHydrationLane;
              break;
            default:
              lane = NoLane;
              break;
          }
          if ((lane & (root2.suspendedLanes | renderLanes2)) !== NoLane) {
            return NoLane;
          }
          return lane;
        }
        function addFiberToLanesMap(root2, fiber, lanes) {
          if (!isDevToolsPresent) {
            return;
          }
          const pendingUpdatersLaneMap = root2.pendingUpdatersLaneMap;
          while (lanes > 0) {
            const index2 = laneToIndex(lanes);
            const lane = 1 << index2;
            const updaters = pendingUpdatersLaneMap[index2];
            updaters.add(fiber);
            lanes &= ~lane;
          }
        }
        function movePendingFibersToMemoized(root2, lanes) {
          if (!isDevToolsPresent) {
            return;
          }
          const pendingUpdatersLaneMap = root2.pendingUpdatersLaneMap;
          const memoizedUpdaters = root2.memoizedUpdaters;
          while (lanes > 0) {
            const index2 = laneToIndex(lanes);
            const lane = 1 << index2;
            const updaters = pendingUpdatersLaneMap[index2];
            if (updaters.size > 0) {
              updaters.forEach(function(fiber) {
                const alternate = fiber.alternate;
                if (alternate === null || !memoizedUpdaters.has(alternate)) {
                  memoizedUpdaters.add(fiber);
                }
              });
              updaters.clear();
            }
            lanes &= ~lane;
          }
        }
        function getTransitionsForLanes(root2, lanes) {
          {
            return null;
          }
        }
        var DiscreteEventPriority = SyncLane;
        var ContinuousEventPriority = InputContinuousLane;
        var DefaultEventPriority = DefaultLane;
        var IdleEventPriority = IdleLane;
        let currentUpdatePriority = NoLane;
        function getCurrentUpdatePriority() {
          return currentUpdatePriority;
        }
        function setCurrentUpdatePriority(newPriority) {
          currentUpdatePriority = newPriority;
        }
        function runWithPriority(priority, fn) {
          const previousPriority = currentUpdatePriority;
          try {
            currentUpdatePriority = priority;
            return fn();
          } finally {
            currentUpdatePriority = previousPriority;
          }
        }
        function higherEventPriority(a, b) {
          return a !== 0 && a < b ? a : b;
        }
        function lowerEventPriority(a, b) {
          return a === 0 || a > b ? a : b;
        }
        function isHigherEventPriority(a, b) {
          return a !== 0 && a < b;
        }
        function lanesToEventPriority(lanes) {
          const lane = getHighestPriorityLane(lanes);
          if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
            return DiscreteEventPriority;
          }
          if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
            return ContinuousEventPriority;
          }
          if (includesNonIdleWork(lane)) {
            return DefaultEventPriority;
          }
          return IdleEventPriority;
        }
        function isRootDehydrated(root2) {
          const currentState = root2.current.memoizedState;
          return currentState.isDehydrated;
        }
        let _attemptSynchronousHydration;
        function setAttemptSynchronousHydration(fn) {
          _attemptSynchronousHydration = fn;
        }
        function attemptSynchronousHydration(fiber) {
          _attemptSynchronousHydration(fiber);
        }
        let attemptContinuousHydration;
        function setAttemptContinuousHydration(fn) {
          attemptContinuousHydration = fn;
        }
        let attemptHydrationAtCurrentPriority;
        function setAttemptHydrationAtCurrentPriority(fn) {
          attemptHydrationAtCurrentPriority = fn;
        }
        let getCurrentUpdatePriority$1;
        function setGetCurrentUpdatePriority(fn) {
          getCurrentUpdatePriority$1 = fn;
        }
        let attemptHydrationAtPriority;
        function setAttemptHydrationAtPriority(fn) {
          attemptHydrationAtPriority = fn;
        }
        let hasScheduledReplayAttempt = false;
        const queuedDiscreteEvents = [];
        let queuedFocus = null;
        let queuedDrag = null;
        let queuedMouse = null;
        const queuedPointers = /* @__PURE__ */ new Map();
        const queuedPointerCaptures = /* @__PURE__ */ new Map();
        const queuedExplicitHydrationTargets = [];
        const discreteReplayableEvents = [
          "mousedown",
          "mouseup",
          "touchcancel",
          "touchend",
          "touchstart",
          "auxclick",
          "dblclick",
          "pointercancel",
          "pointerdown",
          "pointerup",
          "dragend",
          "dragstart",
          "drop",
          "compositionend",
          "compositionstart",
          "keydown",
          "keypress",
          "keyup",
          "input",
          "textInput",
          // Intentionally camelCase
          "copy",
          "cut",
          "paste",
          "click",
          "change",
          "contextmenu",
          "reset",
          "submit"
        ];
        function isDiscreteEventThatRequiresHydration(eventType) {
          return discreteReplayableEvents.indexOf(eventType) > -1;
        }
        function createQueuedReplayableEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          return {
            blockedOn,
            domEventName,
            eventSystemFlags,
            nativeEvent,
            targetContainers: [targetContainer]
          };
        }
        function clearIfContinuousEvent(domEventName, nativeEvent) {
          switch (domEventName) {
            case "focusin":
            case "focusout":
              queuedFocus = null;
              break;
            case "dragenter":
            case "dragleave":
              queuedDrag = null;
              break;
            case "mouseover":
            case "mouseout":
              queuedMouse = null;
              break;
            case "pointerover":
            case "pointerout": {
              const pointerId = nativeEvent.pointerId;
              queuedPointers.delete(pointerId);
              break;
            }
            case "gotpointercapture":
            case "lostpointercapture": {
              const _pointerId = nativeEvent.pointerId;
              queuedPointerCaptures.delete(_pointerId);
              break;
            }
          }
        }
        function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          if (existingQueuedEvent === null || existingQueuedEvent.nativeEvent !== nativeEvent) {
            const queuedEvent = createQueuedReplayableEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent);
            if (blockedOn !== null) {
              const _fiber2 = getInstanceFromNode(blockedOn);
              if (_fiber2 !== null) {
                attemptContinuousHydration(_fiber2);
              }
            }
            return queuedEvent;
          }
          existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
          const targetContainers = existingQueuedEvent.targetContainers;
          if (targetContainer !== null && targetContainers.indexOf(targetContainer) === -1) {
            targetContainers.push(targetContainer);
          }
          return existingQueuedEvent;
        }
        function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          switch (domEventName) {
            case "focusin": {
              const focusEvent = nativeEvent;
              queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, focusEvent);
              return true;
            }
            case "dragenter": {
              const dragEvent = nativeEvent;
              queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, dragEvent);
              return true;
            }
            case "mouseover": {
              const mouseEvent = nativeEvent;
              queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, mouseEvent);
              return true;
            }
            case "pointerover": {
              const pointerEvent = nativeEvent;
              const pointerId = pointerEvent.pointerId;
              queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, pointerEvent));
              return true;
            }
            case "gotpointercapture": {
              const _pointerEvent = nativeEvent;
              const _pointerId2 = _pointerEvent.pointerId;
              queuedPointerCaptures.set(_pointerId2, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(_pointerId2) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, _pointerEvent));
              return true;
            }
          }
          return false;
        }
        function attemptExplicitHydrationTarget(queuedTarget) {
          const targetInst = getClosestInstanceFromNode(queuedTarget.target);
          if (targetInst !== null) {
            const nearestMounted = getNearestMountedFiber(targetInst);
            if (nearestMounted !== null) {
              const tag = nearestMounted.tag;
              if (tag === SuspenseComponent) {
                const instance = getSuspenseInstanceFromFiber(nearestMounted);
                if (instance !== null) {
                  queuedTarget.blockedOn = instance;
                  attemptHydrationAtPriority(queuedTarget.priority, function() {
                    attemptHydrationAtCurrentPriority(nearestMounted);
                  });
                  return;
                }
              } else if (tag === HostRoot) {
                const root2 = nearestMounted.stateNode;
                if (isRootDehydrated(root2)) {
                  queuedTarget.blockedOn = getContainerFromFiber(nearestMounted);
                  return;
                }
              }
            }
          }
          queuedTarget.blockedOn = null;
        }
        function queueExplicitHydrationTarget(target) {
          const updatePriority = getCurrentUpdatePriority$1();
          const queuedTarget = {
            blockedOn: null,
            target,
            priority: updatePriority
          };
          let i = 0;
          for (; i < queuedExplicitHydrationTargets.length; i++) {
            if (!isHigherEventPriority(updatePriority, queuedExplicitHydrationTargets[i].priority)) {
              break;
            }
          }
          queuedExplicitHydrationTargets.splice(i, 0, queuedTarget);
          if (i === 0) {
            attemptExplicitHydrationTarget(queuedTarget);
          }
        }
        function attemptReplayContinuousQueuedEvent(queuedEvent) {
          if (queuedEvent.blockedOn !== null) {
            return false;
          }
          const targetContainers = queuedEvent.targetContainers;
          while (targetContainers.length > 0) {
            const targetContainer = targetContainers[0];
            const nextBlockedOn = findInstanceBlockingEvent(queuedEvent.domEventName, queuedEvent.eventSystemFlags, targetContainer, queuedEvent.nativeEvent);
            if (nextBlockedOn === null) {
              {
                const nativeEvent = queuedEvent.nativeEvent;
                const nativeEventClone = new nativeEvent.constructor(nativeEvent.type, nativeEvent);
                setReplayingEvent(nativeEventClone);
                nativeEvent.target.dispatchEvent(nativeEventClone);
                resetReplayingEvent();
              }
            } else {
              const _fiber3 = getInstanceFromNode(nextBlockedOn);
              if (_fiber3 !== null) {
                attemptContinuousHydration(_fiber3);
              }
              queuedEvent.blockedOn = nextBlockedOn;
              return false;
            }
            targetContainers.shift();
          }
          return true;
        }
        function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
          if (attemptReplayContinuousQueuedEvent(queuedEvent)) {
            map.delete(key);
          }
        }
        function replayUnblockedEvents() {
          hasScheduledReplayAttempt = false;
          if (queuedFocus !== null && attemptReplayContinuousQueuedEvent(queuedFocus)) {
            queuedFocus = null;
          }
          if (queuedDrag !== null && attemptReplayContinuousQueuedEvent(queuedDrag)) {
            queuedDrag = null;
          }
          if (queuedMouse !== null && attemptReplayContinuousQueuedEvent(queuedMouse)) {
            queuedMouse = null;
          }
          queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
          queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
        }
        function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
          if (queuedEvent.blockedOn === unblocked) {
            queuedEvent.blockedOn = null;
            if (!hasScheduledReplayAttempt) {
              hasScheduledReplayAttempt = true;
              Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents);
            }
          }
        }
        function retryIfBlockedOn(unblocked) {
          if (queuedDiscreteEvents.length > 0) {
            scheduleCallbackIfUnblocked(queuedDiscreteEvents[0], unblocked);
            for (let i = 1; i < queuedDiscreteEvents.length; i++) {
              const queuedEvent = queuedDiscreteEvents[i];
              if (queuedEvent.blockedOn === unblocked) {
                queuedEvent.blockedOn = null;
              }
            }
          }
          if (queuedFocus !== null) {
            scheduleCallbackIfUnblocked(queuedFocus, unblocked);
          }
          if (queuedDrag !== null) {
            scheduleCallbackIfUnblocked(queuedDrag, unblocked);
          }
          if (queuedMouse !== null) {
            scheduleCallbackIfUnblocked(queuedMouse, unblocked);
          }
          const unblock = function(queuedEvent2) {
            return scheduleCallbackIfUnblocked(queuedEvent2, unblocked);
          };
          queuedPointers.forEach(unblock);
          queuedPointerCaptures.forEach(unblock);
          for (let _i = 0; _i < queuedExplicitHydrationTargets.length; _i++) {
            const queuedTarget = queuedExplicitHydrationTargets[_i];
            if (queuedTarget.blockedOn === unblocked) {
              queuedTarget.blockedOn = null;
            }
          }
          while (queuedExplicitHydrationTargets.length > 0) {
            const nextExplicitTarget = queuedExplicitHydrationTargets[0];
            if (nextExplicitTarget.blockedOn !== null) {
              break;
            } else {
              attemptExplicitHydrationTarget(nextExplicitTarget);
              if (nextExplicitTarget.blockedOn === null) {
                queuedExplicitHydrationTargets.shift();
              }
            }
          }
        }
        const ReactCurrentBatchConfig = ReactSharedInternals.ReactCurrentBatchConfig;
        let _enabled = true;
        function setEnabled(enabled) {
          _enabled = !!enabled;
        }
        function isEnabled() {
          return _enabled;
        }
        function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
          const eventPriority = getEventPriority(domEventName);
          let listenerWrapper;
          switch (eventPriority) {
            case DiscreteEventPriority:
              listenerWrapper = dispatchDiscreteEvent;
              break;
            case ContinuousEventPriority:
              listenerWrapper = dispatchContinuousEvent;
              break;
            case DefaultEventPriority:
            default:
              listenerWrapper = dispatchEvent;
              break;
          }
          return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
        }
        function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
          const previousPriority = getCurrentUpdatePriority();
          const prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = null;
          try {
            setCurrentUpdatePriority(DiscreteEventPriority);
            dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
          } finally {
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig.transition = prevTransition;
          }
        }
        function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
          const previousPriority = getCurrentUpdatePriority();
          const prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = null;
          try {
            setCurrentUpdatePriority(ContinuousEventPriority);
            dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
          } finally {
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig.transition = prevTransition;
          }
        }
        function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          if (!_enabled) {
            return;
          }
          {
            dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent);
          }
        }
        function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          let blockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
          if (blockedOn === null) {
            dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
            clearIfContinuousEvent(domEventName, nativeEvent);
            return;
          }
          if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) {
            nativeEvent.stopPropagation();
            return;
          }
          clearIfContinuousEvent(domEventName, nativeEvent);
          if (eventSystemFlags & IS_CAPTURE_PHASE && isDiscreteEventThatRequiresHydration(domEventName)) {
            while (blockedOn !== null) {
              const fiber = getInstanceFromNode(blockedOn);
              if (fiber !== null) {
                attemptSynchronousHydration(fiber);
              }
              const nextBlockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
              if (nextBlockedOn === null) {
                dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
              }
              if (nextBlockedOn === blockedOn) {
                break;
              }
              blockedOn = nextBlockedOn;
            }
            if (blockedOn !== null) {
              nativeEvent.stopPropagation();
            }
            return;
          }
          dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
        }
        var return_targetInst = null;
        function findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
          return_targetInst = null;
          const nativeEventTarget = getEventTarget(nativeEvent);
          let targetInst = getClosestInstanceFromNode(nativeEventTarget);
          if (targetInst !== null) {
            const nearestMounted = getNearestMountedFiber(targetInst);
            if (nearestMounted === null) {
              targetInst = null;
            } else {
              const tag = nearestMounted.tag;
              if (tag === SuspenseComponent) {
                const instance = getSuspenseInstanceFromFiber(nearestMounted);
                if (instance !== null) {
                  return instance;
                }
                targetInst = null;
              } else if (tag === HostRoot) {
                const root2 = nearestMounted.stateNode;
                if (isRootDehydrated(root2)) {
                  return getContainerFromFiber(nearestMounted);
                }
                targetInst = null;
              } else if (nearestMounted !== targetInst) {
                targetInst = null;
              }
            }
          }
          return_targetInst = targetInst;
          return null;
        }
        function getEventPriority(domEventName) {
          switch (domEventName) {
            case "cancel":
            case "click":
            case "close":
            case "contextmenu":
            case "copy":
            case "cut":
            case "auxclick":
            case "dblclick":
            case "dragend":
            case "dragstart":
            case "drop":
            case "focusin":
            case "focusout":
            case "input":
            case "invalid":
            case "keydown":
            case "keypress":
            case "keyup":
            case "mousedown":
            case "mouseup":
            case "paste":
            case "pause":
            case "play":
            case "pointercancel":
            case "pointerdown":
            case "pointerup":
            case "ratechange":
            case "reset":
            case "resize":
            case "seeked":
            case "submit":
            case "touchcancel":
            case "touchend":
            case "touchstart":
            case "volumechange":
            case "change":
            case "selectionchange":
            case "textInput":
            case "compositionstart":
            case "compositionend":
            case "compositionupdate":
            case "beforeblur":
            case "afterblur":
            case "beforeinput":
            case "blur":
            case "fullscreenchange":
            case "focus":
            case "hashchange":
            case "popstate":
            case "select":
            case "selectstart":
              return DiscreteEventPriority;
            case "drag":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "mousemove":
            case "mouseout":
            case "mouseover":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "scroll":
            case "toggle":
            case "touchmove":
            case "wheel":
            case "mouseenter":
            case "mouseleave":
            case "pointerenter":
            case "pointerleave":
              return ContinuousEventPriority;
            case "message": {
              const schedulerPriority = getCurrentPriorityLevel();
              switch (schedulerPriority) {
                case ImmediatePriority:
                  return DiscreteEventPriority;
                case UserBlockingPriority:
                  return ContinuousEventPriority;
                case NormalPriority:
                case LowPriority:
                  return DefaultEventPriority;
                case IdlePriority:
                  return IdleEventPriority;
                default:
                  return DefaultEventPriority;
              }
            }
            default:
              return DefaultEventPriority;
          }
        }
        function addEventBubbleListener(target, eventType, listener) {
          target.addEventListener(eventType, listener, false);
          return listener;
        }
        function addEventCaptureListener(target, eventType, listener) {
          target.addEventListener(eventType, listener, true);
          return listener;
        }
        function addEventCaptureListenerWithPassiveFlag(target, eventType, listener, passive) {
          target.addEventListener(eventType, listener, {
            capture: true,
            passive
          });
          return listener;
        }
        function addEventBubbleListenerWithPassiveFlag(target, eventType, listener, passive) {
          target.addEventListener(eventType, listener, {
            passive
          });
          return listener;
        }
        let root = null;
        let startText = null;
        let fallbackText = null;
        function initialize(nativeEventTarget) {
          root = nativeEventTarget;
          startText = getText();
          return true;
        }
        function reset() {
          root = null;
          startText = null;
          fallbackText = null;
        }
        function getData() {
          if (fallbackText) {
            return fallbackText;
          }
          let start;
          const startValue = startText;
          const startLength = startValue.length;
          let end;
          const endValue = getText();
          const endLength = endValue.length;
          for (start = 0; start < startLength; start++) {
            if (startValue[start] !== endValue[start]) {
              break;
            }
          }
          const minEnd = startLength - start;
          for (end = 1; end <= minEnd; end++) {
            if (startValue[startLength - end] !== endValue[endLength - end]) {
              break;
            }
          }
          const sliceTail = end > 1 ? 1 - end : void 0;
          fallbackText = endValue.slice(start, sliceTail);
          return fallbackText;
        }
        function getText() {
          if ("value" in root) {
            return root.value;
          }
          return root.textContent;
        }
        function getEventCharCode(nativeEvent) {
          let charCode;
          const keyCode = nativeEvent.keyCode;
          if ("charCode" in nativeEvent) {
            charCode = nativeEvent.charCode;
            if (charCode === 0 && keyCode === 13) {
              charCode = 13;
            }
          } else {
            charCode = keyCode;
          }
          if (charCode === 10) {
            charCode = 13;
          }
          if (charCode >= 32 || charCode === 13) {
            return charCode;
          }
          return 0;
        }
        function functionThatReturnsTrue() {
          return true;
        }
        function functionThatReturnsFalse() {
          return false;
        }
        function createSyntheticEvent(Interface) {
          function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
            this._reactName = reactName;
            this._targetInst = targetInst;
            this.type = reactEventType;
            this.nativeEvent = nativeEvent;
            this.target = nativeEventTarget;
            this.currentTarget = null;
            for (const _propName in Interface) {
              if (!Interface.hasOwnProperty(_propName)) {
                continue;
              }
              const normalize = Interface[_propName];
              if (normalize) {
                this[_propName] = normalize(nativeEvent);
              } else {
                this[_propName] = nativeEvent[_propName];
              }
            }
            const defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
            if (defaultPrevented) {
              this.isDefaultPrevented = functionThatReturnsTrue;
            } else {
              this.isDefaultPrevented = functionThatReturnsFalse;
            }
            this.isPropagationStopped = functionThatReturnsFalse;
            return this;
          }
          assign(SyntheticBaseEvent.prototype, {
            preventDefault: function() {
              this.defaultPrevented = true;
              const event = this.nativeEvent;
              if (!event) {
                return;
              }
              if (event.preventDefault) {
                event.preventDefault();
              } else if (typeof event.returnValue !== "unknown") {
                event.returnValue = false;
              }
              this.isDefaultPrevented = functionThatReturnsTrue;
            },
            stopPropagation: function() {
              const event = this.nativeEvent;
              if (!event) {
                return;
              }
              if (event.stopPropagation) {
                event.stopPropagation();
              } else if (typeof event.cancelBubble !== "unknown") {
                event.cancelBubble = true;
              }
              this.isPropagationStopped = functionThatReturnsTrue;
            },
            /**
             * We release all dispatched `SyntheticEvent`s after each event loop, adding
             * them back into the pool. This allows a way to hold onto a reference that
             * won't be added back into the pool.
             */
            persist: function() {
            },
            /**
             * Checks if this event should be released back into the pool.
             *
             * @return {boolean} True if this should not be released, false otherwise.
             */
            isPersistent: functionThatReturnsTrue
          });
          return SyntheticBaseEvent;
        }
        const EventInterface = {
          eventPhase: 0,
          bubbles: 0,
          cancelable: 0,
          timeStamp: function(event) {
            return event.timeStamp || Date.now();
          },
          defaultPrevented: 0,
          isTrusted: 0
        };
        const SyntheticEvent = createSyntheticEvent(EventInterface);
        const UIEventInterface = assign({}, EventInterface, {
          view: 0,
          detail: 0
        });
        const SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
        let lastMovementX;
        let lastMovementY;
        let lastMouseEvent;
        function updateMouseMovementPolyfillState(event) {
          if (event !== lastMouseEvent) {
            if (lastMouseEvent && event.type === "mousemove") {
              lastMovementX = event.screenX - lastMouseEvent.screenX;
              lastMovementY = event.screenY - lastMouseEvent.screenY;
            } else {
              lastMovementX = 0;
              lastMovementY = 0;
            }
            lastMouseEvent = event;
          }
        }
        const MouseEventInterface = assign({}, UIEventInterface, {
          screenX: 0,
          screenY: 0,
          clientX: 0,
          clientY: 0,
          pageX: 0,
          pageY: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          getModifierState: getEventModifierState,
          button: 0,
          buttons: 0,
          relatedTarget: function(event) {
            if (event.relatedTarget === void 0) return event.fromElement === event.srcElement ? event.toElement : event.fromElement;
            return event.relatedTarget;
          },
          movementX: function(event) {
            if ("movementX" in event) {
              return event.movementX;
            }
            updateMouseMovementPolyfillState(event);
            return lastMovementX;
          },
          movementY: function(event) {
            if ("movementY" in event) {
              return event.movementY;
            }
            return lastMovementY;
          }
        });
        const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
        const DragEventInterface = assign({}, MouseEventInterface, {
          dataTransfer: 0
        });
        const SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
        const FocusEventInterface = assign({}, UIEventInterface, {
          relatedTarget: 0
        });
        const SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
        const AnimationEventInterface = assign({}, EventInterface, {
          animationName: 0,
          elapsedTime: 0,
          pseudoElement: 0
        });
        const SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
        const ClipboardEventInterface = assign({}, EventInterface, {
          clipboardData: function(event) {
            return "clipboardData" in event ? event.clipboardData : window.clipboardData;
          }
        });
        const SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
        const CompositionEventInterface = assign({}, EventInterface, {
          data: 0
        });
        const SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
        const SyntheticInputEvent = SyntheticCompositionEvent;
        const normalizeKey = {
          Esc: "Escape",
          Spacebar: " ",
          Left: "ArrowLeft",
          Up: "ArrowUp",
          Right: "ArrowRight",
          Down: "ArrowDown",
          Del: "Delete",
          Win: "OS",
          Menu: "ContextMenu",
          Apps: "ContextMenu",
          Scroll: "ScrollLock",
          MozPrintableKey: "Unidentified"
        };
        const translateToKey = {
          "8": "Backspace",
          "9": "Tab",
          "12": "Clear",
          "13": "Enter",
          "16": "Shift",
          "17": "Control",
          "18": "Alt",
          "19": "Pause",
          "20": "CapsLock",
          "27": "Escape",
          "32": " ",
          "33": "PageUp",
          "34": "PageDown",
          "35": "End",
          "36": "Home",
          "37": "ArrowLeft",
          "38": "ArrowUp",
          "39": "ArrowRight",
          "40": "ArrowDown",
          "45": "Insert",
          "46": "Delete",
          "112": "F1",
          "113": "F2",
          "114": "F3",
          "115": "F4",
          "116": "F5",
          "117": "F6",
          "118": "F7",
          "119": "F8",
          "120": "F9",
          "121": "F10",
          "122": "F11",
          "123": "F12",
          "144": "NumLock",
          "145": "ScrollLock",
          "224": "Meta"
        };
        function getEventKey(nativeEvent) {
          if (nativeEvent.key) {
            const key = normalizeKey[nativeEvent.key] || nativeEvent.key;
            if (key !== "Unidentified") {
              return key;
            }
          }
          if (nativeEvent.type === "keypress") {
            const charCode = getEventCharCode(nativeEvent);
            return charCode === 13 ? "Enter" : String.fromCharCode(charCode);
          }
          if (nativeEvent.type === "keydown" || nativeEvent.type === "keyup") {
            return translateToKey[nativeEvent.keyCode] || "Unidentified";
          }
          return "";
        }
        const modifierKeyToProp = {
          Alt: "altKey",
          Control: "ctrlKey",
          Meta: "metaKey",
          Shift: "shiftKey"
        };
        function modifierStateGetter(keyArg) {
          const syntheticEvent = this;
          const nativeEvent = syntheticEvent.nativeEvent;
          if (nativeEvent.getModifierState) {
            return nativeEvent.getModifierState(keyArg);
          }
          const keyProp = modifierKeyToProp[keyArg];
          return keyProp ? !!nativeEvent[keyProp] : false;
        }
        function getEventModifierState(nativeEvent) {
          return modifierStateGetter;
        }
        const KeyboardEventInterface = assign({}, UIEventInterface, {
          key: getEventKey,
          code: 0,
          location: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          repeat: 0,
          locale: 0,
          getModifierState: getEventModifierState,
          // Legacy Interface
          charCode: function(event) {
            if (event.type === "keypress") {
              return getEventCharCode(event);
            }
            return 0;
          },
          keyCode: function(event) {
            if (event.type === "keydown" || event.type === "keyup") {
              return event.keyCode;
            }
            return 0;
          },
          which: function(event) {
            if (event.type === "keypress") {
              return getEventCharCode(event);
            }
            if (event.type === "keydown" || event.type === "keyup") {
              return event.keyCode;
            }
            return 0;
          }
        });
        const SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
        const PointerEventInterface = assign({}, MouseEventInterface, {
          pointerId: 0,
          width: 0,
          height: 0,
          pressure: 0,
          tangentialPressure: 0,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
          pointerType: 0,
          isPrimary: 0
        });
        const SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
        const TouchEventInterface = assign({}, UIEventInterface, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: getEventModifierState
        });
        const SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
        const TransitionEventInterface = assign({}, EventInterface, {
          propertyName: 0,
          elapsedTime: 0,
          pseudoElement: 0
        });
        const SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
        const WheelEventInterface = assign({}, MouseEventInterface, {
          deltaX: function(event) {
            return "deltaX" in event ? event.deltaX : (
              // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
              "wheelDeltaX" in event ? -event.wheelDeltaX : 0
            );
          },
          deltaY: function(event) {
            return "deltaY" in event ? event.deltaY : (
              // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
              "wheelDeltaY" in event ? -event.wheelDeltaY : (
                // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
                "wheelDelta" in event ? -event.wheelDelta : 0
              )
            );
          },
          deltaZ: 0,
          // Browsers without "deltaMode" is reporting in raw wheel delta where one
          // notch on the scroll is always +/- 120, roughly equivalent to pixels.
          // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
          // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
          deltaMode: 0
        });
        const SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
        const END_KEYCODES = [9, 13, 27, 32];
        const START_KEYCODE = 229;
        const canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
        let documentMode = null;
        if (canUseDOM && "documentMode" in document) {
          documentMode = document.documentMode;
        }
        const canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
        const useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);
        const SPACEBAR_CODE = 32;
        const SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);
        function registerEvents() {
          registerTwoPhaseEvent("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
          registerTwoPhaseEvent("onCompositionEnd", ["compositionend", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
          registerTwoPhaseEvent("onCompositionStart", ["compositionstart", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
          registerTwoPhaseEvent("onCompositionUpdate", ["compositionupdate", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
        }
        let hasSpaceKeypress = false;
        function isKeypressCommand(nativeEvent) {
          return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && // ctrlKey && altKey is equivalent to AltGr, and is not a command.
          !(nativeEvent.ctrlKey && nativeEvent.altKey);
        }
        function getCompositionEventType(domEventName) {
          switch (domEventName) {
            case "compositionstart":
              return "onCompositionStart";
            case "compositionend":
              return "onCompositionEnd";
            case "compositionupdate":
              return "onCompositionUpdate";
          }
        }
        function isFallbackCompositionStart(domEventName, nativeEvent) {
          return domEventName === "keydown" && nativeEvent.keyCode === START_KEYCODE;
        }
        function isFallbackCompositionEnd(domEventName, nativeEvent) {
          switch (domEventName) {
            case "keyup":
              return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
            case "keydown":
              return nativeEvent.keyCode !== START_KEYCODE;
            case "keypress":
            case "mousedown":
            case "focusout":
              return true;
            default:
              return false;
          }
        }
        function getDataFromCustomEvent(nativeEvent) {
          const detail = nativeEvent.detail;
          if (typeof detail === "object" && "data" in detail) {
            return detail.data;
          }
          return null;
        }
        function isUsingKoreanIME(nativeEvent) {
          return nativeEvent.locale === "ko";
        }
        let isComposing = false;
        function extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
          let eventType;
          let fallbackData;
          if (canUseCompositionEvent) {
            eventType = getCompositionEventType(domEventName);
          } else if (!isComposing) {
            if (isFallbackCompositionStart(domEventName, nativeEvent)) {
              eventType = "onCompositionStart";
            }
          } else if (isFallbackCompositionEnd(domEventName, nativeEvent)) {
            eventType = "onCompositionEnd";
          }
          if (!eventType) {
            return null;
          }
          if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
            if (!isComposing && eventType === "onCompositionStart") {
              isComposing = initialize(nativeEventTarget);
            } else if (eventType === "onCompositionEnd") {
              if (isComposing) {
                fallbackData = getData();
              }
            }
          }
          const listeners = accumulateTwoPhaseListeners(targetInst, eventType);
          if (listeners.length > 0) {
            const event = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget);
            dispatchQueue.push({
              event,
              listeners
            });
            if (fallbackData) {
              event.data = fallbackData;
            } else {
              const customData = getDataFromCustomEvent(nativeEvent);
              if (customData !== null) {
                event.data = customData;
              }
            }
          }
        }
        function getNativeBeforeInputChars(domEventName, nativeEvent) {
          switch (domEventName) {
            case "compositionend":
              return getDataFromCustomEvent(nativeEvent);
            case "keypress":
              var which = nativeEvent.which;
              if (which !== SPACEBAR_CODE) {
                return null;
              }
              hasSpaceKeypress = true;
              return SPACEBAR_CHAR;
            case "textInput":
              var chars = nativeEvent.data;
              if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
                return null;
              }
              return chars;
            default:
              return null;
          }
        }
        function getFallbackBeforeInputChars(domEventName, nativeEvent) {
          if (isComposing) {
            if (domEventName === "compositionend" || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent)) {
              const chars = getData();
              reset();
              isComposing = false;
              return chars;
            }
            return null;
          }
          switch (domEventName) {
            case "paste":
              return null;
            case "keypress":
              if (!isKeypressCommand(nativeEvent)) {
                if (nativeEvent.char && nativeEvent.char.length > 1) {
                  return nativeEvent.char;
                } else if (nativeEvent.which) {
                  return String.fromCharCode(nativeEvent.which);
                }
              }
              return null;
            case "compositionend":
              return useFallbackCompositionData && !isUsingKoreanIME(nativeEvent) ? null : nativeEvent.data;
            default:
              return null;
          }
        }
        function extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
          let chars;
          if (canUseTextInputEvent) {
            chars = getNativeBeforeInputChars(domEventName, nativeEvent);
          } else {
            chars = getFallbackBeforeInputChars(domEventName, nativeEvent);
          }
          if (!chars) {
            return null;
          }
          const listeners = accumulateTwoPhaseListeners(targetInst, "onBeforeInput");
          if (listeners.length > 0) {
            const event = new SyntheticInputEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget);
            dispatchQueue.push({
              event,
              listeners
            });
            event.data = chars;
          }
        }
        function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
          extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
        }
        const supportedInputTypes = {
          color: true,
          date: true,
          datetime: true,
          "datetime-local": true,
          email: true,
          month: true,
          number: true,
          password: true,
          range: true,
          search: true,
          tel: true,
          text: true,
          time: true,
          url: true,
          week: true
        };
        function isTextInputElement(elem) {
          const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
          if (nodeName === "input") {
            return !!supportedInputTypes[elem.type];
          }
          if (nodeName === "textarea") {
            return true;
          }
          return false;
        }
        function isEventSupported(eventNameSuffix) {
          if (!canUseDOM) {
            return false;
          }
          const eventName = "on" + eventNameSuffix;
          let isSupported = eventName in document;
          if (!isSupported) {
            const element = document.createElement("div");
            element.setAttribute(eventName, "return;");
            isSupported = typeof element[eventName] === "function";
          }
          return isSupported;
        }
        function registerEvents$1() {
          registerTwoPhaseEvent("onChange", ["change", "click", "focusin", "focusout", "input", "keydown", "keyup", "selectionchange"]);
        }
        function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
          enqueueStateRestore(target);
          const listeners = accumulateTwoPhaseListeners(inst, "onChange");
          if (listeners.length > 0) {
            const event = new SyntheticEvent("onChange", "change", null, nativeEvent, target);
            dispatchQueue.push({
              event,
              listeners
            });
          }
        }
        let activeElement = null;
        let activeElementInst = null;
        function shouldUseChangeEvent(elem) {
          const nodeName = elem.nodeName && elem.nodeName.toLowerCase();
          return nodeName === "select" || nodeName === "input" && elem.type === "file";
        }
        function manualDispatchChangeEvent(nativeEvent) {
          const dispatchQueue = [];
          createAndAccumulateChangeEvent(dispatchQueue, activeElementInst, nativeEvent, getEventTarget(nativeEvent));
          batchedUpdates(runEventInBatch, dispatchQueue);
        }
        function runEventInBatch(dispatchQueue) {
          processDispatchQueue(dispatchQueue, 0);
        }
        function getInstIfValueChanged(targetInst) {
          const targetNode = getNodeFromInstance(targetInst);
          if (updateValueIfChanged(targetNode)) {
            return targetInst;
          }
        }
        function getTargetInstForChangeEvent(domEventName, targetInst) {
          if (domEventName === "change") {
            return targetInst;
          }
        }
        let isInputEventSupported = false;
        if (canUseDOM) {
          isInputEventSupported = isEventSupported("input") && (!document.documentMode || document.documentMode > 9);
        }
        function startWatchingForValueChange(target, targetInst) {
          activeElement = target;
          activeElementInst = targetInst;
          activeElement.attachEvent("onpropertychange", handlePropertyChange);
        }
        function stopWatchingForValueChange() {
          if (!activeElement) {
            return;
          }
          activeElement.detachEvent("onpropertychange", handlePropertyChange);
          activeElement = null;
          activeElementInst = null;
        }
        function handlePropertyChange(nativeEvent) {
          if (nativeEvent.propertyName !== "value") {
            return;
          }
          if (getInstIfValueChanged(activeElementInst)) {
            manualDispatchChangeEvent(nativeEvent);
          }
        }
        function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
          if (domEventName === "focusin") {
            stopWatchingForValueChange();
            startWatchingForValueChange(target, targetInst);
          } else if (domEventName === "focusout") {
            stopWatchingForValueChange();
          }
        }
        function getTargetInstForInputEventPolyfill(domEventName, targetInst) {
          if (domEventName === "selectionchange" || domEventName === "keyup" || domEventName === "keydown") {
            return getInstIfValueChanged(activeElementInst);
          }
        }
        function shouldUseClickEvent(elem) {
          const nodeName = elem.nodeName;
          return nodeName && nodeName.toLowerCase() === "input" && (elem.type === "checkbox" || elem.type === "radio");
        }
        function getTargetInstForClickEvent(domEventName, targetInst) {
          if (domEventName === "click") {
            return getInstIfValueChanged(targetInst);
          }
        }
        function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
          if (domEventName === "input" || domEventName === "change") {
            return getInstIfValueChanged(targetInst);
          }
        }
        function handleControlledInputBlur(node) {
          const state = node._wrapperState;
          if (!state || !state.controlled || node.type !== "number") {
            return;
          }
          {
            setDefaultValue(node, "number", node.value);
          }
        }
        function extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          const targetNode = targetInst ? getNodeFromInstance(targetInst) : window;
          let getTargetInstFunc, handleEventFunc;
          if (shouldUseChangeEvent(targetNode)) {
            getTargetInstFunc = getTargetInstForChangeEvent;
          } else if (isTextInputElement(targetNode)) {
            if (isInputEventSupported) {
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            } else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              handleEventFunc = handleEventsForInputEventPolyfill;
            }
          } else if (shouldUseClickEvent(targetNode)) {
            getTargetInstFunc = getTargetInstForClickEvent;
          }
          if (getTargetInstFunc) {
            const inst = getTargetInstFunc(domEventName, targetInst);
            if (inst) {
              createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, nativeEventTarget);
              return;
            }
          }
          if (handleEventFunc) {
            handleEventFunc(domEventName, targetNode, targetInst);
          }
          if (domEventName === "focusout") {
            handleControlledInputBlur(targetNode);
          }
        }
        function registerEvents$2() {
          registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
          registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
          registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
          registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
        }
        function extractEvents$2(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          const isOverEvent = domEventName === "mouseover" || domEventName === "pointerover";
          const isOutEvent = domEventName === "mouseout" || domEventName === "pointerout";
          if (isOverEvent && !isReplayingEvent(nativeEvent)) {
            const related = nativeEvent.relatedTarget || nativeEvent.fromElement;
            if (related) {
              if (getClosestInstanceFromNode(related) || isContainerMarkedAsRoot(related)) {
                return;
              }
            }
          }
          if (!isOutEvent && !isOverEvent) {
            return;
          }
          let win;
          if (nativeEventTarget.window === nativeEventTarget) {
            win = nativeEventTarget;
          } else {
            const doc = nativeEventTarget.ownerDocument;
            if (doc) {
              win = doc.defaultView || doc.parentWindow;
            } else {
              win = window;
            }
          }
          let from;
          let to;
          if (isOutEvent) {
            const _related = nativeEvent.relatedTarget || nativeEvent.toElement;
            from = targetInst;
            to = _related ? getClosestInstanceFromNode(_related) : null;
            if (to !== null) {
              const nearestMounted = getNearestMountedFiber(to);
              if (to !== nearestMounted || to.tag !== HostComponent && to.tag !== HostText) {
                to = null;
              }
            }
          } else {
            from = null;
            to = targetInst;
          }
          if (from === to) {
            return;
          }
          let SyntheticEventCtor = SyntheticMouseEvent;
          let leaveEventType = "onMouseLeave";
          let enterEventType = "onMouseEnter";
          let eventTypePrefix = "mouse";
          if (domEventName === "pointerout" || domEventName === "pointerover") {
            SyntheticEventCtor = SyntheticPointerEvent;
            leaveEventType = "onPointerLeave";
            enterEventType = "onPointerEnter";
            eventTypePrefix = "pointer";
          }
          const fromNode = from == null ? win : getNodeFromInstance(from);
          const toNode = to == null ? win : getNodeFromInstance(to);
          const leave = new SyntheticEventCtor(leaveEventType, eventTypePrefix + "leave", from, nativeEvent, nativeEventTarget);
          leave.target = fromNode;
          leave.relatedTarget = toNode;
          let enter = null;
          const nativeTargetInst = getClosestInstanceFromNode(nativeEventTarget);
          if (nativeTargetInst === targetInst) {
            const enterEvent = new SyntheticEventCtor(enterEventType, eventTypePrefix + "enter", to, nativeEvent, nativeEventTarget);
            enterEvent.target = toNode;
            enterEvent.relatedTarget = fromNode;
            enter = enterEvent;
          }
          accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leave, enter, from, to);
        }
        function is(x, y) {
          return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        }
        const objectIs = typeof Object.is === "function" ? Object.is : is;
        function shallowEqual(objA, objB) {
          if (objectIs(objA, objB)) {
            return true;
          }
          if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
            return false;
          }
          const keysA = Object.keys(objA);
          const keysB = Object.keys(objB);
          if (keysA.length !== keysB.length) {
            return false;
          }
          for (let i = 0; i < keysA.length; i++) {
            const currentKey = keysA[i];
            if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) {
              return false;
            }
          }
          return true;
        }
        function getLeafNode(node) {
          while (node && node.firstChild) {
            node = node.firstChild;
          }
          return node;
        }
        function getSiblingNode(node) {
          while (node) {
            if (node.nextSibling) {
              return node.nextSibling;
            }
            node = node.parentNode;
          }
        }
        function getNodeForCharacterOffset(root2, offset) {
          let node = getLeafNode(root2);
          let nodeStart = 0;
          let nodeEnd = 0;
          while (node) {
            if (node.nodeType === TEXT_NODE) {
              nodeEnd = nodeStart + node.textContent.length;
              if (nodeStart <= offset && nodeEnd >= offset) {
                return {
                  node,
                  offset: offset - nodeStart
                };
              }
              nodeStart = nodeEnd;
            }
            node = getLeafNode(getSiblingNode(node));
          }
        }
        function getOffsets(outerNode) {
          const ownerDocument = outerNode.ownerDocument;
          const win = ownerDocument && ownerDocument.defaultView || window;
          const selection = win.getSelection && win.getSelection();
          if (!selection || selection.rangeCount === 0) {
            return null;
          }
          const anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode = selection.focusNode, focusOffset = selection.focusOffset;
          try {
            anchorNode.nodeType;
            focusNode.nodeType;
          } catch (e) {
            return null;
          }
          return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset);
        }
        function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset) {
          let length = 0;
          let start = -1;
          let end = -1;
          let indexWithinAnchor = 0;
          let indexWithinFocus = 0;
          let node = outerNode;
          let parentNode = null;
          outer: while (true) {
            let next = null;
            while (true) {
              if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
                start = length + anchorOffset;
              }
              if (node === focusNode && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
                end = length + focusOffset;
              }
              if (node.nodeType === TEXT_NODE) {
                length += node.nodeValue.length;
              }
              if ((next = node.firstChild) === null) {
                break;
              }
              parentNode = node;
              node = next;
            }
            while (true) {
              if (node === outerNode) {
                break outer;
              }
              if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
                start = length;
              }
              if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
                end = length;
              }
              if ((next = node.nextSibling) !== null) {
                break;
              }
              node = parentNode;
              parentNode = node.parentNode;
            }
            node = next;
          }
          if (start === -1 || end === -1) {
            return null;
          }
          return {
            start,
            end
          };
        }
        function setOffsets(node, offsets) {
          const doc = node.ownerDocument || document;
          const win = doc && doc.defaultView || window;
          if (!win.getSelection) {
            return;
          }
          const selection = win.getSelection();
          const length = node.textContent.length;
          let start = Math.min(offsets.start, length);
          let end = offsets.end === void 0 ? start : Math.min(offsets.end, length);
          if (!selection.extend && start > end) {
            const temp = end;
            end = start;
            start = temp;
          }
          const startMarker = getNodeForCharacterOffset(node, start);
          const endMarker = getNodeForCharacterOffset(node, end);
          if (startMarker && endMarker) {
            if (selection.rangeCount === 1 && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) {
              return;
            }
            const range = doc.createRange();
            range.setStart(startMarker.node, startMarker.offset);
            selection.removeAllRanges();
            if (start > end) {
              selection.addRange(range);
              selection.extend(endMarker.node, endMarker.offset);
            } else {
              range.setEnd(endMarker.node, endMarker.offset);
              selection.addRange(range);
            }
          }
        }
        function isTextNode(node) {
          return node && node.nodeType === TEXT_NODE;
        }
        function containsNode(outerNode, innerNode) {
          if (!outerNode || !innerNode) {
            return false;
          } else if (outerNode === innerNode) {
            return true;
          } else if (isTextNode(outerNode)) {
            return false;
          } else if (isTextNode(innerNode)) {
            return containsNode(outerNode, innerNode.parentNode);
          } else if ("contains" in outerNode) {
            return outerNode.contains(innerNode);
          } else if (outerNode.compareDocumentPosition) {
            return !!(outerNode.compareDocumentPosition(innerNode) & 16);
          } else {
            return false;
          }
        }
        function isInDocument(node) {
          return node && node.ownerDocument && containsNode(node.ownerDocument.documentElement, node);
        }
        function isSameOriginFrame(iframe) {
          try {
            return typeof iframe.contentWindow.location.href === "string";
          } catch (err) {
            return false;
          }
        }
        function getActiveElementDeep() {
          let win = window;
          let element = getActiveElement();
          while (element instanceof win.HTMLIFrameElement) {
            if (isSameOriginFrame(element)) {
              win = element.contentWindow;
            } else {
              return element;
            }
            element = getActiveElement(win.document);
          }
          return element;
        }
        function hasSelectionCapabilities(elem) {
          const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
          return nodeName && (nodeName === "input" && (elem.type === "text" || elem.type === "search" || elem.type === "tel" || elem.type === "url" || elem.type === "password") || nodeName === "textarea" || elem.contentEditable === "true");
        }
        function getSelectionInformation() {
          const focusedElem = getActiveElementDeep();
          return {
            focusedElem,
            selectionRange: hasSelectionCapabilities(focusedElem) ? getSelection(focusedElem) : null
          };
        }
        function restoreSelection(priorSelectionInformation) {
          const curFocusedElem = getActiveElementDeep();
          const priorFocusedElem = priorSelectionInformation.focusedElem;
          const priorSelectionRange = priorSelectionInformation.selectionRange;
          if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
            if (priorSelectionRange !== null && hasSelectionCapabilities(priorFocusedElem)) {
              setSelection(priorFocusedElem, priorSelectionRange);
            }
            const ancestors = [];
            let ancestor = priorFocusedElem;
            while (ancestor = ancestor.parentNode) {
              if (ancestor.nodeType === ELEMENT_NODE) {
                ancestors.push({
                  element: ancestor,
                  left: ancestor.scrollLeft,
                  top: ancestor.scrollTop
                });
              }
            }
            if (typeof priorFocusedElem.focus === "function") {
              priorFocusedElem.focus();
            }
            for (let i = 0; i < ancestors.length; i++) {
              const info = ancestors[i];
              info.element.scrollLeft = info.left;
              info.element.scrollTop = info.top;
            }
          }
        }
        function getSelection(input) {
          let selection;
          if ("selectionStart" in input) {
            selection = {
              start: input.selectionStart,
              end: input.selectionEnd
            };
          } else {
            selection = getOffsets(input);
          }
          return selection || {
            start: 0,
            end: 0
          };
        }
        function setSelection(input, offsets) {
          const start = offsets.start;
          let end = offsets.end;
          if (end === void 0) {
            end = start;
          }
          if ("selectionStart" in input) {
            input.selectionStart = start;
            input.selectionEnd = Math.min(end, input.value.length);
          } else {
            setOffsets(input, offsets);
          }
        }
        const skipSelectionChangeEvent = canUseDOM && "documentMode" in document && document.documentMode <= 11;
        function registerEvents$3() {
          registerTwoPhaseEvent("onSelect", ["focusout", "contextmenu", "dragend", "focusin", "keydown", "keyup", "mousedown", "mouseup", "selectionchange"]);
        }
        let activeElement$1 = null;
        let activeElementInst$1 = null;
        let lastSelection = null;
        let mouseDown = false;
        function getSelection$1(node) {
          if ("selectionStart" in node && hasSelectionCapabilities(node)) {
            return {
              start: node.selectionStart,
              end: node.selectionEnd
            };
          } else {
            const win = node.ownerDocument && node.ownerDocument.defaultView || window;
            const selection = win.getSelection();
            return {
              anchorNode: selection.anchorNode,
              anchorOffset: selection.anchorOffset,
              focusNode: selection.focusNode,
              focusOffset: selection.focusOffset
            };
          }
        }
        function getEventTargetDocument(eventTarget) {
          return eventTarget.window === eventTarget ? eventTarget.document : eventTarget.nodeType === DOCUMENT_NODE ? eventTarget : eventTarget.ownerDocument;
        }
        function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
          const doc = getEventTargetDocument(nativeEventTarget);
          if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement(doc)) {
            return;
          }
          const currentSelection = getSelection$1(activeElement$1);
          if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
            lastSelection = currentSelection;
            const listeners = accumulateTwoPhaseListeners(activeElementInst$1, "onSelect");
            if (listeners.length > 0) {
              const event = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget);
              dispatchQueue.push({
                event,
                listeners
              });
              event.target = activeElement$1;
            }
          }
        }
        function extractEvents$3(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          const targetNode = targetInst ? getNodeFromInstance(targetInst) : window;
          switch (domEventName) {
            case "focusin":
              if (isTextInputElement(targetNode) || targetNode.contentEditable === "true") {
                activeElement$1 = targetNode;
                activeElementInst$1 = targetInst;
                lastSelection = null;
              }
              break;
            case "focusout":
              activeElement$1 = null;
              activeElementInst$1 = null;
              lastSelection = null;
              break;
            case "mousedown":
              mouseDown = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              mouseDown = false;
              constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
              break;
            case "selectionchange":
              if (skipSelectionChangeEvent) {
                break;
              }
            case "keydown":
            case "keyup":
              constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
          }
        }
        function makePrefixMap(styleProp, eventName) {
          const prefixes2 = {};
          prefixes2[styleProp.toLowerCase()] = eventName.toLowerCase();
          prefixes2["Webkit" + styleProp] = "webkit" + eventName;
          prefixes2["Moz" + styleProp] = "moz" + eventName;
          return prefixes2;
        }
        const vendorPrefixes = {
          animationend: makePrefixMap("Animation", "AnimationEnd"),
          animationiteration: makePrefixMap("Animation", "AnimationIteration"),
          animationstart: makePrefixMap("Animation", "AnimationStart"),
          transitionend: makePrefixMap("Transition", "TransitionEnd")
        };
        const prefixedEventNames = {};
        let style = {};
        if (canUseDOM) {
          style = document.createElement("div").style;
          if (!("AnimationEvent" in window)) {
            delete vendorPrefixes.animationend.animation;
            delete vendorPrefixes.animationiteration.animation;
            delete vendorPrefixes.animationstart.animation;
          }
          if (!("TransitionEvent" in window)) {
            delete vendorPrefixes.transitionend.transition;
          }
        }
        function getVendorPrefixedEventName(eventName) {
          if (prefixedEventNames[eventName]) {
            return prefixedEventNames[eventName];
          } else if (!vendorPrefixes[eventName]) {
            return eventName;
          }
          const prefixMap = vendorPrefixes[eventName];
          for (const styleProp in prefixMap) {
            if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
              return prefixedEventNames[eventName] = prefixMap[styleProp];
            }
          }
          return eventName;
        }
        const ANIMATION_END = getVendorPrefixedEventName("animationend");
        const ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
        const ANIMATION_START = getVendorPrefixedEventName("animationstart");
        const TRANSITION_END = getVendorPrefixedEventName("transitionend");
        const topLevelEventsToReactNames = /* @__PURE__ */ new Map();
        const simpleEventPluginEvents = ["abort", "auxClick", "cancel", "canPlay", "canPlayThrough", "click", "close", "contextMenu", "copy", "cut", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "gotPointerCapture", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "lostPointerCapture", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "pointerCancel", "pointerDown", "pointerMove", "pointerOut", "pointerOver", "pointerUp", "progress", "rateChange", "reset", "resize", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "touchCancel", "touchEnd", "touchStart", "volumeChange", "scroll", "toggle", "touchMove", "waiting", "wheel"];
        function registerSimpleEvent(domEventName, reactName) {
          topLevelEventsToReactNames.set(domEventName, reactName);
          registerTwoPhaseEvent(reactName, [domEventName]);
        }
        function registerSimpleEvents() {
          for (let i = 0; i < simpleEventPluginEvents.length; i++) {
            const eventName = simpleEventPluginEvents[i];
            const domEventName = eventName.toLowerCase();
            const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
            registerSimpleEvent(domEventName, "on" + capitalizedEvent);
          }
          registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
          registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
          registerSimpleEvent(ANIMATION_START, "onAnimationStart");
          registerSimpleEvent("dblclick", "onDoubleClick");
          registerSimpleEvent("focusin", "onFocus");
          registerSimpleEvent("focusout", "onBlur");
          registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
        }
        function extractEvents$4(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          const reactName = topLevelEventsToReactNames.get(domEventName);
          if (reactName === void 0) {
            return;
          }
          let SyntheticEventCtor = SyntheticEvent;
          let reactEventType = domEventName;
          switch (domEventName) {
            case "keypress":
              if (getEventCharCode(nativeEvent) === 0) {
                return;
              }
            case "keydown":
            case "keyup":
              SyntheticEventCtor = SyntheticKeyboardEvent;
              break;
            case "focusin":
              reactEventType = "focus";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "focusout":
              reactEventType = "blur";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "beforeblur":
            case "afterblur":
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "click":
              if (nativeEvent.button === 2) {
                return;
              }
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              SyntheticEventCtor = SyntheticMouseEvent;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              SyntheticEventCtor = SyntheticDragEvent;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              SyntheticEventCtor = SyntheticTouchEvent;
              break;
            case ANIMATION_END:
            case ANIMATION_ITERATION:
            case ANIMATION_START:
              SyntheticEventCtor = SyntheticAnimationEvent;
              break;
            case TRANSITION_END:
              SyntheticEventCtor = SyntheticTransitionEvent;
              break;
            case "scroll":
              SyntheticEventCtor = SyntheticUIEvent;
              break;
            case "wheel":
              SyntheticEventCtor = SyntheticWheelEvent;
              break;
            case "copy":
            case "cut":
            case "paste":
              SyntheticEventCtor = SyntheticClipboardEvent;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              SyntheticEventCtor = SyntheticPointerEvent;
              break;
          }
          const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
          {
            const accumulateTargetOnly = !inCapturePhase && // TODO: ideally, we'd eventually add all events from
            // nonDelegatedEvents list in DOMPluginEventSystem.
            // Then we can remove this special list.
            // This is a breaking change that can wait until React 18.
            domEventName === "scroll";
            const _listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase, accumulateTargetOnly);
            if (_listeners.length > 0) {
              const _event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget);
              dispatchQueue.push({
                event: _event,
                listeners: _listeners
              });
            }
          }
        }
        registerSimpleEvents();
        registerEvents$2();
        registerEvents$1();
        registerEvents$3();
        registerEvents();
        function extractEvents$5(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
          extractEvents$4(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
          const shouldProcessPolyfillPlugins = (eventSystemFlags & SHOULD_NOT_PROCESS_POLYFILL_EVENT_PLUGINS) === 0;
          if (shouldProcessPolyfillPlugins) {
            extractEvents$2(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
            extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
            extractEvents$3(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
            extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
          }
        }
        const mediaEventTypes = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "resize", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"];
        const nonDelegatedEvents = new Set(["cancel", "close", "invalid", "load", "scroll", "toggle"].concat(mediaEventTypes));
        function executeDispatch(event, listener, currentTarget) {
          const type = event.type || "unknown-event";
          event.currentTarget = currentTarget;
          invokeGuardedCallbackAndCatchFirstError(type, listener, void 0, event);
          event.currentTarget = null;
        }
        function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
          let previousInstance;
          if (inCapturePhase) {
            for (let i = dispatchListeners.length - 1; i >= 0; i--) {
              const _dispatchListeners$i = dispatchListeners[i], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget, listener = _dispatchListeners$i.listener;
              if (instance !== previousInstance && event.isPropagationStopped()) {
                return;
              }
              executeDispatch(event, listener, currentTarget);
              previousInstance = instance;
            }
          } else {
            for (let _i = 0; _i < dispatchListeners.length; _i++) {
              const _dispatchListeners$_i = dispatchListeners[_i], _instance = _dispatchListeners$_i.instance, _currentTarget = _dispatchListeners$_i.currentTarget, _listener = _dispatchListeners$_i.listener;
              if (_instance !== previousInstance && event.isPropagationStopped()) {
                return;
              }
              executeDispatch(event, _listener, _currentTarget);
              previousInstance = _instance;
            }
          }
        }
        function processDispatchQueue(dispatchQueue, eventSystemFlags) {
          const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
          for (let i = 0; i < dispatchQueue.length; i++) {
            const _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event, listeners = _dispatchQueue$i.listeners;
            processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
          }
          rethrowCaughtError();
        }
        function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
          const nativeEventTarget = getEventTarget(nativeEvent);
          const dispatchQueue = [];
          extractEvents$5(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
          processDispatchQueue(dispatchQueue, eventSystemFlags);
        }
        function listenToNonDelegatedEvent(domEventName, targetElement) {
          {
            if (!nonDelegatedEvents.has(domEventName)) {
              error('Did not expect a listenToNonDelegatedEvent() call for "%s". This is a bug in React. Please file an issue.', domEventName);
            }
          }
          const isCapturePhaseListener = false;
          const listenerSet = getEventListenerSet(targetElement);
          const listenerSetKey = getListenerSetKey(domEventName, isCapturePhaseListener);
          if (!listenerSet.has(listenerSetKey)) {
            addTrappedEventListener(targetElement, domEventName, IS_NON_DELEGATED, isCapturePhaseListener);
            listenerSet.add(listenerSetKey);
          }
        }
        function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
          {
            if (nonDelegatedEvents.has(domEventName) && !isCapturePhaseListener) {
              error('Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. This is a bug in React. Please file an issue.', domEventName);
            }
          }
          let eventSystemFlags = 0;
          if (isCapturePhaseListener) {
            eventSystemFlags |= IS_CAPTURE_PHASE;
          }
          addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
        }
        const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
        function listenToAllSupportedEvents(rootContainerElement) {
          if (!rootContainerElement[listeningMarker]) {
            rootContainerElement[listeningMarker] = true;
            allNativeEvents.forEach(function(domEventName) {
              if (domEventName !== "selectionchange") {
                if (!nonDelegatedEvents.has(domEventName)) {
                  listenToNativeEvent(domEventName, false, rootContainerElement);
                }
                listenToNativeEvent(domEventName, true, rootContainerElement);
              }
            });
            const ownerDocument = rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
            if (ownerDocument !== null) {
              if (!ownerDocument[listeningMarker]) {
                ownerDocument[listeningMarker] = true;
                listenToNativeEvent("selectionchange", false, ownerDocument);
              }
            }
          }
        }
        function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener, isDeferredListenerForLegacyFBSupport) {
          const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
          let isPassiveListener = void 0;
          if (passiveBrowserEventsSupported) {
            if (domEventName === "touchstart" || domEventName === "touchmove" || domEventName === "wheel") {
              isPassiveListener = true;
            }
          }
          targetContainer = targetContainer;
          let unsubscribeListener;
          if (isCapturePhaseListener) {
            if (isPassiveListener !== void 0) {
              unsubscribeListener = addEventCaptureListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
            } else {
              unsubscribeListener = addEventCaptureListener(targetContainer, domEventName, listener);
            }
          } else {
            if (isPassiveListener !== void 0) {
              unsubscribeListener = addEventBubbleListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
            } else {
              unsubscribeListener = addEventBubbleListener(targetContainer, domEventName, listener);
            }
          }
        }
        function isMatchingRootContainer(grandContainer, targetContainer) {
          return grandContainer === targetContainer || grandContainer.nodeType === COMMENT_NODE && grandContainer.parentNode === targetContainer;
        }
        function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
          let ancestorInst = targetInst;
          if ((eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE) === 0 && (eventSystemFlags & IS_NON_DELEGATED) === 0) {
            const targetContainerNode = targetContainer;
            if (targetInst !== null) {
              let node = targetInst;
              mainLoop: while (true) {
                if (node === null) {
                  return;
                }
                const nodeTag = node.tag;
                if (nodeTag === HostRoot || nodeTag === HostPortal) {
                  let container = node.stateNode.containerInfo;
                  if (isMatchingRootContainer(container, targetContainerNode)) {
                    break;
                  }
                  if (nodeTag === HostPortal) {
                    let grandNode = node.return;
                    while (grandNode !== null) {
                      const grandTag = grandNode.tag;
                      if (grandTag === HostRoot || grandTag === HostPortal) {
                        const grandContainer = grandNode.stateNode.containerInfo;
                        if (isMatchingRootContainer(grandContainer, targetContainerNode)) {
                          return;
                        }
                      }
                      grandNode = grandNode.return;
                    }
                  }
                  while (container !== null) {
                    const parentNode = getClosestInstanceFromNode(container);
                    if (parentNode === null) {
                      return;
                    }
                    const parentTag = parentNode.tag;
                    if (parentTag === HostComponent || parentTag === HostText) {
                      node = ancestorInst = parentNode;
                      continue mainLoop;
                    }
                    container = container.parentNode;
                  }
                }
                node = node.return;
              }
            }
          }
          batchedUpdates(function() {
            return dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, ancestorInst);
          });
        }
        function createDispatchListener(instance, listener, currentTarget) {
          return {
            instance,
            listener,
            currentTarget
          };
        }
        function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase, accumulateTargetOnly, nativeEvent) {
          const captureName = reactName !== null ? reactName + "Capture" : null;
          const reactEventName = inCapturePhase ? captureName : reactName;
          const listeners = [];
          let instance = targetFiber;
          let lastHostComponent = null;
          while (instance !== null) {
            const _instance2 = instance, stateNode = _instance2.stateNode, tag = _instance2.tag;
            if (tag === HostComponent && stateNode !== null) {
              lastHostComponent = stateNode;
              if (reactEventName !== null) {
                const listener = getListener(instance, reactEventName);
                if (listener != null) {
                  listeners.push(createDispatchListener(instance, listener, lastHostComponent));
                }
              }
            }
            if (accumulateTargetOnly) {
              break;
            }
            instance = instance.return;
          }
          return listeners;
        }
        function accumulateTwoPhaseListeners(targetFiber, reactName) {
          const captureName = reactName + "Capture";
          const listeners = [];
          let instance = targetFiber;
          while (instance !== null) {
            const _instance3 = instance, stateNode = _instance3.stateNode, tag = _instance3.tag;
            if (tag === HostComponent && stateNode !== null) {
              const currentTarget = stateNode;
              const captureListener = getListener(instance, captureName);
              if (captureListener != null) {
                listeners.unshift(createDispatchListener(instance, captureListener, currentTarget));
              }
              const bubbleListener = getListener(instance, reactName);
              if (bubbleListener != null) {
                listeners.push(createDispatchListener(instance, bubbleListener, currentTarget));
              }
            }
            instance = instance.return;
          }
          return listeners;
        }
        function getParent(inst) {
          if (inst === null) {
            return null;
          }
          do {
            inst = inst.return;
          } while (inst && inst.tag !== HostComponent);
          if (inst) {
            return inst;
          }
          return null;
        }
        function getLowestCommonAncestor(instA, instB) {
          let nodeA = instA;
          let nodeB = instB;
          let depthA = 0;
          for (let tempA = nodeA; tempA; tempA = getParent(tempA)) {
            depthA++;
          }
          let depthB = 0;
          for (let tempB = nodeB; tempB; tempB = getParent(tempB)) {
            depthB++;
          }
          while (depthA - depthB > 0) {
            nodeA = getParent(nodeA);
            depthA--;
          }
          while (depthB - depthA > 0) {
            nodeB = getParent(nodeB);
            depthB--;
          }
          let depth = depthA;
          while (depth--) {
            if (nodeA === nodeB || nodeB !== null && nodeA === nodeB.alternate) {
              return nodeA;
            }
            nodeA = getParent(nodeA);
            nodeB = getParent(nodeB);
          }
          return null;
        }
        function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
          const registrationName = event._reactName;
          const listeners = [];
          let instance = target;
          while (instance !== null) {
            if (instance === common) {
              break;
            }
            const _instance4 = instance, alternate = _instance4.alternate, stateNode = _instance4.stateNode, tag = _instance4.tag;
            if (alternate !== null && alternate === common) {
              break;
            }
            if (tag === HostComponent && stateNode !== null) {
              const currentTarget = stateNode;
              if (inCapturePhase) {
                const captureListener = getListener(instance, registrationName);
                if (captureListener != null) {
                  listeners.unshift(createDispatchListener(instance, captureListener, currentTarget));
                }
              } else if (!inCapturePhase) {
                const bubbleListener = getListener(instance, registrationName);
                if (bubbleListener != null) {
                  listeners.push(createDispatchListener(instance, bubbleListener, currentTarget));
                }
              }
            }
            instance = instance.return;
          }
          if (listeners.length !== 0) {
            dispatchQueue.push({
              event,
              listeners
            });
          }
        }
        function accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leaveEvent, enterEvent, from, to) {
          const common = from && to ? getLowestCommonAncestor(from, to) : null;
          if (from !== null) {
            accumulateEnterLeaveListenersForEvent(dispatchQueue, leaveEvent, from, common, false);
          }
          if (to !== null && enterEvent !== null) {
            accumulateEnterLeaveListenersForEvent(dispatchQueue, enterEvent, to, common, true);
          }
        }
        function getListenerSetKey(domEventName, capture) {
          return domEventName + "__" + (capture ? "capture" : "bubble");
        }
        let didWarnInvalidHydration = false;
        const DANGEROUSLY_SET_INNER_HTML = "dangerouslySetInnerHTML";
        const SUPPRESS_CONTENT_EDITABLE_WARNING = "suppressContentEditableWarning";
        const SUPPRESS_HYDRATION_WARNING = "suppressHydrationWarning";
        const AUTOFOCUS = "autoFocus";
        const CHILDREN = "children";
        const STYLE = "style";
        const HTML$1 = "__html";
        let warnedUnknownTags;
        let validatePropertiesInDevelopment;
        let warnForPropDifference;
        let warnForExtraAttributes;
        let warnForInvalidEventListener;
        let canDiffStyleForHydrationWarning;
        let normalizeHTML;
        {
          warnedUnknownTags = {
            // There are working polyfills for <dialog>. Let people use it.
            dialog: true,
            // Electron ships a custom <webview> tag to display external web content in
            // an isolated frame and process.
            // This tag is not present in non Electron environments such as JSDom which
            // is often used for testing purposes.
            // @see https://electronjs.org/docs/api/webview-tag
            webview: true
          };
          validatePropertiesInDevelopment = function(type, props) {
            validateProperties(type, props);
            validateProperties$1(type, props);
            validateProperties$2(type, props, {
              registrationNameDependencies,
              possibleRegistrationNames
            });
          };
          canDiffStyleForHydrationWarning = canUseDOM && !document.documentMode;
          warnForPropDifference = function(propName, serverValue, clientValue) {
            if (didWarnInvalidHydration) {
              return;
            }
            const normalizedClientValue = normalizeMarkupForTextOrAttribute(clientValue);
            const normalizedServerValue = normalizeMarkupForTextOrAttribute(serverValue);
            if (normalizedServerValue === normalizedClientValue) {
              return;
            }
            didWarnInvalidHydration = true;
            error("Prop `%s` did not match. Server: %s Client: %s", propName, JSON.stringify(normalizedServerValue), JSON.stringify(normalizedClientValue));
          };
          warnForExtraAttributes = function(attributeNames) {
            if (didWarnInvalidHydration) {
              return;
            }
            didWarnInvalidHydration = true;
            const names = [];
            attributeNames.forEach(function(name) {
              names.push(name);
            });
            error("Extra attributes from the server: %s", names);
          };
          warnForInvalidEventListener = function(registrationName, listener) {
            if (listener === false) {
              error("Expected `%s` listener to be a function, instead got `false`.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.", registrationName, registrationName, registrationName);
            } else {
              error("Expected `%s` listener to be a function, instead got a value of `%s` type.", registrationName, typeof listener);
            }
          };
          normalizeHTML = function(parent, html) {
            const testElement = parent.namespaceURI === HTML_NAMESPACE ? parent.ownerDocument.createElement(parent.tagName) : parent.ownerDocument.createElementNS(parent.namespaceURI, parent.tagName);
            testElement.innerHTML = html;
            return testElement.innerHTML;
          };
        }
        const NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
        const NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
        function normalizeMarkupForTextOrAttribute(markup) {
          {
            checkHtmlStringCoercion(markup);
          }
          const markupString = typeof markup === "string" ? markup : "" + markup;
          return markupString.replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
        }
        function checkForUnmatchedText(serverText, clientText, isConcurrentMode, shouldWarnDev) {
          const normalizedClientText = normalizeMarkupForTextOrAttribute(clientText);
          const normalizedServerText = normalizeMarkupForTextOrAttribute(serverText);
          if (normalizedServerText === normalizedClientText) {
            return;
          }
          if (shouldWarnDev) {
            {
              if (!didWarnInvalidHydration) {
                didWarnInvalidHydration = true;
                error('Text content did not match. Server: "%s" Client: "%s"', normalizedServerText, normalizedClientText);
              }
            }
          }
          if (isConcurrentMode && enableClientRenderFallbackOnTextMismatch) {
            throw new Error("Text content does not match server-rendered HTML.");
          }
        }
        function getOwnerDocumentFromRootContainer(rootContainerElement) {
          return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
        }
        function noop() {
        }
        function trapClickOnNonInteractiveElement(node) {
          node.onclick = noop;
        }
        function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
          for (const propKey in nextProps) {
            if (!nextProps.hasOwnProperty(propKey)) {
              continue;
            }
            const nextProp = nextProps[propKey];
            if (propKey === STYLE) {
              {
                if (nextProp) {
                  Object.freeze(nextProp);
                }
              }
              setValueForStyles(domElement, nextProp);
            } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
              const nextHtml = nextProp ? nextProp[HTML$1] : void 0;
              if (nextHtml != null) {
                setInnerHTML(domElement, nextHtml);
              }
            } else if (propKey === CHILDREN) {
              if (typeof nextProp === "string") {
                const canSetTextContent = tag !== "textarea" || nextProp !== "";
                if (canSetTextContent) {
                  setTextContent(domElement, nextProp);
                }
              } else if (typeof nextProp === "number") {
                setTextContent(domElement, "" + nextProp);
              }
            } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;
            else if (propKey === AUTOFOCUS) ;
            else if (registrationNameDependencies.hasOwnProperty(propKey)) {
              if (nextProp != null) {
                if (typeof nextProp !== "function") {
                  warnForInvalidEventListener(propKey, nextProp);
                }
                if (propKey === "onScroll") {
                  listenToNonDelegatedEvent("scroll", domElement);
                }
              }
            } else if (nextProp != null) {
              setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
            }
          }
        }
        function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
          for (let i = 0; i < updatePayload.length; i += 2) {
            const propKey = updatePayload[i];
            const propValue = updatePayload[i + 1];
            if (propKey === STYLE) {
              setValueForStyles(domElement, propValue);
            } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
              setInnerHTML(domElement, propValue);
            } else if (propKey === CHILDREN) {
              setTextContent(domElement, propValue);
            } else {
              setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
            }
          }
        }
        function createElement(type, props, rootContainerElement, parentNamespace) {
          let isCustomComponentTag;
          const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
          let domElement;
          let namespaceURI = parentNamespace;
          if (namespaceURI === HTML_NAMESPACE) {
            namespaceURI = getIntrinsicNamespace(type);
          }
          if (namespaceURI === HTML_NAMESPACE) {
            {
              isCustomComponentTag = isCustomComponent(type, props);
              if (!isCustomComponentTag && type !== type.toLowerCase()) {
                error("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", type);
              }
            }
            if (type === "script") {
              const div = ownerDocument.createElement("div");
              div.innerHTML = "<script><\/script>";
              const firstChild = div.firstChild;
              domElement = div.removeChild(firstChild);
            } else if (typeof props.is === "string") {
              domElement = ownerDocument.createElement(type, {
                is: props.is
              });
            } else {
              domElement = ownerDocument.createElement(type);
              if (type === "select") {
                const node = domElement;
                if (props.multiple) {
                  node.multiple = true;
                } else if (props.size) {
                  node.size = props.size;
                }
              }
            }
          } else {
            domElement = ownerDocument.createElementNS(namespaceURI, type);
          }
          {
            if (namespaceURI === HTML_NAMESPACE) {
              if (!isCustomComponentTag && Object.prototype.toString.call(domElement) === "[object HTMLUnknownElement]" && !hasOwnProperty.call(warnedUnknownTags, type)) {
                warnedUnknownTags[type] = true;
                error("The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.", type);
              }
            }
          }
          return domElement;
        }
        function createTextNode(text, rootContainerElement) {
          return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
        }
        function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
          const isCustomComponentTag = isCustomComponent(tag, rawProps);
          {
            validatePropertiesInDevelopment(tag, rawProps);
          }
          let props;
          switch (tag) {
            case "dialog":
              listenToNonDelegatedEvent("cancel", domElement);
              listenToNonDelegatedEvent("close", domElement);
              props = rawProps;
              break;
            case "iframe":
            case "object":
            case "embed":
              listenToNonDelegatedEvent("load", domElement);
              props = rawProps;
              break;
            case "video":
            case "audio":
              for (let i = 0; i < mediaEventTypes.length; i++) {
                listenToNonDelegatedEvent(mediaEventTypes[i], domElement);
              }
              props = rawProps;
              break;
            case "source":
              listenToNonDelegatedEvent("error", domElement);
              props = rawProps;
              break;
            case "img":
            case "image":
            case "link":
              listenToNonDelegatedEvent("error", domElement);
              listenToNonDelegatedEvent("load", domElement);
              props = rawProps;
              break;
            case "details":
              listenToNonDelegatedEvent("toggle", domElement);
              props = rawProps;
              break;
            case "input":
              initWrapperState(domElement, rawProps);
              props = getHostProps(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
            case "option":
              validateProps(domElement, rawProps);
              props = rawProps;
              break;
            case "select":
              initWrapperState$1(domElement, rawProps);
              props = getHostProps$1(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
            case "textarea":
              initWrapperState$2(domElement, rawProps);
              props = getHostProps$2(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
            default:
              props = rawProps;
          }
          assertValidProps(tag, props);
          setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);
          switch (tag) {
            case "input":
              track(domElement);
              postMountWrapper(domElement, rawProps, false);
              break;
            case "textarea":
              track(domElement);
              postMountWrapper$3(domElement);
              break;
            case "option":
              postMountWrapper$1(domElement, rawProps);
              break;
            case "select":
              postMountWrapper$2(domElement, rawProps);
              break;
            default:
              if (typeof props.onClick === "function") {
                trapClickOnNonInteractiveElement(domElement);
              }
              break;
          }
        }
        function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
          {
            validatePropertiesInDevelopment(tag, nextRawProps);
          }
          let updatePayload = null;
          let lastProps;
          let nextProps;
          switch (tag) {
            case "input":
              lastProps = getHostProps(domElement, lastRawProps);
              nextProps = getHostProps(domElement, nextRawProps);
              updatePayload = [];
              break;
            case "select":
              lastProps = getHostProps$1(domElement, lastRawProps);
              nextProps = getHostProps$1(domElement, nextRawProps);
              updatePayload = [];
              break;
            case "textarea":
              lastProps = getHostProps$2(domElement, lastRawProps);
              nextProps = getHostProps$2(domElement, nextRawProps);
              updatePayload = [];
              break;
            default:
              lastProps = lastRawProps;
              nextProps = nextRawProps;
              if (typeof lastProps.onClick !== "function" && typeof nextProps.onClick === "function") {
                trapClickOnNonInteractiveElement(domElement);
              }
              break;
          }
          assertValidProps(tag, nextProps);
          let propKey;
          let styleName;
          let styleUpdates = null;
          for (propKey in lastProps) {
            if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
              continue;
            }
            if (propKey === STYLE) {
              const lastStyle = lastProps[propKey];
              for (styleName in lastStyle) {
                if (lastStyle.hasOwnProperty(styleName)) {
                  if (!styleUpdates) {
                    styleUpdates = {};
                  }
                  styleUpdates[styleName] = "";
                }
              }
            } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) ;
            else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;
            else if (propKey === AUTOFOCUS) ;
            else if (registrationNameDependencies.hasOwnProperty(propKey)) {
              if (!updatePayload) {
                updatePayload = [];
              }
            } else {
              (updatePayload = updatePayload || []).push(propKey, null);
            }
          }
          for (propKey in nextProps) {
            const nextProp = nextProps[propKey];
            const lastProp = lastProps != null ? lastProps[propKey] : void 0;
            if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
              continue;
            }
            if (propKey === STYLE) {
              {
                if (nextProp) {
                  Object.freeze(nextProp);
                }
              }
              if (lastProp) {
                for (styleName in lastProp) {
                  if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                    if (!styleUpdates) {
                      styleUpdates = {};
                    }
                    styleUpdates[styleName] = "";
                  }
                }
                for (styleName in nextProp) {
                  if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
                    if (!styleUpdates) {
                      styleUpdates = {};
                    }
                    styleUpdates[styleName] = nextProp[styleName];
                  }
                }
              } else {
                if (!styleUpdates) {
                  if (!updatePayload) {
                    updatePayload = [];
                  }
                  updatePayload.push(propKey, styleUpdates);
                }
                styleUpdates = nextProp;
              }
            } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
              const nextHtml = nextProp ? nextProp[HTML$1] : void 0;
              const lastHtml = lastProp ? lastProp[HTML$1] : void 0;
              if (nextHtml != null) {
                if (lastHtml !== nextHtml) {
                  (updatePayload = updatePayload || []).push(propKey, nextHtml);
                }
              }
            } else if (propKey === CHILDREN) {
              if (typeof nextProp === "string" || typeof nextProp === "number") {
                (updatePayload = updatePayload || []).push(propKey, "" + nextProp);
              }
            } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;
            else if (registrationNameDependencies.hasOwnProperty(propKey)) {
              if (nextProp != null) {
                if (typeof nextProp !== "function") {
                  warnForInvalidEventListener(propKey, nextProp);
                }
                if (propKey === "onScroll") {
                  listenToNonDelegatedEvent("scroll", domElement);
                }
              }
              if (!updatePayload && lastProp !== nextProp) {
                updatePayload = [];
              }
            } else {
              (updatePayload = updatePayload || []).push(propKey, nextProp);
            }
          }
          if (styleUpdates) {
            {
              validateShorthandPropertyCollisionInDev(styleUpdates, nextProps[STYLE]);
            }
            (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
          }
          return updatePayload;
        }
        function updateProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
          if (tag === "input" && nextRawProps.type === "radio" && nextRawProps.name != null) {
            updateChecked(domElement, nextRawProps);
          }
          const wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
          const isCustomComponentTag = isCustomComponent(tag, nextRawProps);
          updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);
          switch (tag) {
            case "input":
              updateWrapper(domElement, nextRawProps);
              break;
            case "textarea":
              updateWrapper$1(domElement, nextRawProps);
              break;
            case "select":
              postUpdateWrapper(domElement, nextRawProps);
              break;
          }
        }
        function getPossibleStandardName(propName) {
          {
            const lowerCasedName = propName.toLowerCase();
            if (!possibleStandardNames.hasOwnProperty(lowerCasedName)) {
              return null;
            }
            return possibleStandardNames[lowerCasedName] || null;
          }
        }
        function diffHydratedProperties(domElement, tag, rawProps, parentNamespace, rootContainerElement, isConcurrentMode, shouldWarnDev) {
          let isCustomComponentTag;
          let extraAttributeNames;
          {
            isCustomComponentTag = isCustomComponent(tag, rawProps);
            validatePropertiesInDevelopment(tag, rawProps);
          }
          switch (tag) {
            case "dialog":
              listenToNonDelegatedEvent("cancel", domElement);
              listenToNonDelegatedEvent("close", domElement);
              break;
            case "iframe":
            case "object":
            case "embed":
              listenToNonDelegatedEvent("load", domElement);
              break;
            case "video":
            case "audio":
              for (let i = 0; i < mediaEventTypes.length; i++) {
                listenToNonDelegatedEvent(mediaEventTypes[i], domElement);
              }
              break;
            case "source":
              listenToNonDelegatedEvent("error", domElement);
              break;
            case "img":
            case "image":
            case "link":
              listenToNonDelegatedEvent("error", domElement);
              listenToNonDelegatedEvent("load", domElement);
              break;
            case "details":
              listenToNonDelegatedEvent("toggle", domElement);
              break;
            case "input":
              initWrapperState(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
            case "option":
              validateProps(domElement, rawProps);
              break;
            case "select":
              initWrapperState$1(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
            case "textarea":
              initWrapperState$2(domElement, rawProps);
              listenToNonDelegatedEvent("invalid", domElement);
              break;
          }
          assertValidProps(tag, rawProps);
          {
            extraAttributeNames = /* @__PURE__ */ new Set();
            const attributes = domElement.attributes;
            for (let _i = 0; _i < attributes.length; _i++) {
              const name = attributes[_i].name.toLowerCase();
              switch (name) {
                case "value":
                  break;
                case "checked":
                  break;
                case "selected":
                  break;
                default:
                  extraAttributeNames.add(attributes[_i].name);
              }
            }
          }
          let updatePayload = null;
          for (const propKey in rawProps) {
            if (!rawProps.hasOwnProperty(propKey)) {
              continue;
            }
            const nextProp = rawProps[propKey];
            if (propKey === CHILDREN) {
              if (typeof nextProp === "string") {
                if (domElement.textContent !== nextProp) {
                  if (rawProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                    checkForUnmatchedText(domElement.textContent, nextProp, isConcurrentMode, shouldWarnDev);
                  }
                  updatePayload = [CHILDREN, nextProp];
                }
              } else if (typeof nextProp === "number") {
                if (domElement.textContent !== "" + nextProp) {
                  if (rawProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                    checkForUnmatchedText(domElement.textContent, nextProp, isConcurrentMode, shouldWarnDev);
                  }
                  updatePayload = [CHILDREN, "" + nextProp];
                }
              }
            } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
              if (nextProp != null) {
                if (typeof nextProp !== "function") {
                  warnForInvalidEventListener(propKey, nextProp);
                }
                if (propKey === "onScroll") {
                  listenToNonDelegatedEvent("scroll", domElement);
                }
              }
            } else if (shouldWarnDev && true && // Convince Flow we've calculated it (it's DEV-only in this method.)
            typeof isCustomComponentTag === "boolean") {
              let serverValue = void 0;
              const propertyInfo = isCustomComponentTag && enableCustomElementPropertySupport ? null : getPropertyInfo(propKey);
              if (rawProps[SUPPRESS_HYDRATION_WARNING] === true) ;
              else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING || // Controlled attributes are not validated
              // TODO: Only ignore them on controlled tags.
              propKey === "value" || propKey === "checked" || propKey === "selected") ;
              else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                const serverHTML = domElement.innerHTML;
                const nextHtml = nextProp ? nextProp[HTML$1] : void 0;
                if (nextHtml != null) {
                  const expectedHTML = normalizeHTML(domElement, nextHtml);
                  if (expectedHTML !== serverHTML) {
                    warnForPropDifference(propKey, serverHTML, expectedHTML);
                  }
                }
              } else if (propKey === STYLE) {
                extraAttributeNames.delete(propKey);
                if (canDiffStyleForHydrationWarning) {
                  const expectedStyle = createDangerousStringForStyles(nextProp);
                  serverValue = domElement.getAttribute("style");
                  if (expectedStyle !== serverValue) {
                    warnForPropDifference(propKey, serverValue, expectedStyle);
                  }
                }
              } else if (isCustomComponentTag && !enableCustomElementPropertySupport) {
                extraAttributeNames.delete(propKey.toLowerCase());
                serverValue = getValueForAttribute(domElement, propKey, nextProp);
                if (nextProp !== serverValue) {
                  warnForPropDifference(propKey, serverValue, nextProp);
                }
              } else if (!shouldIgnoreAttribute(propKey, propertyInfo, isCustomComponentTag) && !shouldRemoveAttribute(propKey, nextProp, propertyInfo, isCustomComponentTag)) {
                let isMismatchDueToBadCasing = false;
                if (propertyInfo !== null) {
                  extraAttributeNames.delete(propertyInfo.attributeName);
                  serverValue = getValueForProperty(domElement, propKey, nextProp, propertyInfo);
                } else {
                  let ownNamespace = parentNamespace;
                  if (ownNamespace === HTML_NAMESPACE) {
                    ownNamespace = getIntrinsicNamespace(tag);
                  }
                  if (ownNamespace === HTML_NAMESPACE) {
                    extraAttributeNames.delete(propKey.toLowerCase());
                  } else {
                    const standardName = getPossibleStandardName(propKey);
                    if (standardName !== null && standardName !== propKey) {
                      isMismatchDueToBadCasing = true;
                      extraAttributeNames.delete(standardName);
                    }
                    extraAttributeNames.delete(propKey);
                  }
                  serverValue = getValueForAttribute(domElement, propKey, nextProp);
                }
                const dontWarnCustomElement = enableCustomElementPropertySupport;
                if (!dontWarnCustomElement && nextProp !== serverValue && !isMismatchDueToBadCasing) {
                  warnForPropDifference(propKey, serverValue, nextProp);
                }
              }
            }
          }
          {
            if (shouldWarnDev) {
              if (
                // $FlowFixMe - Should be inferred as not undefined.
                extraAttributeNames.size > 0 && rawProps[SUPPRESS_HYDRATION_WARNING] !== true
              ) {
                warnForExtraAttributes(extraAttributeNames);
              }
            }
          }
          switch (tag) {
            case "input":
              track(domElement);
              postMountWrapper(domElement, rawProps, true);
              break;
            case "textarea":
              track(domElement);
              postMountWrapper$3(domElement);
              break;
            case "select":
            case "option":
              break;
            default:
              if (typeof rawProps.onClick === "function") {
                trapClickOnNonInteractiveElement(domElement);
              }
              break;
          }
          return updatePayload;
        }
        function diffHydratedText(textNode, text, isConcurrentMode) {
          const isDifferent = textNode.nodeValue !== text;
          return isDifferent;
        }
        function warnForDeletedHydratableElement(parentNode, child) {
          {
            if (didWarnInvalidHydration) {
              return;
            }
            didWarnInvalidHydration = true;
            error("Did not expect server HTML to contain a <%s> in <%s>.", child.nodeName.toLowerCase(), parentNode.nodeName.toLowerCase());
          }
        }
        function warnForDeletedHydratableText(parentNode, child) {
          {
            if (didWarnInvalidHydration) {
              return;
            }
            didWarnInvalidHydration = true;
            error('Did not expect server HTML to contain the text node "%s" in <%s>.', child.nodeValue, parentNode.nodeName.toLowerCase());
          }
        }
        function warnForInsertedHydratedElement(parentNode, tag, props) {
          {
            if (didWarnInvalidHydration) {
              return;
            }
            didWarnInvalidHydration = true;
            error("Expected server HTML to contain a matching <%s> in <%s>.", tag, parentNode.nodeName.toLowerCase());
          }
        }
        function warnForInsertedHydratedText(parentNode, text) {
          {
            if (text === "") {
              return;
            }
            if (didWarnInvalidHydration) {
              return;
            }
            didWarnInvalidHydration = true;
            error('Expected server HTML to contain a matching text node for "%s" in <%s>.', text, parentNode.nodeName.toLowerCase());
          }
        }
        function restoreControlledState$3(domElement, tag, props) {
          switch (tag) {
            case "input":
              restoreControlledState(domElement, props);
              return;
            case "textarea":
              restoreControlledState$2(domElement, props);
              return;
            case "select":
              restoreControlledState$1(domElement, props);
              return;
          }
        }
        let validateDOMNesting = function() {
        };
        let updatedAncestorInfo = function() {
        };
        {
          const specialTags = ["address", "applet", "area", "article", "aside", "base", "basefont", "bgsound", "blockquote", "body", "br", "button", "caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "img", "input", "isindex", "li", "link", "listing", "main", "marquee", "menu", "menuitem", "meta", "nav", "noembed", "noframes", "noscript", "object", "ol", "p", "param", "plaintext", "pre", "script", "section", "select", "source", "style", "summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "title", "tr", "track", "ul", "wbr", "xmp"];
          const inScopeTags = [
            "applet",
            "caption",
            "html",
            "table",
            "td",
            "th",
            "marquee",
            "object",
            "template",
            // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
            // TODO: Distinguish by namespace here -- for <title>, including it here
            // errs on the side of fewer warnings
            "foreignObject",
            "desc",
            "title"
          ];
          const buttonScopeTags = inScopeTags.concat(["button"]);
          const impliedEndTags = ["dd", "dt", "li", "option", "optgroup", "p", "rp", "rt"];
          const emptyAncestorInfo = {
            current: null,
            formTag: null,
            aTagInScope: null,
            buttonTagInScope: null,
            nobrTagInScope: null,
            pTagInButtonScope: null,
            listItemTagAutoclosing: null,
            dlItemTagAutoclosing: null
          };
          updatedAncestorInfo = function(oldInfo, tag) {
            const ancestorInfo = assign({}, oldInfo || emptyAncestorInfo);
            const info = {
              tag
            };
            if (inScopeTags.indexOf(tag) !== -1) {
              ancestorInfo.aTagInScope = null;
              ancestorInfo.buttonTagInScope = null;
              ancestorInfo.nobrTagInScope = null;
            }
            if (buttonScopeTags.indexOf(tag) !== -1) {
              ancestorInfo.pTagInButtonScope = null;
            }
            if (specialTags.indexOf(tag) !== -1 && tag !== "address" && tag !== "div" && tag !== "p") {
              ancestorInfo.listItemTagAutoclosing = null;
              ancestorInfo.dlItemTagAutoclosing = null;
            }
            ancestorInfo.current = info;
            if (tag === "form") {
              ancestorInfo.formTag = info;
            }
            if (tag === "a") {
              ancestorInfo.aTagInScope = info;
            }
            if (tag === "button") {
              ancestorInfo.buttonTagInScope = info;
            }
            if (tag === "nobr") {
              ancestorInfo.nobrTagInScope = info;
            }
            if (tag === "p") {
              ancestorInfo.pTagInButtonScope = info;
            }
            if (tag === "li") {
              ancestorInfo.listItemTagAutoclosing = info;
            }
            if (tag === "dd" || tag === "dt") {
              ancestorInfo.dlItemTagAutoclosing = info;
            }
            return ancestorInfo;
          };
          const isTagValidWithParent = function(tag, parentTag) {
            switch (parentTag) {
              case "select":
                return tag === "option" || tag === "optgroup" || tag === "#text";
              case "optgroup":
                return tag === "option" || tag === "#text";
              case "option":
                return tag === "#text";
              case "tr":
                return tag === "th" || tag === "td" || tag === "style" || tag === "script" || tag === "template";
              case "tbody":
              case "thead":
              case "tfoot":
                return tag === "tr" || tag === "style" || tag === "script" || tag === "template";
              case "colgroup":
                return tag === "col" || tag === "template";
              case "table":
                return tag === "caption" || tag === "colgroup" || tag === "tbody" || tag === "tfoot" || tag === "thead" || tag === "style" || tag === "script" || tag === "template";
              case "head":
                return tag === "base" || tag === "basefont" || tag === "bgsound" || tag === "link" || tag === "meta" || tag === "title" || tag === "noscript" || tag === "noframes" || tag === "style" || tag === "script" || tag === "template";
              case "html":
                return tag === "head" || tag === "body" || tag === "frameset";
              case "frameset":
                return tag === "frame";
              case "#document":
                return tag === "html";
            }
            switch (tag) {
              case "h1":
              case "h2":
              case "h3":
              case "h4":
              case "h5":
              case "h6":
                return parentTag !== "h1" && parentTag !== "h2" && parentTag !== "h3" && parentTag !== "h4" && parentTag !== "h5" && parentTag !== "h6";
              case "rp":
              case "rt":
                return impliedEndTags.indexOf(parentTag) === -1;
              case "body":
              case "caption":
              case "col":
              case "colgroup":
              case "frameset":
              case "frame":
              case "head":
              case "html":
              case "tbody":
              case "td":
              case "tfoot":
              case "th":
              case "thead":
              case "tr":
                return parentTag == null;
            }
            return true;
          };
          const findInvalidAncestorForTag = function(tag, ancestorInfo) {
            switch (tag) {
              case "address":
              case "article":
              case "aside":
              case "blockquote":
              case "center":
              case "details":
              case "dialog":
              case "dir":
              case "div":
              case "dl":
              case "fieldset":
              case "figcaption":
              case "figure":
              case "footer":
              case "header":
              case "hgroup":
              case "main":
              case "menu":
              case "nav":
              case "ol":
              case "p":
              case "section":
              case "summary":
              case "ul":
              case "pre":
              case "listing":
              case "table":
              case "hr":
              case "xmp":
              case "h1":
              case "h2":
              case "h3":
              case "h4":
              case "h5":
              case "h6":
                return ancestorInfo.pTagInButtonScope;
              case "form":
                return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;
              case "li":
                return ancestorInfo.listItemTagAutoclosing;
              case "dd":
              case "dt":
                return ancestorInfo.dlItemTagAutoclosing;
              case "button":
                return ancestorInfo.buttonTagInScope;
              case "a":
                return ancestorInfo.aTagInScope;
              case "nobr":
                return ancestorInfo.nobrTagInScope;
            }
            return null;
          };
          const didWarn$1 = {};
          validateDOMNesting = function(childTag, childText, ancestorInfo) {
            ancestorInfo = ancestorInfo || emptyAncestorInfo;
            const parentInfo = ancestorInfo.current;
            const parentTag = parentInfo && parentInfo.tag;
            if (childText != null) {
              if (childTag != null) {
                error("validateDOMNesting: when childText is passed, childTag should be null");
              }
              childTag = "#text";
            }
            const invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
            const invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
            const invalidParentOrAncestor = invalidParent || invalidAncestor;
            if (!invalidParentOrAncestor) {
              return;
            }
            const ancestorTag = invalidParentOrAncestor.tag;
            const warnKey = !!invalidParent + "|" + childTag + "|" + ancestorTag;
            if (didWarn$1[warnKey]) {
              return;
            }
            didWarn$1[warnKey] = true;
            let tagDisplayName = childTag;
            let whitespaceInfo = "";
            if (childTag === "#text") {
              if (/\S/.test(childText)) {
                tagDisplayName = "Text nodes";
              } else {
                tagDisplayName = "Whitespace text nodes";
                whitespaceInfo = " Make sure you don't have any extra whitespace between tags on each line of your source code.";
              }
            } else {
              tagDisplayName = "<" + childTag + ">";
            }
            if (invalidParent) {
              let info = "";
              if (ancestorTag === "table" && childTag === "tr") {
                info += " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser.";
              }
              error("validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s", tagDisplayName, ancestorTag, whitespaceInfo, info);
            } else {
              error("validateDOMNesting(...): %s cannot appear as a descendant of <%s>.", tagDisplayName, ancestorTag);
            }
          };
        }
        const SUPPRESS_HYDRATION_WARNING$1 = "suppressHydrationWarning";
        const SUSPENSE_START_DATA = "$";
        const SUSPENSE_END_DATA = "/$";
        const SUSPENSE_PENDING_START_DATA = "$?";
        const SUSPENSE_FALLBACK_START_DATA = "$!";
        const STYLE$1 = "style";
        let eventsEnabled = null;
        let selectionInformation = null;
        function getRootHostContext(rootContainerInstance) {
          let type;
          let namespace;
          const nodeType = rootContainerInstance.nodeType;
          switch (nodeType) {
            case DOCUMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE: {
              type = nodeType === DOCUMENT_NODE ? "#document" : "#fragment";
              const root2 = rootContainerInstance.documentElement;
              namespace = root2 ? root2.namespaceURI : getChildNamespace(null, "");
              break;
            }
            default: {
              const container = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance;
              const ownNamespace = container.namespaceURI || null;
              type = container.tagName;
              namespace = getChildNamespace(ownNamespace, type);
              break;
            }
          }
          {
            const validatedTag = type.toLowerCase();
            const ancestorInfo = updatedAncestorInfo(null, validatedTag);
            return {
              namespace,
              ancestorInfo
            };
          }
        }
        function getChildHostContext(parentHostContext, type, rootContainerInstance) {
          {
            const parentHostContextDev = parentHostContext;
            const namespace = getChildNamespace(parentHostContextDev.namespace, type);
            const ancestorInfo = updatedAncestorInfo(parentHostContextDev.ancestorInfo, type);
            return {
              namespace,
              ancestorInfo
            };
          }
        }
        function getPublicInstance(instance) {
          return instance;
        }
        function prepareForCommit(containerInfo) {
          eventsEnabled = isEnabled();
          selectionInformation = getSelectionInformation();
          const activeInstance = null;
          setEnabled(false);
          return activeInstance;
        }
        function resetAfterCommit(containerInfo) {
          restoreSelection(selectionInformation);
          setEnabled(eventsEnabled);
          eventsEnabled = null;
          selectionInformation = null;
        }
        function createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
          let parentNamespace;
          {
            const hostContextDev = hostContext;
            validateDOMNesting(type, null, hostContextDev.ancestorInfo);
            if (typeof props.children === "string" || typeof props.children === "number") {
              const string = "" + props.children;
              const ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
              validateDOMNesting(null, string, ownAncestorInfo);
            }
            parentNamespace = hostContextDev.namespace;
          }
          const domElement = createElement(type, props, rootContainerInstance, parentNamespace);
          precacheFiberNode(internalInstanceHandle, domElement);
          updateFiberProps(domElement, props);
          return domElement;
        }
        function appendInitialChild(parentInstance, child) {
          parentInstance.appendChild(child);
        }
        function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
          setInitialProperties(domElement, type, props, rootContainerInstance);
          switch (type) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              return !!props.autoFocus;
            case "img":
              return true;
            default:
              return false;
          }
        }
        function prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
          {
            const hostContextDev = hostContext;
            if (typeof newProps.children !== typeof oldProps.children && (typeof newProps.children === "string" || typeof newProps.children === "number")) {
              const string = "" + newProps.children;
              const ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
              validateDOMNesting(null, string, ownAncestorInfo);
            }
          }
          return diffProperties(domElement, type, oldProps, newProps);
        }
        function shouldSetTextContent(type, props) {
          return type === "textarea" || type === "noscript" || typeof props.children === "string" || typeof props.children === "number" || typeof props.dangerouslySetInnerHTML === "object" && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
        }
        function createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
          {
            const hostContextDev = hostContext;
            validateDOMNesting(null, text, hostContextDev.ancestorInfo);
          }
          const textNode = createTextNode(text, rootContainerInstance);
          precacheFiberNode(internalInstanceHandle, textNode);
          return textNode;
        }
        function getCurrentEventPriority() {
          const currentEvent = window.event;
          if (currentEvent === void 0) {
            return DefaultEventPriority;
          }
          return getEventPriority(currentEvent.type);
        }
        const scheduleTimeout = typeof setTimeout === "function" ? setTimeout : void 0;
        const cancelTimeout = typeof clearTimeout === "function" ? clearTimeout : void 0;
        const noTimeout = -1;
        const localPromise = typeof Promise === "function" ? Promise : void 0;
        const scheduleMicrotask = typeof queueMicrotask === "function" ? queueMicrotask : typeof localPromise !== "undefined" ? function(callback) {
          return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
        } : scheduleTimeout;
        function handleErrorInNextTick(error2) {
          setTimeout(function() {
            throw error2;
          });
        }
        function commitMount(domElement, type, newProps, internalInstanceHandle) {
          switch (type) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              if (newProps.autoFocus) {
                domElement.focus();
              }
              return;
            case "img": {
              if (newProps.src) {
                domElement.src = newProps.src;
              }
              return;
            }
          }
        }
        function commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
          updateProperties(domElement, updatePayload, type, oldProps, newProps);
          updateFiberProps(domElement, newProps);
        }
        function resetTextContent(domElement) {
          setTextContent(domElement, "");
        }
        function commitTextUpdate(textInstance, oldText, newText) {
          textInstance.nodeValue = newText;
        }
        function appendChild(parentInstance, child) {
          parentInstance.appendChild(child);
        }
        function appendChildToContainer(container, child) {
          let parentNode;
          if (container.nodeType === COMMENT_NODE) {
            parentNode = container.parentNode;
            parentNode.insertBefore(child, container);
          } else {
            parentNode = container;
            parentNode.appendChild(child);
          }
          const reactRootContainer = container._reactRootContainer;
          if ((reactRootContainer === null || reactRootContainer === void 0) && parentNode.onclick === null) {
            trapClickOnNonInteractiveElement(parentNode);
          }
        }
        function insertBefore(parentInstance, child, beforeChild) {
          parentInstance.insertBefore(child, beforeChild);
        }
        function insertInContainerBefore(container, child, beforeChild) {
          if (container.nodeType === COMMENT_NODE) {
            container.parentNode.insertBefore(child, beforeChild);
          } else {
            container.insertBefore(child, beforeChild);
          }
        }
        function removeChild(parentInstance, child) {
          parentInstance.removeChild(child);
        }
        function removeChildFromContainer(container, child) {
          if (container.nodeType === COMMENT_NODE) {
            container.parentNode.removeChild(child);
          } else {
            container.removeChild(child);
          }
        }
        function clearSuspenseBoundary(parentInstance, suspenseInstance) {
          let node = suspenseInstance;
          let depth = 0;
          do {
            const nextNode = node.nextSibling;
            parentInstance.removeChild(node);
            if (nextNode && nextNode.nodeType === COMMENT_NODE) {
              const data = nextNode.data;
              if (data === SUSPENSE_END_DATA) {
                if (depth === 0) {
                  parentInstance.removeChild(nextNode);
                  retryIfBlockedOn(suspenseInstance);
                  return;
                } else {
                  depth--;
                }
              } else if (data === SUSPENSE_START_DATA || data === SUSPENSE_PENDING_START_DATA || data === SUSPENSE_FALLBACK_START_DATA) {
                depth++;
              }
            }
            node = nextNode;
          } while (node);
          retryIfBlockedOn(suspenseInstance);
        }
        function clearSuspenseBoundaryFromContainer(container, suspenseInstance) {
          if (container.nodeType === COMMENT_NODE) {
            clearSuspenseBoundary(container.parentNode, suspenseInstance);
          } else if (container.nodeType === ELEMENT_NODE) {
            clearSuspenseBoundary(container, suspenseInstance);
          }
          retryIfBlockedOn(container);
        }
        function hideInstance(instance) {
          instance = instance;
          const style2 = instance.style;
          if (typeof style2.setProperty === "function") {
            style2.setProperty("display", "none", "important");
          } else {
            style2.display = "none";
          }
        }
        function hideTextInstance(textInstance) {
          textInstance.nodeValue = "";
        }
        function unhideInstance(instance, props) {
          instance = instance;
          const styleProp = props[STYLE$1];
          const display = styleProp !== void 0 && styleProp !== null && styleProp.hasOwnProperty("display") ? styleProp.display : null;
          instance.style.display = dangerousStyleValue("display", display);
        }
        function unhideTextInstance(textInstance, text) {
          textInstance.nodeValue = text;
        }
        function clearContainer(container) {
          if (container.nodeType === ELEMENT_NODE) {
            container.textContent = "";
          } else if (container.nodeType === DOCUMENT_NODE) {
            if (container.documentElement) {
              container.removeChild(container.documentElement);
            }
          }
        }
        function canHydrateInstance(instance, type, props) {
          if (instance.nodeType !== ELEMENT_NODE || type.toLowerCase() !== instance.nodeName.toLowerCase()) {
            return null;
          }
          return instance;
        }
        function canHydrateTextInstance(instance, text) {
          if (text === "" || instance.nodeType !== TEXT_NODE) {
            return null;
          }
          return instance;
        }
        function canHydrateSuspenseInstance(instance) {
          if (instance.nodeType !== COMMENT_NODE) {
            return null;
          }
          return instance;
        }
        function isSuspenseInstancePending(instance) {
          return instance.data === SUSPENSE_PENDING_START_DATA;
        }
        function isSuspenseInstanceFallback(instance) {
          return instance.data === SUSPENSE_FALLBACK_START_DATA;
        }
        function getSuspenseInstanceFallbackErrorDetails(instance) {
          const dataset = instance.nextSibling && instance.nextSibling.dataset;
          let digest, message, stack;
          if (dataset) {
            digest = dataset.dgst;
            {
              message = dataset.msg;
              stack = dataset.stck;
            }
          }
          {
            return {
              message,
              digest,
              stack
            };
          }
        }
        function registerSuspenseInstanceRetry(instance, callback) {
          instance._reactRetry = callback;
        }
        function getNextHydratable(node) {
          for (; node != null; node = node.nextSibling) {
            const nodeType = node.nodeType;
            if (nodeType === ELEMENT_NODE || nodeType === TEXT_NODE) {
              break;
            }
            if (nodeType === COMMENT_NODE) {
              const nodeData = node.data;
              if (nodeData === SUSPENSE_START_DATA || nodeData === SUSPENSE_FALLBACK_START_DATA || nodeData === SUSPENSE_PENDING_START_DATA) {
                break;
              }
              if (nodeData === SUSPENSE_END_DATA) {
                return null;
              }
            }
          }
          return node;
        }
        function getNextHydratableSibling(instance) {
          return getNextHydratable(instance.nextSibling);
        }
        function getFirstHydratableChild(parentInstance) {
          return getNextHydratable(parentInstance.firstChild);
        }
        function getFirstHydratableChildWithinContainer(parentContainer) {
          return getNextHydratable(parentContainer.firstChild);
        }
        function getFirstHydratableChildWithinSuspenseInstance(parentInstance) {
          return getNextHydratable(parentInstance.nextSibling);
        }
        function hydrateInstance(instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle, shouldWarnDev) {
          precacheFiberNode(internalInstanceHandle, instance);
          updateFiberProps(instance, props);
          let parentNamespace;
          {
            const hostContextDev = hostContext;
            parentNamespace = hostContextDev.namespace;
          }
          const isConcurrentMode = (internalInstanceHandle.mode & ConcurrentMode) !== NoMode;
          return diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance, isConcurrentMode, shouldWarnDev);
        }
        function hydrateTextInstance(textInstance, text, internalInstanceHandle, shouldWarnDev) {
          precacheFiberNode(internalInstanceHandle, textInstance);
          const isConcurrentMode = (internalInstanceHandle.mode & ConcurrentMode) !== NoMode;
          return diffHydratedText(textInstance, text);
        }
        function hydrateSuspenseInstance(suspenseInstance, internalInstanceHandle) {
          precacheFiberNode(internalInstanceHandle, suspenseInstance);
        }
        function getNextHydratableInstanceAfterSuspenseInstance(suspenseInstance) {
          let node = suspenseInstance.nextSibling;
          let depth = 0;
          while (node) {
            if (node.nodeType === COMMENT_NODE) {
              const data = node.data;
              if (data === SUSPENSE_END_DATA) {
                if (depth === 0) {
                  return getNextHydratableSibling(node);
                } else {
                  depth--;
                }
              } else if (data === SUSPENSE_START_DATA || data === SUSPENSE_FALLBACK_START_DATA || data === SUSPENSE_PENDING_START_DATA) {
                depth++;
              }
            }
            node = node.nextSibling;
          }
          return null;
        }
        function getParentSuspenseInstance(targetInstance) {
          let node = targetInstance.previousSibling;
          let depth = 0;
          while (node) {
            if (node.nodeType === COMMENT_NODE) {
              const data = node.data;
              if (data === SUSPENSE_START_DATA || data === SUSPENSE_FALLBACK_START_DATA || data === SUSPENSE_PENDING_START_DATA) {
                if (depth === 0) {
                  return node;
                } else {
                  depth--;
                }
              } else if (data === SUSPENSE_END_DATA) {
                depth++;
              }
            }
            node = node.previousSibling;
          }
          return null;
        }
        function commitHydratedContainer(container) {
          retryIfBlockedOn(container);
        }
        function commitHydratedSuspenseInstance(suspenseInstance) {
          retryIfBlockedOn(suspenseInstance);
        }
        function shouldDeleteUnhydratedTailInstances(parentType) {
          return parentType !== "head" && parentType !== "body";
        }
        function didNotMatchHydratedContainerTextInstance(parentContainer, textInstance, text, isConcurrentMode) {
          const shouldWarnDev = true;
          checkForUnmatchedText(textInstance.nodeValue, text, isConcurrentMode, shouldWarnDev);
        }
        function didNotMatchHydratedTextInstance(parentType, parentProps, parentInstance, textInstance, text, isConcurrentMode) {
          if (parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
            const shouldWarnDev = true;
            checkForUnmatchedText(textInstance.nodeValue, text, isConcurrentMode, shouldWarnDev);
          }
        }
        function didNotHydrateInstanceWithinContainer(parentContainer, instance) {
          {
            if (instance.nodeType === ELEMENT_NODE) {
              warnForDeletedHydratableElement(parentContainer, instance);
            } else if (instance.nodeType === COMMENT_NODE) ;
            else {
              warnForDeletedHydratableText(parentContainer, instance);
            }
          }
        }
        function didNotHydrateInstanceWithinSuspenseInstance(parentInstance, instance) {
          {
            const parentNode = parentInstance.parentNode;
            if (parentNode !== null) {
              if (instance.nodeType === ELEMENT_NODE) {
                warnForDeletedHydratableElement(parentNode, instance);
              } else if (instance.nodeType === COMMENT_NODE) ;
              else {
                warnForDeletedHydratableText(parentNode, instance);
              }
            }
          }
        }
        function didNotHydrateInstance(parentType, parentProps, parentInstance, instance, isConcurrentMode) {
          {
            if (isConcurrentMode || parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
              if (instance.nodeType === ELEMENT_NODE) {
                warnForDeletedHydratableElement(parentInstance, instance);
              } else if (instance.nodeType === COMMENT_NODE) ;
              else {
                warnForDeletedHydratableText(parentInstance, instance);
              }
            }
          }
        }
        function didNotFindHydratableInstanceWithinContainer(parentContainer, type, props) {
          {
            warnForInsertedHydratedElement(parentContainer, type);
          }
        }
        function didNotFindHydratableTextInstanceWithinContainer(parentContainer, text) {
          {
            warnForInsertedHydratedText(parentContainer, text);
          }
        }
        function didNotFindHydratableInstanceWithinSuspenseInstance(parentInstance, type, props) {
          {
            const parentNode = parentInstance.parentNode;
            if (parentNode !== null) warnForInsertedHydratedElement(parentNode, type);
          }
        }
        function didNotFindHydratableTextInstanceWithinSuspenseInstance(parentInstance, text) {
          {
            const parentNode = parentInstance.parentNode;
            if (parentNode !== null) warnForInsertedHydratedText(parentNode, text);
          }
        }
        function didNotFindHydratableInstance(parentType, parentProps, parentInstance, type, props, isConcurrentMode) {
          {
            if (isConcurrentMode || parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
              warnForInsertedHydratedElement(parentInstance, type);
            }
          }
        }
        function didNotFindHydratableTextInstance(parentType, parentProps, parentInstance, text, isConcurrentMode) {
          {
            if (isConcurrentMode || parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
              warnForInsertedHydratedText(parentInstance, text);
            }
          }
        }
        function errorHydratingContainer(parentContainer) {
          {
            error("An error occurred during hydration. The server HTML was replaced with client content in <%s>.", parentContainer.nodeName.toLowerCase());
          }
        }
        function preparePortalMount(portalInstance) {
          listenToAllSupportedEvents(portalInstance);
        }
        const randomKey = Math.random().toString(36).slice(2);
        const internalInstanceKey = "__reactFiber$" + randomKey;
        const internalPropsKey = "__reactProps$" + randomKey;
        const internalContainerInstanceKey = "__reactContainer$" + randomKey;
        const internalEventHandlersKey = "__reactEvents$" + randomKey;
        const internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
        const internalEventHandlesSetKey = "__reactHandles$" + randomKey;
        function detachDeletedInstance(node) {
          delete node[internalInstanceKey];
          delete node[internalPropsKey];
          delete node[internalEventHandlersKey];
          delete node[internalEventHandlerListenersKey];
          delete node[internalEventHandlesSetKey];
        }
        function precacheFiberNode(hostInst, node) {
          node[internalInstanceKey] = hostInst;
        }
        function markContainerAsRoot(hostRoot, node) {
          node[internalContainerInstanceKey] = hostRoot;
        }
        function unmarkContainerAsRoot(node) {
          node[internalContainerInstanceKey] = null;
        }
        function isContainerMarkedAsRoot(node) {
          return !!node[internalContainerInstanceKey];
        }
        function getClosestInstanceFromNode(targetNode) {
          let targetInst = targetNode[internalInstanceKey];
          if (targetInst) {
            return targetInst;
          }
          let parentNode = targetNode.parentNode;
          while (parentNode) {
            targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey];
            if (targetInst) {
              const alternate = targetInst.alternate;
              if (targetInst.child !== null || alternate !== null && alternate.child !== null) {
                let suspenseInstance = getParentSuspenseInstance(targetNode);
                while (suspenseInstance !== null) {
                  const targetSuspenseInst = suspenseInstance[internalInstanceKey];
                  if (targetSuspenseInst) {
                    return targetSuspenseInst;
                  }
                  suspenseInstance = getParentSuspenseInstance(suspenseInstance);
                }
              }
              return targetInst;
            }
            targetNode = parentNode;
            parentNode = targetNode.parentNode;
          }
          return null;
        }
        function getInstanceFromNode(node) {
          const inst = node[internalInstanceKey] || node[internalContainerInstanceKey];
          if (inst) {
            if (inst.tag === HostComponent || inst.tag === HostText || inst.tag === SuspenseComponent || inst.tag === HostRoot) {
              return inst;
            } else {
              return null;
            }
          }
          return null;
        }
        function getNodeFromInstance(inst) {
          if (inst.tag === HostComponent || inst.tag === HostText) {
            return inst.stateNode;
          }
          throw new Error("getNodeFromInstance: Invalid argument.");
        }
        function getFiberCurrentPropsFromNode(node) {
          return node[internalPropsKey] || null;
        }
        function updateFiberProps(node, props) {
          node[internalPropsKey] = props;
        }
        function getEventListenerSet(node) {
          let elementListenerSet = node[internalEventHandlersKey];
          if (elementListenerSet === void 0) {
            elementListenerSet = node[internalEventHandlersKey] = /* @__PURE__ */ new Set();
          }
          return elementListenerSet;
        }
        const loggedTypeFailures = {};
        const ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              const owner = element._owner;
              const stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            const has2 = Function.call.bind(hasOwnProperty);
            for (const typeSpecName in typeSpecs) {
              if (has2(typeSpecs, typeSpecName)) {
                let error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    const err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        const valueStack = [];
        let fiberStack;
        {
          fiberStack = [];
        }
        let index = -1;
        function createCursor(defaultValue) {
          return {
            current: defaultValue
          };
        }
        function pop(cursor, fiber) {
          if (index < 0) {
            {
              error("Unexpected pop.");
            }
            return;
          }
          {
            if (fiber !== fiberStack[index]) {
              error("Unexpected Fiber popped.");
            }
          }
          cursor.current = valueStack[index];
          valueStack[index] = null;
          {
            fiberStack[index] = null;
          }
          index--;
        }
        function push(cursor, value, fiber) {
          index++;
          valueStack[index] = cursor.current;
          {
            fiberStack[index] = fiber;
          }
          cursor.current = value;
        }
        let warnedAboutMissingGetChildContext;
        {
          warnedAboutMissingGetChildContext = {};
        }
        const emptyContextObject = {};
        {
          Object.freeze(emptyContextObject);
        }
        const contextStackCursor = createCursor(emptyContextObject);
        const didPerformWorkStackCursor = createCursor(false);
        let previousContext = emptyContextObject;
        function getUnmaskedContext(workInProgress2, Component, didPushOwnContextIfProvider) {
          {
            if (didPushOwnContextIfProvider && isContextProvider(Component)) {
              return previousContext;
            }
            return contextStackCursor.current;
          }
        }
        function cacheContext(workInProgress2, unmaskedContext, maskedContext) {
          {
            const instance = workInProgress2.stateNode;
            instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
            instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
          }
        }
        function getMaskedContext(workInProgress2, unmaskedContext) {
          {
            const type = workInProgress2.type;
            const contextTypes = type.contextTypes;
            if (!contextTypes) {
              return emptyContextObject;
            }
            const instance = workInProgress2.stateNode;
            if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
              return instance.__reactInternalMemoizedMaskedChildContext;
            }
            const context = {};
            for (const key in contextTypes) {
              context[key] = unmaskedContext[key];
            }
            {
              const name = getComponentNameFromFiber(workInProgress2) || "Unknown";
              checkPropTypes(contextTypes, context, "context", name);
            }
            if (instance) {
              cacheContext(workInProgress2, unmaskedContext, context);
            }
            return context;
          }
        }
        function hasContextChanged() {
          {
            return didPerformWorkStackCursor.current;
          }
        }
        function isContextProvider(type) {
          {
            const childContextTypes = type.childContextTypes;
            return childContextTypes !== null && childContextTypes !== void 0;
          }
        }
        function popContext(fiber) {
          {
            pop(didPerformWorkStackCursor, fiber);
            pop(contextStackCursor, fiber);
          }
        }
        function popTopLevelContextObject(fiber) {
          {
            pop(didPerformWorkStackCursor, fiber);
            pop(contextStackCursor, fiber);
          }
        }
        function pushTopLevelContextObject(fiber, context, didChange) {
          {
            if (contextStackCursor.current !== emptyContextObject) {
              throw new Error("Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.");
            }
            push(contextStackCursor, context, fiber);
            push(didPerformWorkStackCursor, didChange, fiber);
          }
        }
        function processChildContext(fiber, type, parentContext) {
          {
            const instance = fiber.stateNode;
            const childContextTypes = type.childContextTypes;
            if (typeof instance.getChildContext !== "function") {
              {
                const componentName = getComponentNameFromFiber(fiber) || "Unknown";
                if (!warnedAboutMissingGetChildContext[componentName]) {
                  warnedAboutMissingGetChildContext[componentName] = true;
                  error("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", componentName, componentName);
                }
              }
              return parentContext;
            }
            const childContext = instance.getChildContext();
            for (const contextKey in childContext) {
              if (!(contextKey in childContextTypes)) {
                throw new Error((getComponentNameFromFiber(fiber) || "Unknown") + '.getChildContext(): key "' + contextKey + '" is not defined in childContextTypes.');
              }
            }
            {
              const name = getComponentNameFromFiber(fiber) || "Unknown";
              checkPropTypes(childContextTypes, childContext, "child context", name);
            }
            return assign({}, parentContext, childContext);
          }
        }
        function pushContextProvider(workInProgress2) {
          {
            const instance = workInProgress2.stateNode;
            const memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyContextObject;
            previousContext = contextStackCursor.current;
            push(contextStackCursor, memoizedMergedChildContext, workInProgress2);
            push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress2);
            return true;
          }
        }
        function invalidateContextProvider(workInProgress2, type, didChange) {
          {
            const instance = workInProgress2.stateNode;
            if (!instance) {
              throw new Error("Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.");
            }
            if (didChange) {
              const mergedContext = processChildContext(workInProgress2, type, previousContext);
              instance.__reactInternalMemoizedMergedChildContext = mergedContext;
              pop(didPerformWorkStackCursor, workInProgress2);
              pop(contextStackCursor, workInProgress2);
              push(contextStackCursor, mergedContext, workInProgress2);
              push(didPerformWorkStackCursor, didChange, workInProgress2);
            } else {
              pop(didPerformWorkStackCursor, workInProgress2);
              push(didPerformWorkStackCursor, didChange, workInProgress2);
            }
          }
        }
        function findCurrentUnmaskedContext(fiber) {
          {
            if (!isFiberMounted(fiber) || fiber.tag !== ClassComponent) {
              throw new Error("Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.");
            }
            let node = fiber;
            do {
              switch (node.tag) {
                case HostRoot:
                  return node.stateNode.context;
                case ClassComponent: {
                  const Component = node.type;
                  if (isContextProvider(Component)) {
                    return node.stateNode.__reactInternalMemoizedMergedChildContext;
                  }
                  break;
                }
              }
              node = node.return;
            } while (node !== null);
            throw new Error("Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
        const LegacyRoot = 0;
        const ConcurrentRoot = 1;
        let syncQueue = null;
        let includesLegacySyncCallbacks = false;
        let isFlushingSyncQueue = false;
        function scheduleSyncCallback(callback) {
          if (syncQueue === null) {
            syncQueue = [callback];
          } else {
            syncQueue.push(callback);
          }
        }
        function scheduleLegacySyncCallback(callback) {
          includesLegacySyncCallbacks = true;
          scheduleSyncCallback(callback);
        }
        function flushSyncCallbacksOnlyInLegacyMode() {
          if (includesLegacySyncCallbacks) {
            flushSyncCallbacks();
          }
        }
        function flushSyncCallbacks() {
          if (!isFlushingSyncQueue && syncQueue !== null) {
            isFlushingSyncQueue = true;
            let i = 0;
            const previousUpdatePriority = getCurrentUpdatePriority();
            try {
              const isSync = true;
              const queue = syncQueue;
              setCurrentUpdatePriority(DiscreteEventPriority);
              for (; i < queue.length; i++) {
                let callback = queue[i];
                do {
                  callback = callback(isSync);
                } while (callback !== null);
              }
              syncQueue = null;
              includesLegacySyncCallbacks = false;
            } catch (error2) {
              if (syncQueue !== null) {
                syncQueue = syncQueue.slice(i + 1);
              }
              scheduleCallback(ImmediatePriority, flushSyncCallbacks);
              throw error2;
            } finally {
              setCurrentUpdatePriority(previousUpdatePriority);
              isFlushingSyncQueue = false;
            }
          }
          return null;
        }
        const forkStack = [];
        let forkStackIndex = 0;
        let treeForkProvider = null;
        let treeForkCount = 0;
        const idStack = [];
        let idStackIndex = 0;
        let treeContextProvider = null;
        let treeContextId = 1;
        let treeContextOverflow = "";
        function isForkedChild(workInProgress2) {
          warnIfNotHydrating();
          return (workInProgress2.flags & Forked) !== NoFlags;
        }
        function getForksAtLevel(workInProgress2) {
          warnIfNotHydrating();
          return treeForkCount;
        }
        function getTreeId() {
          const overflow = treeContextOverflow;
          const idWithLeadingBit = treeContextId;
          const id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
          return id.toString(32) + overflow;
        }
        function pushTreeFork(workInProgress2, totalChildren) {
          warnIfNotHydrating();
          forkStack[forkStackIndex++] = treeForkCount;
          forkStack[forkStackIndex++] = treeForkProvider;
          treeForkProvider = workInProgress2;
          treeForkCount = totalChildren;
        }
        function pushTreeId(workInProgress2, totalChildren, index2) {
          warnIfNotHydrating();
          idStack[idStackIndex++] = treeContextId;
          idStack[idStackIndex++] = treeContextOverflow;
          idStack[idStackIndex++] = treeContextProvider;
          treeContextProvider = workInProgress2;
          const baseIdWithLeadingBit = treeContextId;
          const baseOverflow = treeContextOverflow;
          const baseLength = getBitLength(baseIdWithLeadingBit) - 1;
          const baseId = baseIdWithLeadingBit & ~(1 << baseLength);
          const slot = index2 + 1;
          const length = getBitLength(totalChildren) + baseLength;
          if (length > 30) {
            const numberOfOverflowBits = baseLength - baseLength % 5;
            const newOverflowBits = (1 << numberOfOverflowBits) - 1;
            const newOverflow = (baseId & newOverflowBits).toString(32);
            const restOfBaseId = baseId >> numberOfOverflowBits;
            const restOfBaseLength = baseLength - numberOfOverflowBits;
            const restOfLength = getBitLength(totalChildren) + restOfBaseLength;
            const restOfNewBits = slot << restOfBaseLength;
            const id = restOfNewBits | restOfBaseId;
            const overflow = newOverflow + baseOverflow;
            treeContextId = 1 << restOfLength | id;
            treeContextOverflow = overflow;
          } else {
            const newBits = slot << baseLength;
            const _id = newBits | baseId;
            const _overflow = baseOverflow;
            treeContextId = 1 << length | _id;
            treeContextOverflow = _overflow;
          }
        }
        function pushMaterializedTreeId(workInProgress2) {
          warnIfNotHydrating();
          const returnFiber = workInProgress2.return;
          if (returnFiber !== null) {
            const numberOfForks = 1;
            const slotIndex = 0;
            pushTreeFork(workInProgress2, numberOfForks);
            pushTreeId(workInProgress2, numberOfForks, slotIndex);
          }
        }
        function getBitLength(number) {
          return 32 - clz32(number);
        }
        function getLeadingBit(id) {
          return 1 << getBitLength(id) - 1;
        }
        function popTreeContext(workInProgress2) {
          while (workInProgress2 === treeForkProvider) {
            treeForkProvider = forkStack[--forkStackIndex];
            forkStack[forkStackIndex] = null;
            treeForkCount = forkStack[--forkStackIndex];
            forkStack[forkStackIndex] = null;
          }
          while (workInProgress2 === treeContextProvider) {
            treeContextProvider = idStack[--idStackIndex];
            idStack[idStackIndex] = null;
            treeContextOverflow = idStack[--idStackIndex];
            idStack[idStackIndex] = null;
            treeContextId = idStack[--idStackIndex];
            idStack[idStackIndex] = null;
          }
        }
        function getSuspendedTreeContext() {
          warnIfNotHydrating();
          if (treeContextProvider !== null) {
            return {
              id: treeContextId,
              overflow: treeContextOverflow
            };
          } else {
            return null;
          }
        }
        function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
          warnIfNotHydrating();
          idStack[idStackIndex++] = treeContextId;
          idStack[idStackIndex++] = treeContextOverflow;
          idStack[idStackIndex++] = treeContextProvider;
          treeContextId = suspendedContext.id;
          treeContextOverflow = suspendedContext.overflow;
          treeContextProvider = workInProgress2;
        }
        function warnIfNotHydrating() {
          {
            if (!getIsHydrating()) {
              error("Expected to be hydrating. This is a bug in React. Please file an issue.");
            }
          }
        }
        let hydrationParentFiber = null;
        let nextHydratableInstance = null;
        let isHydrating = false;
        let didSuspendOrErrorDEV = false;
        let hydrationErrors = null;
        function warnIfHydrating() {
          {
            if (isHydrating) {
              error("We should not be hydrating here. This is a bug in React. Please file a bug.");
            }
          }
        }
        function markDidThrowWhileHydratingDEV() {
          {
            didSuspendOrErrorDEV = true;
          }
        }
        function didSuspendOrErrorWhileHydratingDEV() {
          {
            return didSuspendOrErrorDEV;
          }
        }
        function enterHydrationState(fiber) {
          const parentInstance = fiber.stateNode.containerInfo;
          nextHydratableInstance = getFirstHydratableChildWithinContainer(parentInstance);
          hydrationParentFiber = fiber;
          isHydrating = true;
          hydrationErrors = null;
          didSuspendOrErrorDEV = false;
          return true;
        }
        function reenterHydrationStateFromDehydratedSuspenseInstance(fiber, suspenseInstance, treeContext) {
          nextHydratableInstance = getFirstHydratableChildWithinSuspenseInstance(suspenseInstance);
          hydrationParentFiber = fiber;
          isHydrating = true;
          hydrationErrors = null;
          didSuspendOrErrorDEV = false;
          if (treeContext !== null) {
            restoreSuspendedTreeContext(fiber, treeContext);
          }
          return true;
        }
        function warnUnhydratedInstance(returnFiber, instance) {
          {
            switch (returnFiber.tag) {
              case HostRoot: {
                didNotHydrateInstanceWithinContainer(returnFiber.stateNode.containerInfo, instance);
                break;
              }
              case HostComponent: {
                const isConcurrentMode = (returnFiber.mode & ConcurrentMode) !== NoMode;
                didNotHydrateInstance(
                  returnFiber.type,
                  returnFiber.memoizedProps,
                  returnFiber.stateNode,
                  instance,
                  // TODO: Delete this argument when we remove the legacy root API.
                  isConcurrentMode
                );
                break;
              }
              case SuspenseComponent: {
                const suspenseState = returnFiber.memoizedState;
                if (suspenseState.dehydrated !== null) didNotHydrateInstanceWithinSuspenseInstance(suspenseState.dehydrated, instance);
                break;
              }
            }
          }
        }
        function deleteHydratableInstance(returnFiber, instance) {
          warnUnhydratedInstance(returnFiber, instance);
          const childToDelete = createFiberFromHostInstanceForDeletion();
          childToDelete.stateNode = instance;
          childToDelete.return = returnFiber;
          const deletions = returnFiber.deletions;
          if (deletions === null) {
            returnFiber.deletions = [childToDelete];
            returnFiber.flags |= ChildDeletion;
          } else {
            deletions.push(childToDelete);
          }
        }
        function warnNonhydratedInstance(returnFiber, fiber) {
          {
            if (didSuspendOrErrorDEV) {
              return;
            }
            switch (returnFiber.tag) {
              case HostRoot: {
                const parentContainer = returnFiber.stateNode.containerInfo;
                switch (fiber.tag) {
                  case HostComponent:
                    var type = fiber.type;
                    var props = fiber.pendingProps;
                    didNotFindHydratableInstanceWithinContainer(parentContainer, type);
                    break;
                  case HostText:
                    var text = fiber.pendingProps;
                    didNotFindHydratableTextInstanceWithinContainer(parentContainer, text);
                    break;
                }
                break;
              }
              case HostComponent: {
                const parentType = returnFiber.type;
                const parentProps = returnFiber.memoizedProps;
                const parentInstance = returnFiber.stateNode;
                switch (fiber.tag) {
                  case HostComponent: {
                    const _type = fiber.type;
                    const _props = fiber.pendingProps;
                    const isConcurrentMode = (returnFiber.mode & ConcurrentMode) !== NoMode;
                    didNotFindHydratableInstance(
                      parentType,
                      parentProps,
                      parentInstance,
                      _type,
                      _props,
                      // TODO: Delete this argument when we remove the legacy root API.
                      isConcurrentMode
                    );
                    break;
                  }
                  case HostText: {
                    const _text = fiber.pendingProps;
                    const _isConcurrentMode = (returnFiber.mode & ConcurrentMode) !== NoMode;
                    didNotFindHydratableTextInstance(
                      parentType,
                      parentProps,
                      parentInstance,
                      _text,
                      // TODO: Delete this argument when we remove the legacy root API.
                      _isConcurrentMode
                    );
                    break;
                  }
                }
                break;
              }
              case SuspenseComponent: {
                const suspenseState = returnFiber.memoizedState;
                const _parentInstance = suspenseState.dehydrated;
                if (_parentInstance !== null) switch (fiber.tag) {
                  case HostComponent:
                    var _type2 = fiber.type;
                    var _props2 = fiber.pendingProps;
                    didNotFindHydratableInstanceWithinSuspenseInstance(_parentInstance, _type2);
                    break;
                  case HostText:
                    var _text2 = fiber.pendingProps;
                    didNotFindHydratableTextInstanceWithinSuspenseInstance(_parentInstance, _text2);
                    break;
                }
                break;
              }
              default:
                return;
            }
          }
        }
        function insertNonHydratedInstance(returnFiber, fiber) {
          fiber.flags = fiber.flags & ~Hydrating | Placement;
          warnNonhydratedInstance(returnFiber, fiber);
        }
        function tryHydrate(fiber, nextInstance) {
          switch (fiber.tag) {
            case HostComponent: {
              const type = fiber.type;
              const props = fiber.pendingProps;
              const instance = canHydrateInstance(nextInstance, type);
              if (instance !== null) {
                fiber.stateNode = instance;
                hydrationParentFiber = fiber;
                nextHydratableInstance = getFirstHydratableChild(instance);
                return true;
              }
              return false;
            }
            case HostText: {
              const text = fiber.pendingProps;
              const textInstance = canHydrateTextInstance(nextInstance, text);
              if (textInstance !== null) {
                fiber.stateNode = textInstance;
                hydrationParentFiber = fiber;
                nextHydratableInstance = null;
                return true;
              }
              return false;
            }
            case SuspenseComponent: {
              const suspenseInstance = canHydrateSuspenseInstance(nextInstance);
              if (suspenseInstance !== null) {
                const suspenseState = {
                  dehydrated: suspenseInstance,
                  treeContext: getSuspendedTreeContext(),
                  retryLane: OffscreenLane
                };
                fiber.memoizedState = suspenseState;
                const dehydratedFragment = createFiberFromDehydratedFragment(suspenseInstance);
                dehydratedFragment.return = fiber;
                fiber.child = dehydratedFragment;
                hydrationParentFiber = fiber;
                nextHydratableInstance = null;
                return true;
              }
              return false;
            }
            default:
              return false;
          }
        }
        function shouldClientRenderOnMismatch(fiber) {
          return (fiber.mode & ConcurrentMode) !== NoMode && (fiber.flags & DidCapture) === NoFlags;
        }
        function throwOnHydrationMismatch(fiber) {
          throw new Error("Hydration failed because the initial UI does not match what was rendered on the server.");
        }
        function tryToClaimNextHydratableInstance(fiber) {
          if (!isHydrating) {
            return;
          }
          let nextInstance = nextHydratableInstance;
          if (!nextInstance) {
            if (shouldClientRenderOnMismatch(fiber)) {
              warnNonhydratedInstance(hydrationParentFiber, fiber);
              throwOnHydrationMismatch();
            }
            insertNonHydratedInstance(hydrationParentFiber, fiber);
            isHydrating = false;
            hydrationParentFiber = fiber;
            return;
          }
          const firstAttemptedInstance = nextInstance;
          if (!tryHydrate(fiber, nextInstance)) {
            if (shouldClientRenderOnMismatch(fiber)) {
              warnNonhydratedInstance(hydrationParentFiber, fiber);
              throwOnHydrationMismatch();
            }
            nextInstance = getNextHydratableSibling(firstAttemptedInstance);
            const prevHydrationParentFiber = hydrationParentFiber;
            if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
              insertNonHydratedInstance(hydrationParentFiber, fiber);
              isHydrating = false;
              hydrationParentFiber = fiber;
              return;
            }
            deleteHydratableInstance(prevHydrationParentFiber, firstAttemptedInstance);
          }
        }
        function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
          const instance = fiber.stateNode;
          const shouldWarnIfMismatchDev = !didSuspendOrErrorDEV;
          const updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber, shouldWarnIfMismatchDev);
          fiber.updateQueue = updatePayload;
          if (updatePayload !== null) {
            return true;
          }
          return false;
        }
        function prepareToHydrateHostTextInstance(fiber) {
          const textInstance = fiber.stateNode;
          const textContent = fiber.memoizedProps;
          const shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber);
          if (shouldUpdate) {
            const returnFiber = hydrationParentFiber;
            if (returnFiber !== null) {
              switch (returnFiber.tag) {
                case HostRoot: {
                  const parentContainer = returnFiber.stateNode.containerInfo;
                  const isConcurrentMode = (returnFiber.mode & ConcurrentMode) !== NoMode;
                  didNotMatchHydratedContainerTextInstance(
                    parentContainer,
                    textInstance,
                    textContent,
                    // TODO: Delete this argument when we remove the legacy root API.
                    isConcurrentMode
                  );
                  break;
                }
                case HostComponent: {
                  const parentType = returnFiber.type;
                  const parentProps = returnFiber.memoizedProps;
                  const parentInstance = returnFiber.stateNode;
                  const _isConcurrentMode2 = (returnFiber.mode & ConcurrentMode) !== NoMode;
                  didNotMatchHydratedTextInstance(
                    parentType,
                    parentProps,
                    parentInstance,
                    textInstance,
                    textContent,
                    // TODO: Delete this argument when we remove the legacy root API.
                    _isConcurrentMode2
                  );
                  break;
                }
              }
            }
          }
          return shouldUpdate;
        }
        function prepareToHydrateHostSuspenseInstance(fiber) {
          const suspenseState = fiber.memoizedState;
          const suspenseInstance = suspenseState !== null ? suspenseState.dehydrated : null;
          if (!suspenseInstance) {
            throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
          }
          hydrateSuspenseInstance(suspenseInstance, fiber);
        }
        function skipPastDehydratedSuspenseInstance(fiber) {
          const suspenseState = fiber.memoizedState;
          const suspenseInstance = suspenseState !== null ? suspenseState.dehydrated : null;
          if (!suspenseInstance) {
            throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
          }
          return getNextHydratableInstanceAfterSuspenseInstance(suspenseInstance);
        }
        function popToNextHostParent(fiber) {
          let parent = fiber.return;
          while (parent !== null && parent.tag !== HostComponent && parent.tag !== HostRoot && parent.tag !== SuspenseComponent) {
            parent = parent.return;
          }
          hydrationParentFiber = parent;
        }
        function popHydrationState(fiber) {
          if (fiber !== hydrationParentFiber) {
            return false;
          }
          if (!isHydrating) {
            popToNextHostParent(fiber);
            isHydrating = true;
            return false;
          }
          if (fiber.tag !== HostRoot && (fiber.tag !== HostComponent || shouldDeleteUnhydratedTailInstances(fiber.type) && !shouldSetTextContent(fiber.type, fiber.memoizedProps))) {
            let nextInstance = nextHydratableInstance;
            if (nextInstance) {
              if (shouldClientRenderOnMismatch(fiber)) {
                warnIfUnhydratedTailNodes(fiber);
                throwOnHydrationMismatch();
              } else {
                while (nextInstance) {
                  deleteHydratableInstance(fiber, nextInstance);
                  nextInstance = getNextHydratableSibling(nextInstance);
                }
              }
            }
          }
          popToNextHostParent(fiber);
          if (fiber.tag === SuspenseComponent) {
            nextHydratableInstance = skipPastDehydratedSuspenseInstance(fiber);
          } else {
            nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
          }
          return true;
        }
        function hasUnhydratedTailNodes() {
          return isHydrating && nextHydratableInstance !== null;
        }
        function warnIfUnhydratedTailNodes(fiber) {
          let nextInstance = nextHydratableInstance;
          while (nextInstance) {
            warnUnhydratedInstance(fiber, nextInstance);
            nextInstance = getNextHydratableSibling(nextInstance);
          }
        }
        function resetHydrationState() {
          hydrationParentFiber = null;
          nextHydratableInstance = null;
          isHydrating = false;
          didSuspendOrErrorDEV = false;
        }
        function upgradeHydrationErrorsToRecoverable() {
          if (hydrationErrors !== null) {
            queueRecoverableErrors(hydrationErrors);
            hydrationErrors = null;
          }
        }
        function getIsHydrating() {
          return isHydrating;
        }
        function queueHydrationError(error2) {
          if (hydrationErrors === null) {
            hydrationErrors = [error2];
          } else {
            hydrationErrors.push(error2);
          }
        }
        const ReactCurrentBatchConfig$1 = ReactSharedInternals.ReactCurrentBatchConfig;
        const NoTransition = null;
        function requestCurrentTransition() {
          return ReactCurrentBatchConfig$1.transition;
        }
        const ReactStrictModeWarnings = {
          recordUnsafeLifecycleWarnings: function(fiber, instance) {
          },
          flushPendingUnsafeLifecycleWarnings: function() {
          },
          recordLegacyContextWarning: function(fiber, instance) {
          },
          flushLegacyContextWarning: function() {
          },
          discardPendingWarnings: function() {
          }
        };
        {
          const findStrictRoot = function(fiber) {
            let maybeStrictRoot = null;
            let node = fiber;
            while (node !== null) {
              if (node.mode & StrictLegacyMode) {
                maybeStrictRoot = node;
              }
              node = node.return;
            }
            return maybeStrictRoot;
          };
          const setToSortedString = function(set2) {
            const array = [];
            set2.forEach(function(value) {
              array.push(value);
            });
            return array.sort().join(", ");
          };
          let pendingComponentWillMountWarnings = [];
          let pendingUNSAFE_ComponentWillMountWarnings = [];
          let pendingComponentWillReceivePropsWarnings = [];
          let pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
          let pendingComponentWillUpdateWarnings = [];
          let pendingUNSAFE_ComponentWillUpdateWarnings = [];
          const didWarnAboutUnsafeLifecycles = /* @__PURE__ */ new Set();
          ReactStrictModeWarnings.recordUnsafeLifecycleWarnings = function(fiber, instance) {
            if (didWarnAboutUnsafeLifecycles.has(fiber.type)) {
              return;
            }
            if (typeof instance.componentWillMount === "function" && // Don't warn about react-lifecycles-compat polyfilled components.
            instance.componentWillMount.__suppressDeprecationWarning !== true) {
              pendingComponentWillMountWarnings.push(fiber);
            }
            if (fiber.mode & StrictLegacyMode && typeof instance.UNSAFE_componentWillMount === "function") {
              pendingUNSAFE_ComponentWillMountWarnings.push(fiber);
            }
            if (typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
              pendingComponentWillReceivePropsWarnings.push(fiber);
            }
            if (fiber.mode & StrictLegacyMode && typeof instance.UNSAFE_componentWillReceiveProps === "function") {
              pendingUNSAFE_ComponentWillReceivePropsWarnings.push(fiber);
            }
            if (typeof instance.componentWillUpdate === "function" && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
              pendingComponentWillUpdateWarnings.push(fiber);
            }
            if (fiber.mode & StrictLegacyMode && typeof instance.UNSAFE_componentWillUpdate === "function") {
              pendingUNSAFE_ComponentWillUpdateWarnings.push(fiber);
            }
          };
          ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings = function() {
            const componentWillMountUniqueNames = /* @__PURE__ */ new Set();
            if (pendingComponentWillMountWarnings.length > 0) {
              pendingComponentWillMountWarnings.forEach(function(fiber) {
                componentWillMountUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingComponentWillMountWarnings = [];
            }
            const UNSAFE_componentWillMountUniqueNames = /* @__PURE__ */ new Set();
            if (pendingUNSAFE_ComponentWillMountWarnings.length > 0) {
              pendingUNSAFE_ComponentWillMountWarnings.forEach(function(fiber) {
                UNSAFE_componentWillMountUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingUNSAFE_ComponentWillMountWarnings = [];
            }
            const componentWillReceivePropsUniqueNames = /* @__PURE__ */ new Set();
            if (pendingComponentWillReceivePropsWarnings.length > 0) {
              pendingComponentWillReceivePropsWarnings.forEach(function(fiber) {
                componentWillReceivePropsUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingComponentWillReceivePropsWarnings = [];
            }
            const UNSAFE_componentWillReceivePropsUniqueNames = /* @__PURE__ */ new Set();
            if (pendingUNSAFE_ComponentWillReceivePropsWarnings.length > 0) {
              pendingUNSAFE_ComponentWillReceivePropsWarnings.forEach(function(fiber) {
                UNSAFE_componentWillReceivePropsUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
            }
            const componentWillUpdateUniqueNames = /* @__PURE__ */ new Set();
            if (pendingComponentWillUpdateWarnings.length > 0) {
              pendingComponentWillUpdateWarnings.forEach(function(fiber) {
                componentWillUpdateUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingComponentWillUpdateWarnings = [];
            }
            const UNSAFE_componentWillUpdateUniqueNames = /* @__PURE__ */ new Set();
            if (pendingUNSAFE_ComponentWillUpdateWarnings.length > 0) {
              pendingUNSAFE_ComponentWillUpdateWarnings.forEach(function(fiber) {
                UNSAFE_componentWillUpdateUniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutUnsafeLifecycles.add(fiber.type);
              });
              pendingUNSAFE_ComponentWillUpdateWarnings = [];
            }
            if (UNSAFE_componentWillMountUniqueNames.size > 0) {
              const sortedNames = setToSortedString(UNSAFE_componentWillMountUniqueNames);
              error("Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move code with side effects to componentDidMount, and set initial state in the constructor.\n\nPlease update the following components: %s", sortedNames);
            }
            if (UNSAFE_componentWillReceivePropsUniqueNames.size > 0) {
              const _sortedNames = setToSortedString(UNSAFE_componentWillReceivePropsUniqueNames);
              error("Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move data fetching code or side effects to componentDidUpdate.\n* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state\n\nPlease update the following components: %s", _sortedNames);
            }
            if (UNSAFE_componentWillUpdateUniqueNames.size > 0) {
              const _sortedNames2 = setToSortedString(UNSAFE_componentWillUpdateUniqueNames);
              error("Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move data fetching code or side effects to componentDidUpdate.\n\nPlease update the following components: %s", _sortedNames2);
            }
            if (componentWillMountUniqueNames.size > 0) {
              const _sortedNames3 = setToSortedString(componentWillMountUniqueNames);
              warn("componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move code with side effects to componentDidMount, and set initial state in the constructor.\n* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n\nPlease update the following components: %s", _sortedNames3);
            }
            if (componentWillReceivePropsUniqueNames.size > 0) {
              const _sortedNames4 = setToSortedString(componentWillReceivePropsUniqueNames);
              warn("componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move data fetching code or side effects to componentDidUpdate.\n* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state\n* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n\nPlease update the following components: %s", _sortedNames4);
            }
            if (componentWillUpdateUniqueNames.size > 0) {
              const _sortedNames5 = setToSortedString(componentWillUpdateUniqueNames);
              warn("componentWillUpdate has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n* Move data fetching code or side effects to componentDidUpdate.\n* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n\nPlease update the following components: %s", _sortedNames5);
            }
          };
          let pendingLegacyContextWarning = /* @__PURE__ */ new Map();
          const didWarnAboutLegacyContext = /* @__PURE__ */ new Set();
          ReactStrictModeWarnings.recordLegacyContextWarning = function(fiber, instance) {
            const strictRoot = findStrictRoot(fiber);
            if (strictRoot === null) {
              error("Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue.");
              return;
            }
            if (didWarnAboutLegacyContext.has(fiber.type)) {
              return;
            }
            let warningsForRoot = pendingLegacyContextWarning.get(strictRoot);
            if (fiber.type.contextTypes != null || fiber.type.childContextTypes != null || instance !== null && typeof instance.getChildContext === "function") {
              if (warningsForRoot === void 0) {
                warningsForRoot = [];
                pendingLegacyContextWarning.set(strictRoot, warningsForRoot);
              }
              warningsForRoot.push(fiber);
            }
          };
          ReactStrictModeWarnings.flushLegacyContextWarning = function() {
            pendingLegacyContextWarning.forEach(function(fiberArray, strictRoot) {
              if (fiberArray.length === 0) {
                return;
              }
              const firstFiber = fiberArray[0];
              const uniqueNames = /* @__PURE__ */ new Set();
              fiberArray.forEach(function(fiber) {
                uniqueNames.add(getComponentNameFromFiber(fiber) || "Component");
                didWarnAboutLegacyContext.add(fiber.type);
              });
              const sortedNames = setToSortedString(uniqueNames);
              try {
                setCurrentFiber(firstFiber);
                error("Legacy context API has been detected within a strict-mode tree.\n\nThe old API will be supported in all 16.x releases, but applications using it should migrate to the new version.\n\nPlease update the following components: %s\n\nLearn more about this warning here: https://reactjs.org/link/legacy-context", sortedNames);
              } finally {
                resetCurrentFiber();
              }
            });
          };
          ReactStrictModeWarnings.discardPendingWarnings = function() {
            pendingComponentWillMountWarnings = [];
            pendingUNSAFE_ComponentWillMountWarnings = [];
            pendingComponentWillReceivePropsWarnings = [];
            pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
            pendingComponentWillUpdateWarnings = [];
            pendingUNSAFE_ComponentWillUpdateWarnings = [];
            pendingLegacyContextWarning = /* @__PURE__ */ new Map();
          };
        }
        let didWarnAboutMaps;
        let didWarnAboutGenerators;
        let didWarnAboutStringRefs;
        let ownerHasKeyUseWarning;
        let ownerHasFunctionTypeWarning;
        let warnForMissingKey = function(child, returnFiber) {
        };
        {
          didWarnAboutMaps = false;
          didWarnAboutGenerators = false;
          didWarnAboutStringRefs = {};
          ownerHasKeyUseWarning = {};
          ownerHasFunctionTypeWarning = {};
          warnForMissingKey = function(child, returnFiber) {
            if (child === null || typeof child !== "object") {
              return;
            }
            if (!child._store || child._store.validated || child.key != null) {
              return;
            }
            if (typeof child._store !== "object") {
              throw new Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
            }
            child._store.validated = true;
            const componentName = getComponentNameFromFiber(returnFiber) || "Component";
            if (ownerHasKeyUseWarning[componentName]) {
              return;
            }
            ownerHasKeyUseWarning[componentName] = true;
            error('Each child in a list should have a unique "key" prop. See https://reactjs.org/link/warning-keys for more information.');
          };
        }
        function isReactClass(type) {
          return type.prototype && type.prototype.isReactComponent;
        }
        function coerceRef(returnFiber, current2, element) {
          const mixedRef = element.ref;
          if (mixedRef !== null && typeof mixedRef !== "function" && typeof mixedRef !== "object") {
            {
              if ((returnFiber.mode & StrictLegacyMode || warnAboutStringRefs) && // We warn in ReactElement.js if owner and self are equal for string refs
              // because these cannot be automatically converted to an arrow function
              // using a codemod. Therefore, we don't have to warn about string refs again.
              !(element._owner && element._self && element._owner.stateNode !== element._self) && // Will already throw with "Function components cannot have string refs"
              !(element._owner && element._owner.tag !== ClassComponent) && // Will already warn with "Function components cannot be given refs"
              !(typeof element.type === "function" && !isReactClass(element.type)) && // Will already throw with "Element ref was specified as a string (someStringRef) but no owner was set"
              element._owner) {
                const componentName = getComponentNameFromFiber(returnFiber) || "Component";
                if (!didWarnAboutStringRefs[componentName]) {
                  {
                    error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. We recommend using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, mixedRef);
                  }
                  didWarnAboutStringRefs[componentName] = true;
                }
              }
            }
            if (element._owner) {
              const owner = element._owner;
              let inst;
              if (owner) {
                const ownerFiber = owner;
                if (ownerFiber.tag !== ClassComponent) {
                  throw new Error("Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref");
                }
                inst = ownerFiber.stateNode;
              }
              if (!inst) {
                throw new Error("Missing owner for string ref " + mixedRef + ". This error is likely caused by a bug in React. Please file an issue.");
              }
              const resolvedInst = inst;
              {
                checkPropStringCoercion(mixedRef, "ref");
              }
              const stringRef = "" + mixedRef;
              if (current2 !== null && current2.ref !== null && typeof current2.ref === "function" && current2.ref._stringRef === stringRef) {
                return current2.ref;
              }
              const ref = function(value) {
                const refs = resolvedInst.refs;
                if (value === null) {
                  delete refs[stringRef];
                } else {
                  refs[stringRef] = value;
                }
              };
              ref._stringRef = stringRef;
              return ref;
            } else {
              if (typeof mixedRef !== "string") {
                throw new Error("Expected ref to be a function, a string, an object returned by React.createRef(), or null.");
              }
              if (!element._owner) {
                throw new Error("Element ref was specified as a string (" + mixedRef + ") but no owner was set. This could happen for one of the following reasons:\n1. You may be adding a ref to a function component\n2. You may be adding a ref to a component that was not created inside a component's render method\n3. You have multiple copies of React loaded\nSee https://reactjs.org/link/refs-must-have-owner for more information.");
              }
            }
          }
          return mixedRef;
        }
        function throwOnInvalidObjectType(returnFiber, newChild) {
          const childString = Object.prototype.toString.call(newChild);
          throw new Error("Objects are not valid as a React child (found: " + (childString === "[object Object]" ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : childString) + "). If you meant to render a collection of children, use an array instead.");
        }
        function warnOnFunctionType(returnFiber) {
          {
            const componentName = getComponentNameFromFiber(returnFiber) || "Component";
            if (ownerHasFunctionTypeWarning[componentName]) {
              return;
            }
            ownerHasFunctionTypeWarning[componentName] = true;
            error("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
          }
        }
        function resolveLazy(lazyType) {
          const payload = lazyType._payload;
          const init = lazyType._init;
          return init(payload);
        }
        function ChildReconciler(shouldTrackSideEffects) {
          function deleteChild(returnFiber, childToDelete) {
            if (!shouldTrackSideEffects) {
              return;
            }
            const deletions = returnFiber.deletions;
            if (deletions === null) {
              returnFiber.deletions = [childToDelete];
              returnFiber.flags |= ChildDeletion;
            } else {
              deletions.push(childToDelete);
            }
          }
          function deleteRemainingChildren(returnFiber, currentFirstChild) {
            if (!shouldTrackSideEffects) {
              return null;
            }
            let childToDelete = currentFirstChild;
            while (childToDelete !== null) {
              deleteChild(returnFiber, childToDelete);
              childToDelete = childToDelete.sibling;
            }
            return null;
          }
          function mapRemainingChildren(returnFiber, currentFirstChild) {
            const existingChildren = /* @__PURE__ */ new Map();
            let existingChild = currentFirstChild;
            while (existingChild !== null) {
              if (existingChild.key !== null) {
                existingChildren.set(existingChild.key, existingChild);
              } else {
                existingChildren.set(existingChild.index, existingChild);
              }
              existingChild = existingChild.sibling;
            }
            return existingChildren;
          }
          function useFiber(fiber, pendingProps) {
            const clone = createWorkInProgress(fiber, pendingProps);
            clone.index = 0;
            clone.sibling = null;
            return clone;
          }
          function placeChild(newFiber, lastPlacedIndex, newIndex) {
            newFiber.index = newIndex;
            if (!shouldTrackSideEffects) {
              newFiber.flags |= Forked;
              return lastPlacedIndex;
            }
            const current2 = newFiber.alternate;
            if (current2 !== null) {
              const oldIndex = current2.index;
              if (oldIndex < lastPlacedIndex) {
                newFiber.flags |= Placement;
                return lastPlacedIndex;
              } else {
                return oldIndex;
              }
            } else {
              newFiber.flags |= Placement;
              return lastPlacedIndex;
            }
          }
          function placeSingleChild(newFiber) {
            if (shouldTrackSideEffects && newFiber.alternate === null) {
              newFiber.flags |= Placement;
            }
            return newFiber;
          }
          function updateTextNode(returnFiber, current2, textContent, lanes) {
            if (current2 === null || current2.tag !== HostText) {
              const created = createFiberFromText(textContent, returnFiber.mode, lanes);
              created.return = returnFiber;
              return created;
            } else {
              const existing = useFiber(current2, textContent);
              existing.return = returnFiber;
              return existing;
            }
          }
          function updateElement(returnFiber, current2, element, lanes) {
            const elementType = element.type;
            if (elementType === REACT_FRAGMENT_TYPE) {
              return updateFragment2(returnFiber, current2, element.props.children, lanes, element.key);
            }
            if (current2 !== null) {
              if (current2.elementType === elementType || // Keep this check inline so it only runs on the false path:
              isCompatibleFamilyForHotReloading(current2, element) || // Lazy types should reconcile their resolved type.
              // We need to do this after the Hot Reloading check above,
              // because hot reloading has different semantics than prod because
              // it doesn't resuspend. So we can't let the call below suspend.
              typeof elementType === "object" && elementType !== null && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current2.type) {
                const existing = useFiber(current2, element.props);
                existing.ref = coerceRef(returnFiber, current2, element);
                existing.return = returnFiber;
                {
                  existing._debugSource = element._source;
                  existing._debugOwner = element._owner;
                }
                return existing;
              }
            }
            const created = createFiberFromElement(element, returnFiber.mode, lanes);
            created.ref = coerceRef(returnFiber, current2, element);
            created.return = returnFiber;
            return created;
          }
          function updatePortal(returnFiber, current2, portal, lanes) {
            if (current2 === null || current2.tag !== HostPortal || current2.stateNode.containerInfo !== portal.containerInfo || current2.stateNode.implementation !== portal.implementation) {
              const created = createFiberFromPortal(portal, returnFiber.mode, lanes);
              created.return = returnFiber;
              return created;
            } else {
              const existing = useFiber(current2, portal.children || []);
              existing.return = returnFiber;
              return existing;
            }
          }
          function updateFragment2(returnFiber, current2, fragment, lanes, key) {
            if (current2 === null || current2.tag !== Fragment) {
              const created = createFiberFromFragment(fragment, returnFiber.mode, lanes, key);
              created.return = returnFiber;
              return created;
            } else {
              const existing = useFiber(current2, fragment);
              existing.return = returnFiber;
              return existing;
            }
          }
          function createChild(returnFiber, newChild, lanes) {
            if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number") {
              const created = createFiberFromText("" + newChild, returnFiber.mode, lanes);
              created.return = returnFiber;
              return created;
            }
            if (typeof newChild === "object" && newChild !== null) {
              switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                  const _created = createFiberFromElement(newChild, returnFiber.mode, lanes);
                  _created.ref = coerceRef(returnFiber, null, newChild);
                  _created.return = returnFiber;
                  return _created;
                }
                case REACT_PORTAL_TYPE: {
                  const _created2 = createFiberFromPortal(newChild, returnFiber.mode, lanes);
                  _created2.return = returnFiber;
                  return _created2;
                }
                case REACT_LAZY_TYPE: {
                  const payload = newChild._payload;
                  const init = newChild._init;
                  return createChild(returnFiber, init(payload), lanes);
                }
              }
              if (isArray(newChild) || getIteratorFn(newChild)) {
                const _created3 = createFiberFromFragment(newChild, returnFiber.mode, lanes, null);
                _created3.return = returnFiber;
                return _created3;
              }
              throwOnInvalidObjectType(returnFiber, newChild);
            }
            {
              if (typeof newChild === "function") {
                warnOnFunctionType(returnFiber);
              }
            }
            return null;
          }
          function updateSlot(returnFiber, oldFiber, newChild, lanes) {
            const key = oldFiber !== null ? oldFiber.key : null;
            if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number") {
              if (key !== null) {
                return null;
              }
              return updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
            }
            if (typeof newChild === "object" && newChild !== null) {
              switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                  if (newChild.key === key) {
                    return updateElement(returnFiber, oldFiber, newChild, lanes);
                  } else {
                    return null;
                  }
                }
                case REACT_PORTAL_TYPE: {
                  if (newChild.key === key) {
                    return updatePortal(returnFiber, oldFiber, newChild, lanes);
                  } else {
                    return null;
                  }
                }
                case REACT_LAZY_TYPE: {
                  const payload = newChild._payload;
                  const init = newChild._init;
                  return updateSlot(returnFiber, oldFiber, init(payload), lanes);
                }
              }
              if (isArray(newChild) || getIteratorFn(newChild)) {
                if (key !== null) {
                  return null;
                }
                return updateFragment2(returnFiber, oldFiber, newChild, lanes, null);
              }
              throwOnInvalidObjectType(returnFiber, newChild);
            }
            {
              if (typeof newChild === "function") {
                warnOnFunctionType(returnFiber);
              }
            }
            return null;
          }
          function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
            if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number") {
              const matchedFiber = existingChildren.get(newIdx) || null;
              return updateTextNode(returnFiber, matchedFiber, "" + newChild, lanes);
            }
            if (typeof newChild === "object" && newChild !== null) {
              switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                  const _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                  return updateElement(returnFiber, _matchedFiber, newChild, lanes);
                }
                case REACT_PORTAL_TYPE: {
                  const _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                  return updatePortal(returnFiber, _matchedFiber2, newChild, lanes);
                }
                case REACT_LAZY_TYPE:
                  var payload = newChild._payload;
                  var init = newChild._init;
                  return updateFromMap(existingChildren, returnFiber, newIdx, init(payload), lanes);
              }
              if (isArray(newChild) || getIteratorFn(newChild)) {
                const _matchedFiber3 = existingChildren.get(newIdx) || null;
                return updateFragment2(returnFiber, _matchedFiber3, newChild, lanes, null);
              }
              throwOnInvalidObjectType(returnFiber, newChild);
            }
            {
              if (typeof newChild === "function") {
                warnOnFunctionType(returnFiber);
              }
            }
            return null;
          }
          function warnOnInvalidKey(child, knownKeys, returnFiber) {
            {
              if (typeof child !== "object" || child === null) {
                return knownKeys;
              }
              switch (child.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  warnForMissingKey(child, returnFiber);
                  var key = child.key;
                  if (typeof key !== "string") {
                    break;
                  }
                  if (knownKeys === null) {
                    knownKeys = /* @__PURE__ */ new Set();
                    knownKeys.add(key);
                    break;
                  }
                  if (!knownKeys.has(key)) {
                    knownKeys.add(key);
                    break;
                  }
                  error("Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.", key);
                  break;
                case REACT_LAZY_TYPE:
                  var payload = child._payload;
                  var init = child._init;
                  warnOnInvalidKey(init(payload), knownKeys, returnFiber);
                  break;
              }
            }
            return knownKeys;
          }
          function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
            {
              let knownKeys = null;
              for (let i = 0; i < newChildren.length; i++) {
                const child = newChildren[i];
                knownKeys = warnOnInvalidKey(child, knownKeys, returnFiber);
              }
            }
            let resultingFirstChild = null;
            let previousNewFiber = null;
            let oldFiber = currentFirstChild;
            let lastPlacedIndex = 0;
            let newIdx = 0;
            let nextOldFiber = null;
            for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
              if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
              } else {
                nextOldFiber = oldFiber.sibling;
              }
              const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
              if (newFiber === null) {
                if (oldFiber === null) {
                  oldFiber = nextOldFiber;
                }
                break;
              }
              if (shouldTrackSideEffects) {
                if (oldFiber && newFiber.alternate === null) {
                  deleteChild(returnFiber, oldFiber);
                }
              }
              lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
              if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
              } else {
                previousNewFiber.sibling = newFiber;
              }
              previousNewFiber = newFiber;
              oldFiber = nextOldFiber;
            }
            if (newIdx === newChildren.length) {
              deleteRemainingChildren(returnFiber, oldFiber);
              if (getIsHydrating()) {
                const numberOfForks = newIdx;
                pushTreeFork(returnFiber, numberOfForks);
              }
              return resultingFirstChild;
            }
            if (oldFiber === null) {
              for (; newIdx < newChildren.length; newIdx++) {
                const _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
                if (_newFiber === null) {
                  continue;
                }
                lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                  resultingFirstChild = _newFiber;
                } else {
                  previousNewFiber.sibling = _newFiber;
                }
                previousNewFiber = _newFiber;
              }
              if (getIsHydrating()) {
                const _numberOfForks = newIdx;
                pushTreeFork(returnFiber, _numberOfForks);
              }
              return resultingFirstChild;
            }
            const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
            for (; newIdx < newChildren.length; newIdx++) {
              const _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], lanes);
              if (_newFiber2 !== null) {
                if (shouldTrackSideEffects) {
                  if (_newFiber2.alternate !== null) {
                    existingChildren.delete(_newFiber2.key === null ? newIdx : _newFiber2.key);
                  }
                }
                lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                  resultingFirstChild = _newFiber2;
                } else {
                  previousNewFiber.sibling = _newFiber2;
                }
                previousNewFiber = _newFiber2;
              }
            }
            if (shouldTrackSideEffects) {
              existingChildren.forEach(function(child2) {
                return deleteChild(returnFiber, child2);
              });
            }
            if (getIsHydrating()) {
              const _numberOfForks2 = newIdx;
              pushTreeFork(returnFiber, _numberOfForks2);
            }
            return resultingFirstChild;
          }
          function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, lanes) {
            const iteratorFn = getIteratorFn(newChildrenIterable);
            if (typeof iteratorFn !== "function") {
              throw new Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
            }
            {
              if (typeof Symbol === "function" && // $FlowFixMe Flow doesn't know about toStringTag
              newChildrenIterable[Symbol.toStringTag] === "Generator") {
                if (!didWarnAboutGenerators) {
                  error("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers.");
                }
                didWarnAboutGenerators = true;
              }
              if (newChildrenIterable.entries === iteratorFn) {
                if (!didWarnAboutMaps) {
                  error("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                }
                didWarnAboutMaps = true;
              }
              const _newChildren = iteratorFn.call(newChildrenIterable);
              if (_newChildren) {
                let knownKeys = null;
                let _step = _newChildren.next();
                for (; !_step.done; _step = _newChildren.next()) {
                  const child = _step.value;
                  knownKeys = warnOnInvalidKey(child, knownKeys, returnFiber);
                }
              }
            }
            const newChildren = iteratorFn.call(newChildrenIterable);
            if (newChildren == null) {
              throw new Error("An iterable object provided no iterator.");
            }
            let resultingFirstChild = null;
            let previousNewFiber = null;
            let oldFiber = currentFirstChild;
            let lastPlacedIndex = 0;
            let newIdx = 0;
            let nextOldFiber = null;
            let step = newChildren.next();
            for (; oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
              if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
              } else {
                nextOldFiber = oldFiber.sibling;
              }
              const newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
              if (newFiber === null) {
                if (oldFiber === null) {
                  oldFiber = nextOldFiber;
                }
                break;
              }
              if (shouldTrackSideEffects) {
                if (oldFiber && newFiber.alternate === null) {
                  deleteChild(returnFiber, oldFiber);
                }
              }
              lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
              if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
              } else {
                previousNewFiber.sibling = newFiber;
              }
              previousNewFiber = newFiber;
              oldFiber = nextOldFiber;
            }
            if (step.done) {
              deleteRemainingChildren(returnFiber, oldFiber);
              if (getIsHydrating()) {
                const numberOfForks = newIdx;
                pushTreeFork(returnFiber, numberOfForks);
              }
              return resultingFirstChild;
            }
            if (oldFiber === null) {
              for (; !step.done; newIdx++, step = newChildren.next()) {
                const _newFiber3 = createChild(returnFiber, step.value, lanes);
                if (_newFiber3 === null) {
                  continue;
                }
                lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                  resultingFirstChild = _newFiber3;
                } else {
                  previousNewFiber.sibling = _newFiber3;
                }
                previousNewFiber = _newFiber3;
              }
              if (getIsHydrating()) {
                const _numberOfForks3 = newIdx;
                pushTreeFork(returnFiber, _numberOfForks3);
              }
              return resultingFirstChild;
            }
            const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
            for (; !step.done; newIdx++, step = newChildren.next()) {
              const _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, lanes);
              if (_newFiber4 !== null) {
                if (shouldTrackSideEffects) {
                  if (_newFiber4.alternate !== null) {
                    existingChildren.delete(_newFiber4.key === null ? newIdx : _newFiber4.key);
                  }
                }
                lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                  resultingFirstChild = _newFiber4;
                } else {
                  previousNewFiber.sibling = _newFiber4;
                }
                previousNewFiber = _newFiber4;
              }
            }
            if (shouldTrackSideEffects) {
              existingChildren.forEach(function(child2) {
                return deleteChild(returnFiber, child2);
              });
            }
            if (getIsHydrating()) {
              const _numberOfForks4 = newIdx;
              pushTreeFork(returnFiber, _numberOfForks4);
            }
            return resultingFirstChild;
          }
          function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, lanes) {
            if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
              deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
              const existing = useFiber(currentFirstChild, textContent);
              existing.return = returnFiber;
              return existing;
            }
            deleteRemainingChildren(returnFiber, currentFirstChild);
            const created = createFiberFromText(textContent, returnFiber.mode, lanes);
            created.return = returnFiber;
            return created;
          }
          function reconcileSingleElement(returnFiber, currentFirstChild, element, lanes) {
            const key = element.key;
            let child = currentFirstChild;
            while (child !== null) {
              if (child.key === key) {
                const elementType = element.type;
                if (elementType === REACT_FRAGMENT_TYPE) {
                  if (child.tag === Fragment) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    const existing = useFiber(child, element.props.children);
                    existing.return = returnFiber;
                    {
                      existing._debugSource = element._source;
                      existing._debugOwner = element._owner;
                    }
                    return existing;
                  }
                } else {
                  if (child.elementType === elementType || // Keep this check inline so it only runs on the false path:
                  isCompatibleFamilyForHotReloading(child, element) || // Lazy types should reconcile their resolved type.
                  // We need to do this after the Hot Reloading check above,
                  // because hot reloading has different semantics than prod because
                  // it doesn't resuspend. So we can't let the call below suspend.
                  typeof elementType === "object" && elementType !== null && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === child.type) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    const _existing = useFiber(child, element.props);
                    _existing.ref = coerceRef(returnFiber, child, element);
                    _existing.return = returnFiber;
                    {
                      _existing._debugSource = element._source;
                      _existing._debugOwner = element._owner;
                    }
                    return _existing;
                  }
                }
                deleteRemainingChildren(returnFiber, child);
                break;
              } else {
                deleteChild(returnFiber, child);
              }
              child = child.sibling;
            }
            if (element.type === REACT_FRAGMENT_TYPE) {
              const created = createFiberFromFragment(element.props.children, returnFiber.mode, lanes, element.key);
              created.return = returnFiber;
              return created;
            } else {
              const _created4 = createFiberFromElement(element, returnFiber.mode, lanes);
              _created4.ref = coerceRef(returnFiber, currentFirstChild, element);
              _created4.return = returnFiber;
              return _created4;
            }
          }
          function reconcileSinglePortal(returnFiber, currentFirstChild, portal, lanes) {
            const key = portal.key;
            let child = currentFirstChild;
            while (child !== null) {
              if (child.key === key) {
                if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
                  deleteRemainingChildren(returnFiber, child.sibling);
                  const existing = useFiber(child, portal.children || []);
                  existing.return = returnFiber;
                  return existing;
                } else {
                  deleteRemainingChildren(returnFiber, child);
                  break;
                }
              } else {
                deleteChild(returnFiber, child);
              }
              child = child.sibling;
            }
            const created = createFiberFromPortal(portal, returnFiber.mode, lanes);
            created.return = returnFiber;
            return created;
          }
          function reconcileChildFibers2(returnFiber, currentFirstChild, newChild, lanes) {
            const isUnkeyedTopLevelFragment = typeof newChild === "object" && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null;
            if (isUnkeyedTopLevelFragment) {
              newChild = newChild.props.children;
            }
            if (typeof newChild === "object" && newChild !== null) {
              switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                  return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes));
                case REACT_PORTAL_TYPE:
                  return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes));
                case REACT_LAZY_TYPE:
                  var payload = newChild._payload;
                  var init = newChild._init;
                  return reconcileChildFibers2(returnFiber, currentFirstChild, init(payload), lanes);
              }
              if (isArray(newChild)) {
                return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
              }
              if (getIteratorFn(newChild)) {
                return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
              }
              throwOnInvalidObjectType(returnFiber, newChild);
            }
            if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number") {
              return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, "" + newChild, lanes));
            }
            {
              if (typeof newChild === "function") {
                warnOnFunctionType(returnFiber);
              }
            }
            return deleteRemainingChildren(returnFiber, currentFirstChild);
          }
          return reconcileChildFibers2;
        }
        const reconcileChildFibers = ChildReconciler(true);
        const mountChildFibers = ChildReconciler(false);
        function cloneChildFibers(current2, workInProgress2) {
          if (current2 !== null && workInProgress2.child !== current2.child) {
            throw new Error("Resuming work not yet implemented.");
          }
          if (workInProgress2.child === null) {
            return;
          }
          let currentChild = workInProgress2.child;
          let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
          workInProgress2.child = newChild;
          newChild.return = workInProgress2;
          while (currentChild.sibling !== null) {
            currentChild = currentChild.sibling;
            newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps);
            newChild.return = workInProgress2;
          }
          newChild.sibling = null;
        }
        function resetChildFibers(workInProgress2, lanes) {
          let child = workInProgress2.child;
          while (child !== null) {
            resetWorkInProgress(child, lanes);
            child = child.sibling;
          }
        }
        const valueCursor = createCursor(null);
        let rendererSigil;
        {
          rendererSigil = {};
        }
        let currentlyRenderingFiber = null;
        let lastContextDependency = null;
        let lastFullyObservedContext = null;
        let isDisallowedContextReadInDEV = false;
        function resetContextDependencies() {
          currentlyRenderingFiber = null;
          lastContextDependency = null;
          lastFullyObservedContext = null;
          {
            isDisallowedContextReadInDEV = false;
          }
        }
        function enterDisallowedContextReadInDEV() {
          {
            isDisallowedContextReadInDEV = true;
          }
        }
        function exitDisallowedContextReadInDEV() {
          {
            isDisallowedContextReadInDEV = false;
          }
        }
        function pushProvider(providerFiber, context, nextValue) {
          {
            push(valueCursor, context._currentValue, providerFiber);
            context._currentValue = nextValue;
            {
              if (context._currentRenderer !== void 0 && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
                error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported.");
              }
              context._currentRenderer = rendererSigil;
            }
          }
        }
        function popProvider(context, providerFiber) {
          const currentValue = valueCursor.current;
          pop(valueCursor, providerFiber);
          {
            {
              context._currentValue = currentValue;
            }
          }
        }
        function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
          let node = parent;
          while (node !== null) {
            const alternate = node.alternate;
            if (!isSubsetOfLanes(node.childLanes, renderLanes2)) {
              node.childLanes = mergeLanes(node.childLanes, renderLanes2);
              if (alternate !== null) {
                alternate.childLanes = mergeLanes(alternate.childLanes, renderLanes2);
              }
            } else if (alternate !== null && !isSubsetOfLanes(alternate.childLanes, renderLanes2)) {
              alternate.childLanes = mergeLanes(alternate.childLanes, renderLanes2);
            }
            if (node === propagationRoot) {
              break;
            }
            node = node.return;
          }
          {
            if (node !== propagationRoot) {
              error("Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
        }
        function propagateContextChange(workInProgress2, context, renderLanes2) {
          {
            propagateContextChange_eager(workInProgress2, context, renderLanes2);
          }
        }
        function propagateContextChange_eager(workInProgress2, context, renderLanes2) {
          let fiber = workInProgress2.child;
          if (fiber !== null) {
            fiber.return = workInProgress2;
          }
          while (fiber !== null) {
            let nextFiber = void 0;
            const list = fiber.dependencies;
            if (list !== null) {
              nextFiber = fiber.child;
              let dependency = list.firstContext;
              while (dependency !== null) {
                if (dependency.context === context) {
                  if (fiber.tag === ClassComponent) {
                    const lane = pickArbitraryLane(renderLanes2);
                    const update = createUpdate(NoTimestamp, lane);
                    update.tag = ForceUpdate;
                    const updateQueue = fiber.updateQueue;
                    if (updateQueue === null) ;
                    else {
                      const sharedQueue = updateQueue.shared;
                      const pending = sharedQueue.pending;
                      if (pending === null) {
                        update.next = update;
                      } else {
                        update.next = pending.next;
                        pending.next = update;
                      }
                      sharedQueue.pending = update;
                    }
                  }
                  fiber.lanes = mergeLanes(fiber.lanes, renderLanes2);
                  const alternate = fiber.alternate;
                  if (alternate !== null) {
                    alternate.lanes = mergeLanes(alternate.lanes, renderLanes2);
                  }
                  scheduleContextWorkOnParentPath(fiber.return, renderLanes2, workInProgress2);
                  list.lanes = mergeLanes(list.lanes, renderLanes2);
                  break;
                }
                dependency = dependency.next;
              }
            } else if (fiber.tag === ContextProvider) {
              nextFiber = fiber.type === workInProgress2.type ? null : fiber.child;
            } else if (fiber.tag === DehydratedFragment) {
              const parentSuspense = fiber.return;
              if (parentSuspense === null) {
                throw new Error("We just came from a parent so we must have had a parent. This is a bug in React.");
              }
              parentSuspense.lanes = mergeLanes(parentSuspense.lanes, renderLanes2);
              const _alternate = parentSuspense.alternate;
              if (_alternate !== null) {
                _alternate.lanes = mergeLanes(_alternate.lanes, renderLanes2);
              }
              scheduleContextWorkOnParentPath(parentSuspense, renderLanes2, workInProgress2);
              nextFiber = fiber.sibling;
            } else {
              nextFiber = fiber.child;
            }
            if (nextFiber !== null) {
              nextFiber.return = fiber;
            } else {
              nextFiber = fiber;
              while (nextFiber !== null) {
                if (nextFiber === workInProgress2) {
                  nextFiber = null;
                  break;
                }
                const sibling = nextFiber.sibling;
                if (sibling !== null) {
                  sibling.return = nextFiber.return;
                  nextFiber = sibling;
                  break;
                }
                nextFiber = nextFiber.return;
              }
            }
            fiber = nextFiber;
          }
        }
        function prepareToReadContext(workInProgress2, renderLanes2) {
          currentlyRenderingFiber = workInProgress2;
          lastContextDependency = null;
          lastFullyObservedContext = null;
          const dependencies = workInProgress2.dependencies;
          if (dependencies !== null) {
            {
              const firstContext = dependencies.firstContext;
              if (firstContext !== null) {
                if (includesSomeLane(dependencies.lanes, renderLanes2)) {
                  markWorkInProgressReceivedUpdate();
                }
                dependencies.firstContext = null;
              }
            }
          }
        }
        function readContext(context) {
          {
            if (isDisallowedContextReadInDEV) {
              error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
            }
          }
          const value = context._currentValue;
          if (lastFullyObservedContext === context) ;
          else {
            const contextItem = {
              context,
              memoizedValue: value,
              next: null
            };
            if (lastContextDependency === null) {
              if (currentlyRenderingFiber === null) {
                throw new Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
              }
              lastContextDependency = contextItem;
              currentlyRenderingFiber.dependencies = {
                lanes: NoLanes,
                firstContext: contextItem
              };
            } else {
              lastContextDependency = lastContextDependency.next = contextItem;
            }
          }
          return value;
        }
        let concurrentQueues = null;
        function pushConcurrentUpdateQueue(queue) {
          if (concurrentQueues === null) {
            concurrentQueues = [queue];
          } else {
            concurrentQueues.push(queue);
          }
        }
        function finishQueueingConcurrentUpdates() {
          if (concurrentQueues !== null) {
            for (let i = 0; i < concurrentQueues.length; i++) {
              const queue = concurrentQueues[i];
              const lastInterleavedUpdate = queue.interleaved;
              if (lastInterleavedUpdate !== null) {
                queue.interleaved = null;
                const firstInterleavedUpdate = lastInterleavedUpdate.next;
                const lastPendingUpdate = queue.pending;
                if (lastPendingUpdate !== null) {
                  const firstPendingUpdate = lastPendingUpdate.next;
                  lastPendingUpdate.next = firstInterleavedUpdate;
                  lastInterleavedUpdate.next = firstPendingUpdate;
                }
                queue.pending = lastInterleavedUpdate;
              }
            }
            concurrentQueues = null;
          }
        }
        function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
          const interleaved = queue.interleaved;
          if (interleaved === null) {
            update.next = update;
            pushConcurrentUpdateQueue(queue);
          } else {
            update.next = interleaved.next;
            interleaved.next = update;
          }
          queue.interleaved = update;
          return markUpdateLaneFromFiberToRoot(fiber, lane);
        }
        function enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update, lane) {
          const interleaved = queue.interleaved;
          if (interleaved === null) {
            update.next = update;
            pushConcurrentUpdateQueue(queue);
          } else {
            update.next = interleaved.next;
            interleaved.next = update;
          }
          queue.interleaved = update;
        }
        function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
          const interleaved = queue.interleaved;
          if (interleaved === null) {
            update.next = update;
            pushConcurrentUpdateQueue(queue);
          } else {
            update.next = interleaved.next;
            interleaved.next = update;
          }
          queue.interleaved = update;
          return markUpdateLaneFromFiberToRoot(fiber, lane);
        }
        function enqueueConcurrentRenderForLane(fiber, lane) {
          return markUpdateLaneFromFiberToRoot(fiber, lane);
        }
        const unsafe_markUpdateLaneFromFiberToRoot = markUpdateLaneFromFiberToRoot;
        function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
          sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
          let alternate = sourceFiber.alternate;
          if (alternate !== null) {
            alternate.lanes = mergeLanes(alternate.lanes, lane);
          }
          {
            if (alternate === null && (sourceFiber.flags & (Placement | Hydrating)) !== NoFlags) {
              warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
            }
          }
          let node = sourceFiber;
          let parent = sourceFiber.return;
          while (parent !== null) {
            parent.childLanes = mergeLanes(parent.childLanes, lane);
            alternate = parent.alternate;
            if (alternate !== null) {
              alternate.childLanes = mergeLanes(alternate.childLanes, lane);
            } else {
              {
                if ((parent.flags & (Placement | Hydrating)) !== NoFlags) {
                  warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
                }
              }
            }
            node = parent;
            parent = parent.return;
          }
          if (node.tag === HostRoot) {
            const root2 = node.stateNode;
            return root2;
          } else {
            return null;
          }
        }
        const UpdateState = 0;
        const ReplaceState = 1;
        var ForceUpdate = 2;
        const CaptureUpdate = 3;
        let hasForceUpdate = false;
        let didWarnUpdateInsideUpdate;
        let currentlyProcessingQueue;
        {
          didWarnUpdateInsideUpdate = false;
          currentlyProcessingQueue = null;
        }
        function initializeUpdateQueue(fiber) {
          const queue = {
            baseState: fiber.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
              pending: null,
              interleaved: null,
              lanes: NoLanes
            },
            effects: null
          };
          fiber.updateQueue = queue;
        }
        function cloneUpdateQueue(current2, workInProgress2) {
          const queue = workInProgress2.updateQueue;
          const currentQueue = current2.updateQueue;
          if (queue === currentQueue) {
            const clone = {
              baseState: currentQueue.baseState,
              firstBaseUpdate: currentQueue.firstBaseUpdate,
              lastBaseUpdate: currentQueue.lastBaseUpdate,
              shared: currentQueue.shared,
              effects: currentQueue.effects
            };
            workInProgress2.updateQueue = clone;
          }
        }
        function createUpdate(eventTime, lane) {
          const update = {
            eventTime,
            lane,
            tag: UpdateState,
            payload: null,
            callback: null,
            next: null
          };
          return update;
        }
        function enqueueUpdate(fiber, update, lane) {
          const updateQueue = fiber.updateQueue;
          if (updateQueue === null) {
            return null;
          }
          const sharedQueue = updateQueue.shared;
          {
            if (currentlyProcessingQueue === sharedQueue && !didWarnUpdateInsideUpdate) {
              error("An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback.");
              didWarnUpdateInsideUpdate = true;
            }
          }
          if (isUnsafeClassRenderPhaseUpdate()) {
            const pending = sharedQueue.pending;
            if (pending === null) {
              update.next = update;
            } else {
              update.next = pending.next;
              pending.next = update;
            }
            sharedQueue.pending = update;
            return unsafe_markUpdateLaneFromFiberToRoot(fiber, lane);
          } else {
            return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
          }
        }
        function entangleTransitions(root2, fiber, lane) {
          const updateQueue = fiber.updateQueue;
          if (updateQueue === null) {
            return;
          }
          const sharedQueue = updateQueue.shared;
          if (isTransitionLane(lane)) {
            let queueLanes = sharedQueue.lanes;
            queueLanes = intersectLanes(queueLanes, root2.pendingLanes);
            const newQueueLanes = mergeLanes(queueLanes, lane);
            sharedQueue.lanes = newQueueLanes;
            markRootEntangled(root2, newQueueLanes);
          }
        }
        function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
          let queue = workInProgress2.updateQueue;
          const current2 = workInProgress2.alternate;
          if (current2 !== null) {
            const currentQueue = current2.updateQueue;
            if (queue === currentQueue) {
              let newFirst = null;
              let newLast = null;
              const firstBaseUpdate = queue.firstBaseUpdate;
              if (firstBaseUpdate !== null) {
                let update = firstBaseUpdate;
                do {
                  const clone = {
                    eventTime: update.eventTime,
                    lane: update.lane,
                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,
                    next: null
                  };
                  if (newLast === null) {
                    newFirst = newLast = clone;
                  } else {
                    newLast.next = clone;
                    newLast = clone;
                  }
                  update = update.next;
                } while (update !== null);
                if (newLast === null) {
                  newFirst = newLast = capturedUpdate;
                } else {
                  newLast.next = capturedUpdate;
                  newLast = capturedUpdate;
                }
              } else {
                newFirst = newLast = capturedUpdate;
              }
              queue = {
                baseState: currentQueue.baseState,
                firstBaseUpdate: newFirst,
                lastBaseUpdate: newLast,
                shared: currentQueue.shared,
                effects: currentQueue.effects
              };
              workInProgress2.updateQueue = queue;
              return;
            }
          }
          const lastBaseUpdate = queue.lastBaseUpdate;
          if (lastBaseUpdate === null) {
            queue.firstBaseUpdate = capturedUpdate;
          } else {
            lastBaseUpdate.next = capturedUpdate;
          }
          queue.lastBaseUpdate = capturedUpdate;
        }
        function getStateFromUpdate(workInProgress2, queue, update, prevState, nextProps, instance) {
          switch (update.tag) {
            case ReplaceState: {
              const payload = update.payload;
              if (typeof payload === "function") {
                {
                  enterDisallowedContextReadInDEV();
                }
                const nextState = payload.call(instance, prevState, nextProps);
                {
                  if (workInProgress2.mode & StrictLegacyMode) {
                    setIsStrictModeForDevtools(true);
                    try {
                      payload.call(instance, prevState, nextProps);
                    } finally {
                      setIsStrictModeForDevtools(false);
                    }
                  }
                  exitDisallowedContextReadInDEV();
                }
                return nextState;
              }
              return payload;
            }
            case CaptureUpdate: {
              workInProgress2.flags = workInProgress2.flags & ~ShouldCapture | DidCapture;
            }
            case UpdateState: {
              const _payload = update.payload;
              let partialState;
              if (typeof _payload === "function") {
                {
                  enterDisallowedContextReadInDEV();
                }
                partialState = _payload.call(instance, prevState, nextProps);
                {
                  if (workInProgress2.mode & StrictLegacyMode) {
                    setIsStrictModeForDevtools(true);
                    try {
                      _payload.call(instance, prevState, nextProps);
                    } finally {
                      setIsStrictModeForDevtools(false);
                    }
                  }
                  exitDisallowedContextReadInDEV();
                }
              } else {
                partialState = _payload;
              }
              if (partialState === null || partialState === void 0) {
                return prevState;
              }
              return assign({}, prevState, partialState);
            }
            case ForceUpdate: {
              hasForceUpdate = true;
              return prevState;
            }
          }
          return prevState;
        }
        function processUpdateQueue(workInProgress2, props, instance, renderLanes2) {
          const queue = workInProgress2.updateQueue;
          hasForceUpdate = false;
          {
            currentlyProcessingQueue = queue.shared;
          }
          let firstBaseUpdate = queue.firstBaseUpdate;
          let lastBaseUpdate = queue.lastBaseUpdate;
          let pendingQueue = queue.shared.pending;
          if (pendingQueue !== null) {
            queue.shared.pending = null;
            const lastPendingUpdate = pendingQueue;
            const firstPendingUpdate = lastPendingUpdate.next;
            lastPendingUpdate.next = null;
            if (lastBaseUpdate === null) {
              firstBaseUpdate = firstPendingUpdate;
            } else {
              lastBaseUpdate.next = firstPendingUpdate;
            }
            lastBaseUpdate = lastPendingUpdate;
            const current2 = workInProgress2.alternate;
            if (current2 !== null) {
              const currentQueue = current2.updateQueue;
              const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
              if (currentLastBaseUpdate !== lastBaseUpdate) {
                if (currentLastBaseUpdate === null) {
                  currentQueue.firstBaseUpdate = firstPendingUpdate;
                } else {
                  currentLastBaseUpdate.next = firstPendingUpdate;
                }
                currentQueue.lastBaseUpdate = lastPendingUpdate;
              }
            }
          }
          if (firstBaseUpdate !== null) {
            let newState = queue.baseState;
            let newLanes = NoLanes;
            let newBaseState = null;
            let newFirstBaseUpdate = null;
            let newLastBaseUpdate = null;
            let update = firstBaseUpdate;
            do {
              const updateLane = update.lane;
              const updateEventTime = update.eventTime;
              if (!isSubsetOfLanes(renderLanes2, updateLane)) {
                const clone = {
                  eventTime: updateEventTime,
                  lane: updateLane,
                  tag: update.tag,
                  payload: update.payload,
                  callback: update.callback,
                  next: null
                };
                if (newLastBaseUpdate === null) {
                  newFirstBaseUpdate = newLastBaseUpdate = clone;
                  newBaseState = newState;
                } else {
                  newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                newLanes = mergeLanes(newLanes, updateLane);
              } else {
                if (newLastBaseUpdate !== null) {
                  const _clone = {
                    eventTime: updateEventTime,
                    // This update is going to be committed so we never want uncommit
                    // it. Using NoLane works because 0 is a subset of all bitmasks, so
                    // this will never be skipped by the check above.
                    lane: NoLane,
                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,
                    next: null
                  };
                  newLastBaseUpdate = newLastBaseUpdate.next = _clone;
                }
                newState = getStateFromUpdate(workInProgress2, queue, update, newState, props, instance);
                const callback = update.callback;
                if (callback !== null && // If the update was already committed, we should not queue its
                // callback again.
                update.lane !== NoLane) {
                  workInProgress2.flags |= Callback;
                  const effects = queue.effects;
                  if (effects === null) {
                    queue.effects = [update];
                  } else {
                    effects.push(update);
                  }
                }
              }
              update = update.next;
              if (update === null) {
                pendingQueue = queue.shared.pending;
                if (pendingQueue === null) {
                  break;
                } else {
                  const _lastPendingUpdate = pendingQueue;
                  const _firstPendingUpdate = _lastPendingUpdate.next;
                  _lastPendingUpdate.next = null;
                  update = _firstPendingUpdate;
                  queue.lastBaseUpdate = _lastPendingUpdate;
                  queue.shared.pending = null;
                }
              }
            } while (true);
            if (newLastBaseUpdate === null) {
              newBaseState = newState;
            }
            queue.baseState = newBaseState;
            queue.firstBaseUpdate = newFirstBaseUpdate;
            queue.lastBaseUpdate = newLastBaseUpdate;
            const lastInterleaved = queue.shared.interleaved;
            if (lastInterleaved !== null) {
              let interleaved = lastInterleaved;
              do {
                newLanes = mergeLanes(newLanes, interleaved.lane);
                interleaved = interleaved.next;
              } while (interleaved !== lastInterleaved);
            } else if (firstBaseUpdate === null) {
              queue.shared.lanes = NoLanes;
            }
            markSkippedUpdateLanes(newLanes);
            workInProgress2.lanes = newLanes;
            workInProgress2.memoizedState = newState;
          }
          {
            currentlyProcessingQueue = null;
          }
        }
        function callCallback(callback, context) {
          if (typeof callback !== "function") {
            throw new Error("Invalid argument passed as callback. Expected a function. Instead " + ("received: " + callback));
          }
          callback.call(context);
        }
        function resetHasForceUpdateBeforeProcessing() {
          hasForceUpdate = false;
        }
        function checkHasForceUpdateAfterProcessing() {
          return hasForceUpdate;
        }
        function commitUpdateQueue(finishedWork, finishedQueue, instance) {
          const effects = finishedQueue.effects;
          finishedQueue.effects = null;
          if (effects !== null) {
            for (let i = 0; i < effects.length; i++) {
              const effect = effects[i];
              const callback = effect.callback;
              if (callback !== null) {
                effect.callback = null;
                callCallback(callback, instance);
              }
            }
          }
        }
        const NO_CONTEXT = {};
        const contextStackCursor$1 = createCursor(NO_CONTEXT);
        const contextFiberStackCursor = createCursor(NO_CONTEXT);
        const rootInstanceStackCursor = createCursor(NO_CONTEXT);
        function requiredContext(c) {
          if (c === NO_CONTEXT) {
            throw new Error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.");
          }
          return c;
        }
        function getRootHostContainer() {
          const rootInstance = requiredContext(rootInstanceStackCursor.current);
          return rootInstance;
        }
        function pushHostContainer(fiber, nextRootInstance) {
          push(rootInstanceStackCursor, nextRootInstance, fiber);
          push(contextFiberStackCursor, fiber, fiber);
          push(contextStackCursor$1, NO_CONTEXT, fiber);
          const nextRootContext = getRootHostContext(nextRootInstance);
          pop(contextStackCursor$1, fiber);
          push(contextStackCursor$1, nextRootContext, fiber);
        }
        function popHostContainer(fiber) {
          pop(contextStackCursor$1, fiber);
          pop(contextFiberStackCursor, fiber);
          pop(rootInstanceStackCursor, fiber);
        }
        function getHostContext() {
          const context = requiredContext(contextStackCursor$1.current);
          return context;
        }
        function pushHostContext(fiber) {
          const rootInstance = requiredContext(rootInstanceStackCursor.current);
          const context = requiredContext(contextStackCursor$1.current);
          const nextContext = getChildHostContext(context, fiber.type);
          if (context === nextContext) {
            return;
          }
          push(contextFiberStackCursor, fiber, fiber);
          push(contextStackCursor$1, nextContext, fiber);
        }
        function popHostContext(fiber) {
          if (contextFiberStackCursor.current !== fiber) {
            return;
          }
          pop(contextStackCursor$1, fiber);
          pop(contextFiberStackCursor, fiber);
        }
        const DefaultSuspenseContext = 0;
        const SubtreeSuspenseContextMask = 1;
        const InvisibleParentSuspenseContext = 1;
        const ForceSuspenseFallback = 2;
        const suspenseStackCursor = createCursor(DefaultSuspenseContext);
        function hasSuspenseContext(parentContext, flag) {
          return (parentContext & flag) !== 0;
        }
        function setDefaultShallowSuspenseContext(parentContext) {
          return parentContext & SubtreeSuspenseContextMask;
        }
        function setShallowSuspenseContext(parentContext, shallowContext) {
          return parentContext & SubtreeSuspenseContextMask | shallowContext;
        }
        function addSubtreeSuspenseContext(parentContext, subtreeContext) {
          return parentContext | subtreeContext;
        }
        function pushSuspenseContext(fiber, newContext) {
          push(suspenseStackCursor, newContext, fiber);
        }
        function popSuspenseContext(fiber) {
          pop(suspenseStackCursor, fiber);
        }
        function shouldCaptureSuspense(workInProgress2, hasInvisibleParent) {
          const nextState = workInProgress2.memoizedState;
          if (nextState !== null) {
            if (nextState.dehydrated !== null) {
              return true;
            }
            return false;
          }
          const props = workInProgress2.memoizedProps;
          {
            return true;
          }
        }
        function findFirstSuspended(row) {
          let node = row;
          while (node !== null) {
            if (node.tag === SuspenseComponent) {
              const state = node.memoizedState;
              if (state !== null) {
                const dehydrated = state.dehydrated;
                if (dehydrated === null || isSuspenseInstancePending(dehydrated) || isSuspenseInstanceFallback(dehydrated)) {
                  return node;
                }
              }
            } else if (node.tag === SuspenseListComponent && // revealOrder undefined can't be trusted because it don't
            // keep track of whether it suspended or not.
            node.memoizedProps.revealOrder !== void 0) {
              const didSuspend = (node.flags & DidCapture) !== NoFlags;
              if (didSuspend) {
                return node;
              }
            } else if (node.child !== null) {
              node.child.return = node;
              node = node.child;
              continue;
            }
            if (node === row) {
              return null;
            }
            while (node.sibling === null) {
              if (node.return === null || node.return === row) {
                return null;
              }
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
          }
          return null;
        }
        const NoFlags$1 = (
          /*   */
          0
        );
        const HasEffect = (
          /* */
          1
        );
        const Insertion = (
          /*  */
          2
        );
        const Layout = (
          /*    */
          4
        );
        const Passive$1 = (
          /*   */
          8
        );
        const workInProgressSources = [];
        function resetWorkInProgressVersions() {
          for (let i = 0; i < workInProgressSources.length; i++) {
            const mutableSource = workInProgressSources[i];
            {
              mutableSource._workInProgressVersionPrimary = null;
            }
          }
          workInProgressSources.length = 0;
        }
        function registerMutableSourceForHydration(root2, mutableSource) {
          const getVersion = mutableSource._getVersion;
          const version = getVersion(mutableSource._source);
          if (root2.mutableSourceEagerHydrationData == null) {
            root2.mutableSourceEagerHydrationData = [mutableSource, version];
          } else {
            root2.mutableSourceEagerHydrationData.push(mutableSource, version);
          }
        }
        const ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher, ReactCurrentBatchConfig$2 = ReactSharedInternals.ReactCurrentBatchConfig;
        let didWarnAboutMismatchedHooksForComponent;
        let didWarnUncachedGetSnapshot;
        {
          didWarnAboutMismatchedHooksForComponent = /* @__PURE__ */ new Set();
        }
        let renderLanes = NoLanes;
        let currentlyRenderingFiber$1 = null;
        let currentHook = null;
        let workInProgressHook = null;
        let didScheduleRenderPhaseUpdate = false;
        let didScheduleRenderPhaseUpdateDuringThisPass = false;
        let localIdCounter = 0;
        let globalClientIdCounter = 0;
        const RE_RENDER_LIMIT = 25;
        let currentHookNameInDev = null;
        let hookTypesDev = null;
        let hookTypesUpdateIndexDev = -1;
        let ignorePreviousDependencies = false;
        function mountHookTypesDev() {
          {
            const hookName = currentHookNameInDev;
            if (hookTypesDev === null) {
              hookTypesDev = [hookName];
            } else {
              hookTypesDev.push(hookName);
            }
          }
        }
        function updateHookTypesDev() {
          {
            const hookName = currentHookNameInDev;
            if (hookTypesDev !== null) {
              hookTypesUpdateIndexDev++;
              if (hookTypesDev[hookTypesUpdateIndexDev] !== hookName) {
                warnOnHookMismatchInDev(hookName);
              }
            }
          }
        }
        function checkDepsAreArrayDev(deps) {
          {
            if (deps !== void 0 && deps !== null && !isArray(deps)) {
              error("%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.", currentHookNameInDev, typeof deps);
            }
          }
        }
        function warnOnHookMismatchInDev(currentHookName) {
          {
            const componentName = getComponentNameFromFiber(currentlyRenderingFiber$1);
            if (!didWarnAboutMismatchedHooksForComponent.has(componentName)) {
              didWarnAboutMismatchedHooksForComponent.add(componentName);
              if (hookTypesDev !== null) {
                let table = "";
                const secondColumnStart = 30;
                for (let i = 0; i <= hookTypesUpdateIndexDev; i++) {
                  const oldHookName = hookTypesDev[i];
                  const newHookName = i === hookTypesUpdateIndexDev ? currentHookName : oldHookName;
                  let row = i + 1 + ". " + oldHookName;
                  while (row.length < secondColumnStart) {
                    row += " ";
                  }
                  row += newHookName + "\n";
                  table += row;
                }
                error("React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks\n\n   Previous render            Next render\n   ------------------------------------------------------\n%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n", componentName, table);
              }
            }
          }
        }
        function throwInvalidHookError() {
          throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
        }
        function areHookInputsEqual(nextDeps, prevDeps) {
          {
            if (ignorePreviousDependencies) {
              return false;
            }
          }
          if (prevDeps === null) {
            {
              error("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", currentHookNameInDev);
            }
            return false;
          }
          {
            if (nextDeps.length !== prevDeps.length) {
              error("The final argument passed to %s changed size between renders. The order and size of this array must remain constant.\n\nPrevious: %s\nIncoming: %s", currentHookNameInDev, "[" + prevDeps.join(", ") + "]", "[" + nextDeps.join(", ") + "]");
            }
          }
          for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
            if (objectIs(nextDeps[i], prevDeps[i])) {
              continue;
            }
            return false;
          }
          return true;
        }
        function renderWithHooks(current2, workInProgress2, Component, props, secondArg, nextRenderLanes) {
          renderLanes = nextRenderLanes;
          currentlyRenderingFiber$1 = workInProgress2;
          {
            hookTypesDev = current2 !== null ? current2._debugHookTypes : null;
            hookTypesUpdateIndexDev = -1;
            ignorePreviousDependencies = current2 !== null && current2.type !== workInProgress2.type;
          }
          workInProgress2.memoizedState = null;
          workInProgress2.updateQueue = null;
          workInProgress2.lanes = NoLanes;
          {
            if (current2 !== null && current2.memoizedState !== null) {
              ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;
            } else if (hookTypesDev !== null) {
              ReactCurrentDispatcher$1.current = HooksDispatcherOnMountWithHookTypesInDEV;
            } else {
              ReactCurrentDispatcher$1.current = HooksDispatcherOnMountInDEV;
            }
          }
          let children = Component(props, secondArg);
          if (didScheduleRenderPhaseUpdateDuringThisPass) {
            let numberOfReRenders = 0;
            do {
              didScheduleRenderPhaseUpdateDuringThisPass = false;
              localIdCounter = 0;
              if (numberOfReRenders >= RE_RENDER_LIMIT) {
                throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
              }
              numberOfReRenders += 1;
              {
                ignorePreviousDependencies = false;
              }
              currentHook = null;
              workInProgressHook = null;
              workInProgress2.updateQueue = null;
              {
                hookTypesUpdateIndexDev = -1;
              }
              ReactCurrentDispatcher$1.current = HooksDispatcherOnRerenderInDEV;
              children = Component(props, secondArg);
            } while (didScheduleRenderPhaseUpdateDuringThisPass);
          }
          ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;
          {
            workInProgress2._debugHookTypes = hookTypesDev;
          }
          const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;
          renderLanes = NoLanes;
          currentlyRenderingFiber$1 = null;
          currentHook = null;
          workInProgressHook = null;
          {
            currentHookNameInDev = null;
            hookTypesDev = null;
            hookTypesUpdateIndexDev = -1;
            if (current2 !== null && (current2.flags & StaticMask) !== (workInProgress2.flags & StaticMask) && // Disable this warning in legacy mode, because legacy Suspense is weird
            // and creates false positives. To make this work in legacy mode, we'd
            // need to mark fibers that commit in an incomplete state, somehow. For
            // now I'll disable the warning that most of the bugs that would trigger
            // it are either exclusive to concurrent mode or exist in both.
            (current2.mode & ConcurrentMode) !== NoMode) {
              error("Internal React error: Expected static flag was missing. Please notify the React team.");
            }
          }
          didScheduleRenderPhaseUpdate = false;
          if (didRenderTooFewHooks) {
            throw new Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
          }
          return children;
        }
        function checkDidRenderIdHook() {
          const didRenderIdHook = localIdCounter !== 0;
          localIdCounter = 0;
          return didRenderIdHook;
        }
        function bailoutHooks(current2, workInProgress2, lanes) {
          workInProgress2.updateQueue = current2.updateQueue;
          if ((workInProgress2.mode & StrictEffectsMode) !== NoMode) {
            workInProgress2.flags &= ~(MountPassiveDev | MountLayoutDev | Passive | Update);
          } else {
            workInProgress2.flags &= ~(Passive | Update);
          }
          current2.lanes = removeLanes(current2.lanes, lanes);
        }
        function resetHooksAfterThrow() {
          ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;
          if (didScheduleRenderPhaseUpdate) {
            let hook = currentlyRenderingFiber$1.memoizedState;
            while (hook !== null) {
              const queue = hook.queue;
              if (queue !== null) {
                queue.pending = null;
              }
              hook = hook.next;
            }
            didScheduleRenderPhaseUpdate = false;
          }
          renderLanes = NoLanes;
          currentlyRenderingFiber$1 = null;
          currentHook = null;
          workInProgressHook = null;
          {
            hookTypesDev = null;
            hookTypesUpdateIndexDev = -1;
            currentHookNameInDev = null;
            isUpdatingOpaqueValueInRenderPhase = false;
          }
          didScheduleRenderPhaseUpdateDuringThisPass = false;
          localIdCounter = 0;
        }
        function mountWorkInProgressHook() {
          const hook = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null
          };
          if (workInProgressHook === null) {
            currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
          } else {
            workInProgressHook = workInProgressHook.next = hook;
          }
          return workInProgressHook;
        }
        function updateWorkInProgressHook() {
          let nextCurrentHook;
          if (currentHook === null) {
            const current2 = currentlyRenderingFiber$1.alternate;
            if (current2 !== null) {
              nextCurrentHook = current2.memoizedState;
            } else {
              nextCurrentHook = null;
            }
          } else {
            nextCurrentHook = currentHook.next;
          }
          let nextWorkInProgressHook;
          if (workInProgressHook === null) {
            nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;
          } else {
            nextWorkInProgressHook = workInProgressHook.next;
          }
          if (nextWorkInProgressHook !== null) {
            workInProgressHook = nextWorkInProgressHook;
            nextWorkInProgressHook = workInProgressHook.next;
            currentHook = nextCurrentHook;
          } else {
            if (nextCurrentHook === null) {
              throw new Error("Rendered more hooks than during the previous render.");
            }
            currentHook = nextCurrentHook;
            const newHook = {
              memoizedState: currentHook.memoizedState,
              baseState: currentHook.baseState,
              baseQueue: currentHook.baseQueue,
              queue: currentHook.queue,
              next: null
            };
            if (workInProgressHook === null) {
              currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
            } else {
              workInProgressHook = workInProgressHook.next = newHook;
            }
          }
          return workInProgressHook;
        }
        function createFunctionComponentUpdateQueue() {
          return {
            lastEffect: null,
            stores: null
          };
        }
        function basicStateReducer(state, action) {
          return typeof action === "function" ? action(state) : action;
        }
        function mountReducer(reducer, initialArg, init) {
          const hook = mountWorkInProgressHook();
          let initialState;
          if (init !== void 0) {
            initialState = init(initialArg);
          } else {
            initialState = initialArg;
          }
          hook.memoizedState = hook.baseState = initialState;
          const queue = {
            pending: null,
            interleaved: null,
            lanes: NoLanes,
            dispatch: null,
            lastRenderedReducer: reducer,
            lastRenderedState: initialState
          };
          hook.queue = queue;
          const dispatch = queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber$1, queue);
          return [hook.memoizedState, dispatch];
        }
        function updateReducer(reducer, initialArg, init) {
          const hook = updateWorkInProgressHook();
          const queue = hook.queue;
          if (queue === null) {
            throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
          }
          queue.lastRenderedReducer = reducer;
          const current2 = currentHook;
          let baseQueue = current2.baseQueue;
          const pendingQueue = queue.pending;
          if (pendingQueue !== null) {
            if (baseQueue !== null) {
              const baseFirst = baseQueue.next;
              const pendingFirst = pendingQueue.next;
              baseQueue.next = pendingFirst;
              pendingQueue.next = baseFirst;
            }
            {
              if (current2.baseQueue !== baseQueue) {
                error("Internal error: Expected work-in-progress queue to be a clone. This is a bug in React.");
              }
            }
            current2.baseQueue = baseQueue = pendingQueue;
            queue.pending = null;
          }
          if (baseQueue !== null) {
            const first = baseQueue.next;
            let newState = current2.baseState;
            let newBaseState = null;
            let newBaseQueueFirst = null;
            let newBaseQueueLast = null;
            let update = first;
            do {
              const updateLane = update.lane;
              if (!isSubsetOfLanes(renderLanes, updateLane)) {
                const clone = {
                  lane: updateLane,
                  action: update.action,
                  hasEagerState: update.hasEagerState,
                  eagerState: update.eagerState,
                  next: null
                };
                if (newBaseQueueLast === null) {
                  newBaseQueueFirst = newBaseQueueLast = clone;
                  newBaseState = newState;
                } else {
                  newBaseQueueLast = newBaseQueueLast.next = clone;
                }
                currentlyRenderingFiber$1.lanes = mergeLanes(currentlyRenderingFiber$1.lanes, updateLane);
                markSkippedUpdateLanes(updateLane);
              } else {
                if (newBaseQueueLast !== null) {
                  const _clone = {
                    // This update is going to be committed so we never want uncommit
                    // it. Using NoLane works because 0 is a subset of all bitmasks, so
                    // this will never be skipped by the check above.
                    lane: NoLane,
                    action: update.action,
                    hasEagerState: update.hasEagerState,
                    eagerState: update.eagerState,
                    next: null
                  };
                  newBaseQueueLast = newBaseQueueLast.next = _clone;
                }
                if (update.hasEagerState) {
                  newState = update.eagerState;
                } else {
                  const action = update.action;
                  newState = reducer(newState, action);
                }
              }
              update = update.next;
            } while (update !== null && update !== first);
            if (newBaseQueueLast === null) {
              newBaseState = newState;
            } else {
              newBaseQueueLast.next = newBaseQueueFirst;
            }
            if (!objectIs(newState, hook.memoizedState)) {
              markWorkInProgressReceivedUpdate();
            }
            hook.memoizedState = newState;
            hook.baseState = newBaseState;
            hook.baseQueue = newBaseQueueLast;
            queue.lastRenderedState = newState;
          }
          const lastInterleaved = queue.interleaved;
          if (lastInterleaved !== null) {
            let interleaved = lastInterleaved;
            do {
              const interleavedLane = interleaved.lane;
              currentlyRenderingFiber$1.lanes = mergeLanes(currentlyRenderingFiber$1.lanes, interleavedLane);
              markSkippedUpdateLanes(interleavedLane);
              interleaved = interleaved.next;
            } while (interleaved !== lastInterleaved);
          } else if (baseQueue === null) {
            queue.lanes = NoLanes;
          }
          const dispatch = queue.dispatch;
          return [hook.memoizedState, dispatch];
        }
        function rerenderReducer(reducer, initialArg, init) {
          const hook = updateWorkInProgressHook();
          const queue = hook.queue;
          if (queue === null) {
            throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
          }
          queue.lastRenderedReducer = reducer;
          const dispatch = queue.dispatch;
          const lastRenderPhaseUpdate = queue.pending;
          let newState = hook.memoizedState;
          if (lastRenderPhaseUpdate !== null) {
            queue.pending = null;
            const firstRenderPhaseUpdate = lastRenderPhaseUpdate.next;
            let update = firstRenderPhaseUpdate;
            do {
              const action = update.action;
              newState = reducer(newState, action);
              update = update.next;
            } while (update !== firstRenderPhaseUpdate);
            if (!objectIs(newState, hook.memoizedState)) {
              markWorkInProgressReceivedUpdate();
            }
            hook.memoizedState = newState;
            if (hook.baseQueue === null) {
              hook.baseState = newState;
            }
            queue.lastRenderedState = newState;
          }
          return [newState, dispatch];
        }
        function mountMutableSource(source, getSnapshot, subscribe) {
          {
            return void 0;
          }
        }
        function updateMutableSource(source, getSnapshot, subscribe) {
          {
            return void 0;
          }
        }
        function mountSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          const fiber = currentlyRenderingFiber$1;
          const hook = mountWorkInProgressHook();
          let nextSnapshot;
          const isHydrating2 = getIsHydrating();
          if (isHydrating2) {
            if (getServerSnapshot === void 0) {
              throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
            }
            nextSnapshot = getServerSnapshot();
            {
              if (!didWarnUncachedGetSnapshot) {
                if (nextSnapshot !== getServerSnapshot()) {
                  error("The result of getServerSnapshot should be cached to avoid an infinite loop");
                  didWarnUncachedGetSnapshot = true;
                }
              }
            }
          } else {
            nextSnapshot = getSnapshot();
            {
              if (!didWarnUncachedGetSnapshot) {
                const cachedSnapshot = getSnapshot();
                if (!objectIs(nextSnapshot, cachedSnapshot)) {
                  error("The result of getSnapshot should be cached to avoid an infinite loop");
                  didWarnUncachedGetSnapshot = true;
                }
              }
            }
            const root2 = getWorkInProgressRoot();
            if (root2 === null) {
              throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
            }
            if (!includesBlockingLane(root2, renderLanes)) {
              pushStoreConsistencyCheck(fiber, getSnapshot, nextSnapshot);
            }
          }
          hook.memoizedState = nextSnapshot;
          const inst = {
            value: nextSnapshot,
            getSnapshot
          };
          hook.queue = inst;
          mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
          fiber.flags |= Passive;
          pushEffect(HasEffect | Passive$1, updateStoreInstance.bind(null, fiber, inst, nextSnapshot, getSnapshot), void 0, null);
          return nextSnapshot;
        }
        function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          const fiber = currentlyRenderingFiber$1;
          const hook = updateWorkInProgressHook();
          const nextSnapshot = getSnapshot();
          {
            if (!didWarnUncachedGetSnapshot) {
              const cachedSnapshot = getSnapshot();
              if (!objectIs(nextSnapshot, cachedSnapshot)) {
                error("The result of getSnapshot should be cached to avoid an infinite loop");
                didWarnUncachedGetSnapshot = true;
              }
            }
          }
          const prevSnapshot = hook.memoizedState;
          const snapshotChanged = !objectIs(prevSnapshot, nextSnapshot);
          if (snapshotChanged) {
            hook.memoizedState = nextSnapshot;
            markWorkInProgressReceivedUpdate();
          }
          const inst = hook.queue;
          updateEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
          if (inst.getSnapshot !== getSnapshot || snapshotChanged || // Check if the susbcribe function changed. We can save some memory by
          // checking whether we scheduled a subscription effect above.
          workInProgressHook !== null && workInProgressHook.memoizedState.tag & HasEffect) {
            fiber.flags |= Passive;
            pushEffect(HasEffect | Passive$1, updateStoreInstance.bind(null, fiber, inst, nextSnapshot, getSnapshot), void 0, null);
            const root2 = getWorkInProgressRoot();
            if (root2 === null) {
              throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
            }
            if (!includesBlockingLane(root2, renderLanes)) {
              pushStoreConsistencyCheck(fiber, getSnapshot, nextSnapshot);
            }
          }
          return nextSnapshot;
        }
        function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
          fiber.flags |= StoreConsistency;
          const check = {
            getSnapshot,
            value: renderedSnapshot
          };
          let componentUpdateQueue = currentlyRenderingFiber$1.updateQueue;
          if (componentUpdateQueue === null) {
            componentUpdateQueue = createFunctionComponentUpdateQueue();
            currentlyRenderingFiber$1.updateQueue = componentUpdateQueue;
            componentUpdateQueue.stores = [check];
          } else {
            const stores = componentUpdateQueue.stores;
            if (stores === null) {
              componentUpdateQueue.stores = [check];
            } else {
              stores.push(check);
            }
          }
        }
        function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
          inst.value = nextSnapshot;
          inst.getSnapshot = getSnapshot;
          if (checkIfSnapshotChanged(inst)) {
            forceStoreRerender(fiber);
          }
        }
        function subscribeToStore(fiber, inst, subscribe) {
          const handleStoreChange = function() {
            if (checkIfSnapshotChanged(inst)) {
              forceStoreRerender(fiber);
            }
          };
          return subscribe(handleStoreChange);
        }
        function checkIfSnapshotChanged(inst) {
          const latestGetSnapshot = inst.getSnapshot;
          const prevValue = inst.value;
          try {
            const nextValue = latestGetSnapshot();
            return !objectIs(prevValue, nextValue);
          } catch (error2) {
            return true;
          }
        }
        function forceStoreRerender(fiber) {
          const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
          if (root2 !== null) {
            scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
          }
        }
        function mountState(initialState) {
          const hook = mountWorkInProgressHook();
          if (typeof initialState === "function") {
            initialState = initialState();
          }
          hook.memoizedState = hook.baseState = initialState;
          const queue = {
            pending: null,
            interleaved: null,
            lanes: NoLanes,
            dispatch: null,
            lastRenderedReducer: basicStateReducer,
            lastRenderedState: initialState
          };
          hook.queue = queue;
          const dispatch = queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue);
          return [hook.memoizedState, dispatch];
        }
        function updateState(initialState) {
          return updateReducer(basicStateReducer);
        }
        function rerenderState(initialState) {
          return rerenderReducer(basicStateReducer);
        }
        function pushEffect(tag, create, destroy, deps) {
          const effect = {
            tag,
            create,
            destroy,
            deps,
            // Circular
            next: null
          };
          let componentUpdateQueue = currentlyRenderingFiber$1.updateQueue;
          if (componentUpdateQueue === null) {
            componentUpdateQueue = createFunctionComponentUpdateQueue();
            currentlyRenderingFiber$1.updateQueue = componentUpdateQueue;
            componentUpdateQueue.lastEffect = effect.next = effect;
          } else {
            const lastEffect = componentUpdateQueue.lastEffect;
            if (lastEffect === null) {
              componentUpdateQueue.lastEffect = effect.next = effect;
            } else {
              const firstEffect = lastEffect.next;
              lastEffect.next = effect;
              effect.next = firstEffect;
              componentUpdateQueue.lastEffect = effect;
            }
          }
          return effect;
        }
        function mountRef(initialValue) {
          const hook = mountWorkInProgressHook();
          {
            const _ref2 = {
              current: initialValue
            };
            hook.memoizedState = _ref2;
            return _ref2;
          }
        }
        function updateRef(initialValue) {
          const hook = updateWorkInProgressHook();
          return hook.memoizedState;
        }
        function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
          const hook = mountWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          currentlyRenderingFiber$1.flags |= fiberFlags;
          hook.memoizedState = pushEffect(HasEffect | hookFlags, create, void 0, nextDeps);
        }
        function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
          const hook = updateWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          let destroy = void 0;
          if (currentHook !== null) {
            const prevEffect = currentHook.memoizedState;
            destroy = prevEffect.destroy;
            if (nextDeps !== null) {
              const prevDeps = prevEffect.deps;
              if (areHookInputsEqual(nextDeps, prevDeps)) {
                hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
                return;
              }
            }
          }
          currentlyRenderingFiber$1.flags |= fiberFlags;
          hook.memoizedState = pushEffect(HasEffect | hookFlags, create, destroy, nextDeps);
        }
        function mountEffect(create, deps) {
          if ((currentlyRenderingFiber$1.mode & StrictEffectsMode) !== NoMode) {
            return mountEffectImpl(MountPassiveDev | Passive | PassiveStatic, Passive$1, create, deps);
          } else {
            return mountEffectImpl(Passive | PassiveStatic, Passive$1, create, deps);
          }
        }
        function updateEffect(create, deps) {
          return updateEffectImpl(Passive, Passive$1, create, deps);
        }
        function mountInsertionEffect(create, deps) {
          return mountEffectImpl(Update, Insertion, create, deps);
        }
        function updateInsertionEffect(create, deps) {
          return updateEffectImpl(Update, Insertion, create, deps);
        }
        function mountLayoutEffect(create, deps) {
          let fiberFlags = Update;
          {
            fiberFlags |= LayoutStatic;
          }
          if ((currentlyRenderingFiber$1.mode & StrictEffectsMode) !== NoMode) {
            fiberFlags |= MountLayoutDev;
          }
          return mountEffectImpl(fiberFlags, Layout, create, deps);
        }
        function updateLayoutEffect(create, deps) {
          return updateEffectImpl(Update, Layout, create, deps);
        }
        function imperativeHandleEffect(create, ref) {
          if (typeof ref === "function") {
            const refCallback = ref;
            const _inst = create();
            refCallback(_inst);
            return function() {
              refCallback(null);
            };
          } else if (ref !== null && ref !== void 0) {
            const refObject = ref;
            {
              if (!refObject.hasOwnProperty("current")) {
                error("Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.", "an object with keys {" + Object.keys(refObject).join(", ") + "}");
              }
            }
            const _inst2 = create();
            refObject.current = _inst2;
            return function() {
              refObject.current = null;
            };
          }
        }
        function mountImperativeHandle(ref, create, deps) {
          {
            if (typeof create !== "function") {
              error("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", create !== null ? typeof create : "null");
            }
          }
          const effectDeps = deps !== null && deps !== void 0 ? deps.concat([ref]) : null;
          let fiberFlags = Update;
          {
            fiberFlags |= LayoutStatic;
          }
          if ((currentlyRenderingFiber$1.mode & StrictEffectsMode) !== NoMode) {
            fiberFlags |= MountLayoutDev;
          }
          return mountEffectImpl(fiberFlags, Layout, imperativeHandleEffect.bind(null, create, ref), effectDeps);
        }
        function updateImperativeHandle(ref, create, deps) {
          {
            if (typeof create !== "function") {
              error("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", create !== null ? typeof create : "null");
            }
          }
          const effectDeps = deps !== null && deps !== void 0 ? deps.concat([ref]) : null;
          return updateEffectImpl(Update, Layout, imperativeHandleEffect.bind(null, create, ref), effectDeps);
        }
        function mountDebugValue(value, formatterFn) {
        }
        const updateDebugValue = mountDebugValue;
        function mountCallback(callback, deps) {
          const hook = mountWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          hook.memoizedState = [callback, nextDeps];
          return callback;
        }
        function updateCallback(callback, deps) {
          const hook = updateWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          const prevState = hook.memoizedState;
          if (prevState !== null) {
            if (nextDeps !== null) {
              const prevDeps = prevState[1];
              if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0];
              }
            }
          }
          hook.memoizedState = [callback, nextDeps];
          return callback;
        }
        function mountMemo(nextCreate, deps) {
          const hook = mountWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          const nextValue = nextCreate();
          hook.memoizedState = [nextValue, nextDeps];
          return nextValue;
        }
        function updateMemo(nextCreate, deps) {
          const hook = updateWorkInProgressHook();
          const nextDeps = deps === void 0 ? null : deps;
          const prevState = hook.memoizedState;
          if (prevState !== null) {
            if (nextDeps !== null) {
              const prevDeps = prevState[1];
              if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0];
              }
            }
          }
          const nextValue = nextCreate();
          hook.memoizedState = [nextValue, nextDeps];
          return nextValue;
        }
        function mountDeferredValue(value) {
          const hook = mountWorkInProgressHook();
          hook.memoizedState = value;
          return value;
        }
        function updateDeferredValue(value) {
          const hook = updateWorkInProgressHook();
          const resolvedCurrentHook = currentHook;
          const prevValue = resolvedCurrentHook.memoizedState;
          return updateDeferredValueImpl(hook, prevValue, value);
        }
        function rerenderDeferredValue(value) {
          const hook = updateWorkInProgressHook();
          if (currentHook === null) {
            hook.memoizedState = value;
            return value;
          } else {
            const prevValue = currentHook.memoizedState;
            return updateDeferredValueImpl(hook, prevValue, value);
          }
        }
        function updateDeferredValueImpl(hook, prevValue, value) {
          const shouldDeferValue = !includesOnlyNonUrgentLanes(renderLanes);
          if (shouldDeferValue) {
            if (!objectIs(value, prevValue)) {
              const deferredLane = claimNextTransitionLane();
              currentlyRenderingFiber$1.lanes = mergeLanes(currentlyRenderingFiber$1.lanes, deferredLane);
              markSkippedUpdateLanes(deferredLane);
              hook.baseState = true;
            }
            return prevValue;
          } else {
            if (hook.baseState) {
              hook.baseState = false;
              markWorkInProgressReceivedUpdate();
            }
            hook.memoizedState = value;
            return value;
          }
        }
        function startTransition(setPending, callback, options2) {
          const previousPriority = getCurrentUpdatePriority();
          setCurrentUpdatePriority(higherEventPriority(previousPriority, ContinuousEventPriority));
          setPending(true);
          const prevTransition = ReactCurrentBatchConfig$2.transition;
          ReactCurrentBatchConfig$2.transition = {};
          const currentTransition = ReactCurrentBatchConfig$2.transition;
          {
            ReactCurrentBatchConfig$2.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            setPending(false);
            callback();
          } finally {
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig$2.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                const updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        function mountTransition() {
          const _mountState = mountState(false), isPending = _mountState[0], setPending = _mountState[1];
          const start = startTransition.bind(null, setPending);
          const hook = mountWorkInProgressHook();
          hook.memoizedState = start;
          return [isPending, start];
        }
        function updateTransition() {
          const _updateState = updateState(), isPending = _updateState[0];
          const hook = updateWorkInProgressHook();
          const start = hook.memoizedState;
          return [isPending, start];
        }
        function rerenderTransition() {
          const _rerenderState = rerenderState(), isPending = _rerenderState[0];
          const hook = updateWorkInProgressHook();
          const start = hook.memoizedState;
          return [isPending, start];
        }
        var isUpdatingOpaqueValueInRenderPhase = false;
        function getIsUpdatingOpaqueValueInRenderPhaseInDEV() {
          {
            return isUpdatingOpaqueValueInRenderPhase;
          }
        }
        function mountId() {
          const hook = mountWorkInProgressHook();
          const root2 = getWorkInProgressRoot();
          const identifierPrefix = root2.identifierPrefix;
          let id;
          if (getIsHydrating()) {
            const treeId = getTreeId();
            id = ":" + identifierPrefix + "R" + treeId;
            const localId = localIdCounter++;
            if (localId > 0) {
              id += "H" + localId.toString(32);
            }
            id += ":";
          } else {
            const globalClientId = globalClientIdCounter++;
            id = ":" + identifierPrefix + "r" + globalClientId.toString(32) + ":";
          }
          hook.memoizedState = id;
          return id;
        }
        function updateId() {
          const hook = updateWorkInProgressHook();
          const id = hook.memoizedState;
          return id;
        }
        function dispatchReducerAction(fiber, queue, action) {
          {
            if (typeof arguments[3] === "function") {
              error("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
            }
          }
          const lane = requestUpdateLane(fiber);
          const update = {
            lane,
            action,
            hasEagerState: false,
            eagerState: null,
            next: null
          };
          if (isRenderPhaseUpdate(fiber)) {
            enqueueRenderPhaseUpdate(queue, update);
          } else {
            const root2 = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
            if (root2 !== null) {
              const eventTime = requestEventTime();
              scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
              entangleTransitionUpdate(root2, queue, lane);
            }
          }
          markUpdateInDevTools(fiber, lane);
        }
        function dispatchSetState(fiber, queue, action) {
          {
            if (typeof arguments[3] === "function") {
              error("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
            }
          }
          const lane = requestUpdateLane(fiber);
          const update = {
            lane,
            action,
            hasEagerState: false,
            eagerState: null,
            next: null
          };
          if (isRenderPhaseUpdate(fiber)) {
            enqueueRenderPhaseUpdate(queue, update);
          } else {
            const alternate = fiber.alternate;
            if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes)) {
              const lastRenderedReducer = queue.lastRenderedReducer;
              if (lastRenderedReducer !== null) {
                let prevDispatcher;
                {
                  prevDispatcher = ReactCurrentDispatcher$1.current;
                  ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
                }
                try {
                  const currentState = queue.lastRenderedState;
                  const eagerState = lastRenderedReducer(currentState, action);
                  update.hasEagerState = true;
                  update.eagerState = eagerState;
                  if (objectIs(eagerState, currentState)) {
                    enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update, lane);
                    return;
                  }
                } catch (error2) {
                } finally {
                  {
                    ReactCurrentDispatcher$1.current = prevDispatcher;
                  }
                }
              }
            }
            const root2 = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
            if (root2 !== null) {
              const eventTime = requestEventTime();
              scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
              entangleTransitionUpdate(root2, queue, lane);
            }
          }
          markUpdateInDevTools(fiber, lane);
        }
        function isRenderPhaseUpdate(fiber) {
          const alternate = fiber.alternate;
          return fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1;
        }
        function enqueueRenderPhaseUpdate(queue, update) {
          didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
          const pending = queue.pending;
          if (pending === null) {
            update.next = update;
          } else {
            update.next = pending.next;
            pending.next = update;
          }
          queue.pending = update;
        }
        function entangleTransitionUpdate(root2, queue, lane) {
          if (isTransitionLane(lane)) {
            let queueLanes = queue.lanes;
            queueLanes = intersectLanes(queueLanes, root2.pendingLanes);
            const newQueueLanes = mergeLanes(queueLanes, lane);
            queue.lanes = newQueueLanes;
            markRootEntangled(root2, newQueueLanes);
          }
        }
        function markUpdateInDevTools(fiber, lane, action) {
          {
            markStateUpdateScheduled(fiber, lane);
          }
        }
        var ContextOnlyDispatcher = {
          readContext,
          useCallback: throwInvalidHookError,
          useContext: throwInvalidHookError,
          useEffect: throwInvalidHookError,
          useImperativeHandle: throwInvalidHookError,
          useInsertionEffect: throwInvalidHookError,
          useLayoutEffect: throwInvalidHookError,
          useMemo: throwInvalidHookError,
          useReducer: throwInvalidHookError,
          useRef: throwInvalidHookError,
          useState: throwInvalidHookError,
          useDebugValue: throwInvalidHookError,
          useDeferredValue: throwInvalidHookError,
          useTransition: throwInvalidHookError,
          useMutableSource: throwInvalidHookError,
          useSyncExternalStore: throwInvalidHookError,
          useId: throwInvalidHookError,
          unstable_isNewReconciler: enableNewReconciler
        };
        var HooksDispatcherOnMountInDEV = null;
        var HooksDispatcherOnMountWithHookTypesInDEV = null;
        var HooksDispatcherOnUpdateInDEV = null;
        var HooksDispatcherOnRerenderInDEV = null;
        let InvalidNestedHooksDispatcherOnMountInDEV = null;
        var InvalidNestedHooksDispatcherOnUpdateInDEV = null;
        let InvalidNestedHooksDispatcherOnRerenderInDEV = null;
        {
          const warnInvalidContextAccess = function() {
            error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
          };
          const warnInvalidHookAccess = function() {
            error("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
          };
          HooksDispatcherOnMountInDEV = {
            readContext: function(context) {
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              return mountCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              mountHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              return mountEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              return mountImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              return mountInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              return mountLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              mountHookTypesDev();
              checkDepsAreArrayDev(deps);
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              mountHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              mountHookTypesDev();
              return mountRef(initialValue);
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              mountHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              mountHookTypesDev();
              return mountDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              mountHookTypesDev();
              return mountDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              mountHookTypesDev();
              return mountTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              mountHookTypesDev();
              return mountMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              mountHookTypesDev();
              return mountSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              mountHookTypesDev();
              return mountId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          HooksDispatcherOnMountWithHookTypesInDEV = {
            readContext: function(context) {
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              updateHookTypesDev();
              return mountCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              updateHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              updateHookTypesDev();
              return mountEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              updateHookTypesDev();
              return mountImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              updateHookTypesDev();
              return mountInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              updateHookTypesDev();
              return mountLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              updateHookTypesDev();
              return mountRef(initialValue);
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              updateHookTypesDev();
              return mountDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              updateHookTypesDev();
              return mountDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              updateHookTypesDev();
              return mountTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              updateHookTypesDev();
              return mountMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              updateHookTypesDev();
              return mountSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              updateHookTypesDev();
              return mountId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          HooksDispatcherOnUpdateInDEV = {
            readContext: function(context) {
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              updateHookTypesDev();
              return updateCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              updateHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              updateHookTypesDev();
              return updateEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              updateHookTypesDev();
              return updateImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              updateHookTypesDev();
              return updateInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              updateHookTypesDev();
              return updateLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              updateHookTypesDev();
              return updateRef();
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              updateHookTypesDev();
              return updateDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              updateHookTypesDev();
              return updateDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              updateHookTypesDev();
              return updateTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              updateHookTypesDev();
              return updateMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              updateHookTypesDev();
              return updateSyncExternalStore(subscribe, getSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              updateHookTypesDev();
              return updateId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          HooksDispatcherOnRerenderInDEV = {
            readContext: function(context) {
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              updateHookTypesDev();
              return updateCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              updateHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              updateHookTypesDev();
              return updateEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              updateHookTypesDev();
              return updateImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              updateHookTypesDev();
              return updateInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              updateHookTypesDev();
              return updateLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnRerenderInDEV;
              try {
                return updateMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnRerenderInDEV;
              try {
                return rerenderReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              updateHookTypesDev();
              return updateRef();
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnRerenderInDEV;
              try {
                return rerenderState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              updateHookTypesDev();
              return updateDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              updateHookTypesDev();
              return rerenderDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              updateHookTypesDev();
              return rerenderTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              updateHookTypesDev();
              return updateMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              updateHookTypesDev();
              return updateSyncExternalStore(subscribe, getSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              updateHookTypesDev();
              return updateId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          InvalidNestedHooksDispatcherOnMountInDEV = {
            readContext: function(context) {
              warnInvalidContextAccess();
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              warnInvalidHookAccess();
              mountHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              warnInvalidHookAccess();
              mountHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountRef(initialValue);
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              warnInvalidHookAccess();
              mountHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
              try {
                return mountState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              warnInvalidHookAccess();
              mountHookTypesDev();
              return mountId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          InvalidNestedHooksDispatcherOnUpdateInDEV = {
            readContext: function(context) {
              warnInvalidContextAccess();
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateRef();
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateSyncExternalStore(subscribe, getSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
          InvalidNestedHooksDispatcherOnRerenderInDEV = {
            readContext: function(context) {
              warnInvalidContextAccess();
              return readContext(context);
            },
            useCallback: function(callback, deps) {
              currentHookNameInDev = "useCallback";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateCallback(callback, deps);
            },
            useContext: function(context) {
              currentHookNameInDev = "useContext";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return readContext(context);
            },
            useEffect: function(create, deps) {
              currentHookNameInDev = "useEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateEffect(create, deps);
            },
            useImperativeHandle: function(ref, create, deps) {
              currentHookNameInDev = "useImperativeHandle";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateImperativeHandle(ref, create, deps);
            },
            useInsertionEffect: function(create, deps) {
              currentHookNameInDev = "useInsertionEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateInsertionEffect(create, deps);
            },
            useLayoutEffect: function(create, deps) {
              currentHookNameInDev = "useLayoutEffect";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateLayoutEffect(create, deps);
            },
            useMemo: function(create, deps) {
              currentHookNameInDev = "useMemo";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return updateMemo(create, deps);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useReducer: function(reducer, initialArg, init) {
              currentHookNameInDev = "useReducer";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return rerenderReducer(reducer, initialArg, init);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useRef: function(initialValue) {
              currentHookNameInDev = "useRef";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateRef();
            },
            useState: function(initialState) {
              currentHookNameInDev = "useState";
              warnInvalidHookAccess();
              updateHookTypesDev();
              const prevDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              try {
                return rerenderState(initialState);
              } finally {
                ReactCurrentDispatcher$1.current = prevDispatcher;
              }
            },
            useDebugValue: function(value, formatterFn) {
              currentHookNameInDev = "useDebugValue";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateDebugValue();
            },
            useDeferredValue: function(value) {
              currentHookNameInDev = "useDeferredValue";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return rerenderDeferredValue(value);
            },
            useTransition: function() {
              currentHookNameInDev = "useTransition";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return rerenderTransition();
            },
            useMutableSource: function(source, getSnapshot, subscribe) {
              currentHookNameInDev = "useMutableSource";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateMutableSource();
            },
            useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
              currentHookNameInDev = "useSyncExternalStore";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateSyncExternalStore(subscribe, getSnapshot);
            },
            useId: function() {
              currentHookNameInDev = "useId";
              warnInvalidHookAccess();
              updateHookTypesDev();
              return updateId();
            },
            unstable_isNewReconciler: enableNewReconciler
          };
        }
        const now$1 = Scheduler.unstable_now;
        let commitTime = 0;
        let layoutEffectStartTime = -1;
        let profilerStartTime = -1;
        let passiveEffectStartTime = -1;
        let currentUpdateIsNested = false;
        let nestedUpdateScheduled = false;
        function isCurrentUpdateNested() {
          return currentUpdateIsNested;
        }
        function markNestedUpdateScheduled() {
          {
            nestedUpdateScheduled = true;
          }
        }
        function resetNestedUpdateFlag() {
          {
            currentUpdateIsNested = false;
            nestedUpdateScheduled = false;
          }
        }
        function syncNestedUpdateFlag() {
          {
            currentUpdateIsNested = nestedUpdateScheduled;
            nestedUpdateScheduled = false;
          }
        }
        function getCommitTime() {
          return commitTime;
        }
        function recordCommitTime() {
          commitTime = now$1();
        }
        function startProfilerTimer(fiber) {
          profilerStartTime = now$1();
          if (fiber.actualStartTime < 0) {
            fiber.actualStartTime = now$1();
          }
        }
        function stopProfilerTimerIfRunning(fiber) {
          profilerStartTime = -1;
        }
        function stopProfilerTimerIfRunningAndRecordDelta(fiber, overrideBaseTime) {
          if (profilerStartTime >= 0) {
            const elapsedTime = now$1() - profilerStartTime;
            fiber.actualDuration += elapsedTime;
            if (overrideBaseTime) {
              fiber.selfBaseDuration = elapsedTime;
            }
            profilerStartTime = -1;
          }
        }
        function recordLayoutEffectDuration(fiber) {
          if (layoutEffectStartTime >= 0) {
            const elapsedTime = now$1() - layoutEffectStartTime;
            layoutEffectStartTime = -1;
            let parentFiber = fiber.return;
            while (parentFiber !== null) {
              switch (parentFiber.tag) {
                case HostRoot:
                  var root2 = parentFiber.stateNode;
                  root2.effectDuration += elapsedTime;
                  return;
                case Profiler:
                  var parentStateNode = parentFiber.stateNode;
                  parentStateNode.effectDuration += elapsedTime;
                  return;
              }
              parentFiber = parentFiber.return;
            }
          }
        }
        function recordPassiveEffectDuration(fiber) {
          if (passiveEffectStartTime >= 0) {
            const elapsedTime = now$1() - passiveEffectStartTime;
            passiveEffectStartTime = -1;
            let parentFiber = fiber.return;
            while (parentFiber !== null) {
              switch (parentFiber.tag) {
                case HostRoot:
                  var root2 = parentFiber.stateNode;
                  if (root2 !== null) {
                    root2.passiveEffectDuration += elapsedTime;
                  }
                  return;
                case Profiler:
                  var parentStateNode = parentFiber.stateNode;
                  if (parentStateNode !== null) {
                    parentStateNode.passiveEffectDuration += elapsedTime;
                  }
                  return;
              }
              parentFiber = parentFiber.return;
            }
          }
        }
        function startLayoutEffectTimer() {
          layoutEffectStartTime = now$1();
        }
        function startPassiveEffectTimer() {
          passiveEffectStartTime = now$1();
        }
        function transferActualDuration(fiber) {
          let child = fiber.child;
          while (child) {
            fiber.actualDuration += child.actualDuration;
            child = child.sibling;
          }
        }
        function resolveDefaultProps(Component, baseProps) {
          if (Component && Component.defaultProps) {
            const props = assign({}, baseProps);
            const defaultProps = Component.defaultProps;
            for (const propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
            return props;
          }
          return baseProps;
        }
        const fakeInternalInstance = {};
        let didWarnAboutStateAssignmentForComponent;
        let didWarnAboutUninitializedState;
        let didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
        let didWarnAboutLegacyLifecyclesAndDerivedState;
        let didWarnAboutUndefinedDerivedState;
        let warnOnUndefinedDerivedState;
        let warnOnInvalidCallback;
        let didWarnAboutDirectlyAssigningPropsToState;
        let didWarnAboutContextTypeAndContextTypes;
        let didWarnAboutInvalidateContextType;
        let didWarnAboutLegacyContext$1;
        {
          didWarnAboutStateAssignmentForComponent = /* @__PURE__ */ new Set();
          didWarnAboutUninitializedState = /* @__PURE__ */ new Set();
          didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = /* @__PURE__ */ new Set();
          didWarnAboutLegacyLifecyclesAndDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutDirectlyAssigningPropsToState = /* @__PURE__ */ new Set();
          didWarnAboutUndefinedDerivedState = /* @__PURE__ */ new Set();
          didWarnAboutContextTypeAndContextTypes = /* @__PURE__ */ new Set();
          didWarnAboutInvalidateContextType = /* @__PURE__ */ new Set();
          didWarnAboutLegacyContext$1 = /* @__PURE__ */ new Set();
          const didWarnOnInvalidCallback = /* @__PURE__ */ new Set();
          warnOnInvalidCallback = function(callback, callerName) {
            if (callback === null || typeof callback === "function") {
              return;
            }
            const key = callerName + "_" + callback;
            if (!didWarnOnInvalidCallback.has(key)) {
              didWarnOnInvalidCallback.add(key);
              error("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callerName, callback);
            }
          };
          warnOnUndefinedDerivedState = function(type, partialState) {
            if (partialState === void 0) {
              const componentName = getComponentNameFromType(type) || "Component";
              if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
                didWarnAboutUndefinedDerivedState.add(componentName);
                error("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", componentName);
              }
            }
          };
          Object.defineProperty(fakeInternalInstance, "_processChildContext", {
            enumerable: false,
            value: function() {
              throw new Error("_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn't supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).");
            }
          });
          Object.freeze(fakeInternalInstance);
        }
        function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
          const prevState = workInProgress2.memoizedState;
          let partialState = getDerivedStateFromProps(nextProps, prevState);
          {
            if (workInProgress2.mode & StrictLegacyMode) {
              setIsStrictModeForDevtools(true);
              try {
                partialState = getDerivedStateFromProps(nextProps, prevState);
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
            warnOnUndefinedDerivedState(ctor, partialState);
          }
          const memoizedState = partialState === null || partialState === void 0 ? prevState : assign({}, prevState, partialState);
          workInProgress2.memoizedState = memoizedState;
          if (workInProgress2.lanes === NoLanes) {
            const updateQueue = workInProgress2.updateQueue;
            updateQueue.baseState = memoizedState;
          }
        }
        const classComponentUpdater = {
          isMounted,
          enqueueSetState: function(inst, payload, callback) {
            const fiber = get(inst);
            const eventTime = requestEventTime();
            const lane = requestUpdateLane(fiber);
            const update = createUpdate(eventTime, lane);
            update.payload = payload;
            if (callback !== void 0 && callback !== null) {
              {
                warnOnInvalidCallback(callback, "setState");
              }
              update.callback = callback;
            }
            const root2 = enqueueUpdate(fiber, update, lane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
              entangleTransitions(root2, fiber, lane);
            }
            {
              markStateUpdateScheduled(fiber, lane);
            }
          },
          enqueueReplaceState: function(inst, payload, callback) {
            const fiber = get(inst);
            const eventTime = requestEventTime();
            const lane = requestUpdateLane(fiber);
            const update = createUpdate(eventTime, lane);
            update.tag = ReplaceState;
            update.payload = payload;
            if (callback !== void 0 && callback !== null) {
              {
                warnOnInvalidCallback(callback, "replaceState");
              }
              update.callback = callback;
            }
            const root2 = enqueueUpdate(fiber, update, lane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
              entangleTransitions(root2, fiber, lane);
            }
            {
              markStateUpdateScheduled(fiber, lane);
            }
          },
          enqueueForceUpdate: function(inst, callback) {
            const fiber = get(inst);
            const eventTime = requestEventTime();
            const lane = requestUpdateLane(fiber);
            const update = createUpdate(eventTime, lane);
            update.tag = ForceUpdate;
            if (callback !== void 0 && callback !== null) {
              {
                warnOnInvalidCallback(callback, "forceUpdate");
              }
              update.callback = callback;
            }
            const root2 = enqueueUpdate(fiber, update, lane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
              entangleTransitions(root2, fiber, lane);
            }
            {
              markForceUpdateScheduled(fiber, lane);
            }
          }
        };
        function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
          const instance = workInProgress2.stateNode;
          if (typeof instance.shouldComponentUpdate === "function") {
            let shouldUpdate = instance.shouldComponentUpdate(newProps, newState, nextContext);
            {
              if (workInProgress2.mode & StrictLegacyMode) {
                setIsStrictModeForDevtools(true);
                try {
                  shouldUpdate = instance.shouldComponentUpdate(newProps, newState, nextContext);
                } finally {
                  setIsStrictModeForDevtools(false);
                }
              }
              if (shouldUpdate === void 0) {
                error("%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.", getComponentNameFromType(ctor) || "Component");
              }
            }
            return shouldUpdate;
          }
          if (ctor.prototype && ctor.prototype.isPureReactComponent) {
            return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
          }
          return true;
        }
        function checkClassInstance(workInProgress2, ctor, newProps) {
          const instance = workInProgress2.stateNode;
          {
            const name = getComponentNameFromType(ctor) || "Component";
            const renderPresent = instance.render;
            if (!renderPresent) {
              if (ctor.prototype && typeof ctor.prototype.render === "function") {
                error("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", name);
              } else {
                error("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", name);
              }
            }
            if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
              error("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", name);
            }
            if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", name);
            }
            if (instance.propTypes) {
              error("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", name);
            }
            if (instance.contextType) {
              error("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", name);
            }
            {
              if (ctor.childContextTypes && !didWarnAboutLegacyContext$1.has(ctor) && // Strict Mode has its own warning for legacy context, so we can skip
              // this one.
              (workInProgress2.mode & StrictLegacyMode) === NoMode) {
                didWarnAboutLegacyContext$1.add(ctor);
                error("%s uses the legacy childContextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() instead\n\n.Learn more about this warning here: https://reactjs.org/link/legacy-context", name);
              }
              if (ctor.contextTypes && !didWarnAboutLegacyContext$1.has(ctor) && // Strict Mode has its own warning for legacy context, so we can skip
              // this one.
              (workInProgress2.mode & StrictLegacyMode) === NoMode) {
                didWarnAboutLegacyContext$1.add(ctor);
                error("%s uses the legacy contextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() with static contextType instead.\n\nLearn more about this warning here: https://reactjs.org/link/legacy-context", name);
              }
              if (instance.contextTypes) {
                error("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", name);
              }
              if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
                didWarnAboutContextTypeAndContextTypes.add(ctor);
                error("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", name);
              }
            }
            if (typeof instance.componentShouldUpdate === "function") {
              error("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", name);
            }
            if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== "undefined") {
              error("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", getComponentNameFromType(ctor) || "A pure component");
            }
            if (typeof instance.componentDidUnmount === "function") {
              error("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", name);
            }
            if (typeof instance.componentDidReceiveProps === "function") {
              error("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", name);
            }
            if (typeof instance.componentWillRecieveProps === "function") {
              error("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", name);
            }
            if (typeof instance.UNSAFE_componentWillRecieveProps === "function") {
              error("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", name);
            }
            const hasMutatedProps = instance.props !== newProps;
            if (instance.props !== void 0 && hasMutatedProps) {
              error("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", name, name);
            }
            if (instance.defaultProps) {
              error("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", name, name);
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function" && typeof instance.componentDidUpdate !== "function" && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
              didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
              error("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", getComponentNameFromType(ctor));
            }
            if (typeof instance.getDerivedStateFromProps === "function") {
              error("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof instance.getDerivedStateFromError === "function") {
              error("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", name);
            }
            if (typeof ctor.getSnapshotBeforeUpdate === "function") {
              error("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", name);
            }
            const _state = instance.state;
            if (_state && (typeof _state !== "object" || isArray(_state))) {
              error("%s.state: must be set to an object or null", name);
            }
            if (typeof instance.getChildContext === "function" && typeof ctor.childContextTypes !== "object") {
              error("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", name);
            }
          }
        }
        function adoptClassInstance(workInProgress2, instance) {
          instance.updater = classComponentUpdater;
          workInProgress2.stateNode = instance;
          set(instance, workInProgress2);
          {
            instance._reactInternalInstance = fakeInternalInstance;
          }
        }
        function constructClassInstance(workInProgress2, ctor, props) {
          let isLegacyContextConsumer = false;
          let unmaskedContext = emptyContextObject;
          let context = emptyContextObject;
          const contextType = ctor.contextType;
          {
            if ("contextType" in ctor) {
              const isValid = (
                // Allow null for conditional declaration
                contextType === null || contextType !== void 0 && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === void 0
              );
              if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
                didWarnAboutInvalidateContextType.add(ctor);
                let addendum = "";
                if (contextType === void 0) {
                  addendum = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file.";
                } else if (typeof contextType !== "object") {
                  addendum = " However, it is set to a " + typeof contextType + ".";
                } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                  addendum = " Did you accidentally pass the Context.Provider instead?";
                } else if (contextType._context !== void 0) {
                  addendum = " Did you accidentally pass the Context.Consumer instead?";
                } else {
                  addendum = " However, it is set to an object with keys {" + Object.keys(contextType).join(", ") + "}.";
                }
                error("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", getComponentNameFromType(ctor) || "Component", addendum);
              }
            }
          }
          if (typeof contextType === "object" && contextType !== null) {
            context = readContext(contextType);
          } else {
            unmaskedContext = getUnmaskedContext(workInProgress2, ctor, true);
            const contextTypes = ctor.contextTypes;
            isLegacyContextConsumer = contextTypes !== null && contextTypes !== void 0;
            context = isLegacyContextConsumer ? getMaskedContext(workInProgress2, unmaskedContext) : emptyContextObject;
          }
          let instance = new ctor(props, context);
          {
            if (workInProgress2.mode & StrictLegacyMode) {
              setIsStrictModeForDevtools(true);
              try {
                instance = new ctor(props, context);
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
          }
          const state = workInProgress2.memoizedState = instance.state !== null && instance.state !== void 0 ? instance.state : null;
          adoptClassInstance(workInProgress2, instance);
          {
            if (typeof ctor.getDerivedStateFromProps === "function" && state === null) {
              const componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutUninitializedState.has(componentName)) {
                didWarnAboutUninitializedState.add(componentName);
                error("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", componentName, instance.state === null ? "null" : "undefined", componentName);
              }
            }
            if (typeof ctor.getDerivedStateFromProps === "function" || typeof instance.getSnapshotBeforeUpdate === "function") {
              let foundWillMountName = null;
              let foundWillReceivePropsName = null;
              let foundWillUpdateName = null;
              if (typeof instance.componentWillMount === "function" && instance.componentWillMount.__suppressDeprecationWarning !== true) {
                foundWillMountName = "componentWillMount";
              } else if (typeof instance.UNSAFE_componentWillMount === "function") {
                foundWillMountName = "UNSAFE_componentWillMount";
              }
              if (typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
                foundWillReceivePropsName = "componentWillReceiveProps";
              } else if (typeof instance.UNSAFE_componentWillReceiveProps === "function") {
                foundWillReceivePropsName = "UNSAFE_componentWillReceiveProps";
              }
              if (typeof instance.componentWillUpdate === "function" && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
                foundWillUpdateName = "componentWillUpdate";
              } else if (typeof instance.UNSAFE_componentWillUpdate === "function") {
                foundWillUpdateName = "UNSAFE_componentWillUpdate";
              }
              if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
                const _componentName = getComponentNameFromType(ctor) || "Component";
                const newApiName = typeof ctor.getDerivedStateFromProps === "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
                if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
                  didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
                  error("Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://reactjs.org/link/unsafe-component-lifecycles", _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : "", foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : "", foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : "");
                }
              }
            }
          }
          if (isLegacyContextConsumer) {
            cacheContext(workInProgress2, unmaskedContext, context);
          }
          return instance;
        }
        function callComponentWillMount(workInProgress2, instance) {
          const oldState = instance.state;
          if (typeof instance.componentWillMount === "function") {
            instance.componentWillMount();
          }
          if (typeof instance.UNSAFE_componentWillMount === "function") {
            instance.UNSAFE_componentWillMount();
          }
          if (oldState !== instance.state) {
            {
              error("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", getComponentNameFromFiber(workInProgress2) || "Component");
            }
            classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
          }
        }
        function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
          const oldState = instance.state;
          if (typeof instance.componentWillReceiveProps === "function") {
            instance.componentWillReceiveProps(newProps, nextContext);
          }
          if (typeof instance.UNSAFE_componentWillReceiveProps === "function") {
            instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
          }
          if (instance.state !== oldState) {
            {
              const componentName = getComponentNameFromFiber(workInProgress2) || "Component";
              if (!didWarnAboutStateAssignmentForComponent.has(componentName)) {
                didWarnAboutStateAssignmentForComponent.add(componentName);
                error("%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", componentName);
              }
            }
            classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
          }
        }
        function mountClassInstance(workInProgress2, ctor, newProps, renderLanes2) {
          {
            checkClassInstance(workInProgress2, ctor, newProps);
          }
          const instance = workInProgress2.stateNode;
          instance.props = newProps;
          instance.state = workInProgress2.memoizedState;
          instance.refs = {};
          initializeUpdateQueue(workInProgress2);
          const contextType = ctor.contextType;
          if (typeof contextType === "object" && contextType !== null) {
            instance.context = readContext(contextType);
          } else {
            const unmaskedContext = getUnmaskedContext(workInProgress2, ctor, true);
            instance.context = getMaskedContext(workInProgress2, unmaskedContext);
          }
          {
            if (instance.state === newProps) {
              const componentName = getComponentNameFromType(ctor) || "Component";
              if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
                didWarnAboutDirectlyAssigningPropsToState.add(componentName);
                error("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", componentName);
              }
            }
            if (workInProgress2.mode & StrictLegacyMode) {
              ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress2, instance);
            }
            {
              ReactStrictModeWarnings.recordUnsafeLifecycleWarnings(workInProgress2, instance);
            }
          }
          instance.state = workInProgress2.memoizedState;
          const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
          if (typeof getDerivedStateFromProps === "function") {
            applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, newProps);
            instance.state = workInProgress2.memoizedState;
          }
          if (typeof ctor.getDerivedStateFromProps !== "function" && typeof instance.getSnapshotBeforeUpdate !== "function" && (typeof instance.UNSAFE_componentWillMount === "function" || typeof instance.componentWillMount === "function")) {
            callComponentWillMount(workInProgress2, instance);
            processUpdateQueue(workInProgress2, newProps, instance, renderLanes2);
            instance.state = workInProgress2.memoizedState;
          }
          if (typeof instance.componentDidMount === "function") {
            let fiberFlags = Update;
            {
              fiberFlags |= LayoutStatic;
            }
            if ((workInProgress2.mode & StrictEffectsMode) !== NoMode) {
              fiberFlags |= MountLayoutDev;
            }
            workInProgress2.flags |= fiberFlags;
          }
        }
        function resumeMountClassInstance(workInProgress2, ctor, newProps, renderLanes2) {
          const instance = workInProgress2.stateNode;
          const oldProps = workInProgress2.memoizedProps;
          instance.props = oldProps;
          const oldContext = instance.context;
          const contextType = ctor.contextType;
          let nextContext = emptyContextObject;
          if (typeof contextType === "object" && contextType !== null) {
            nextContext = readContext(contextType);
          } else {
            const nextLegacyUnmaskedContext = getUnmaskedContext(workInProgress2, ctor, true);
            nextContext = getMaskedContext(workInProgress2, nextLegacyUnmaskedContext);
          }
          const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
          const hasNewLifecycles = typeof getDerivedStateFromProps === "function" || typeof instance.getSnapshotBeforeUpdate === "function";
          if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === "function" || typeof instance.componentWillReceiveProps === "function")) {
            if (oldProps !== newProps || oldContext !== nextContext) {
              callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext);
            }
          }
          resetHasForceUpdateBeforeProcessing();
          const oldState = workInProgress2.memoizedState;
          let newState = instance.state = oldState;
          processUpdateQueue(workInProgress2, newProps, instance, renderLanes2);
          newState = workInProgress2.memoizedState;
          if (oldProps === newProps && oldState === newState && !hasContextChanged() && !checkHasForceUpdateAfterProcessing()) {
            if (typeof instance.componentDidMount === "function") {
              let fiberFlags = Update;
              {
                fiberFlags |= LayoutStatic;
              }
              if ((workInProgress2.mode & StrictEffectsMode) !== NoMode) {
                fiberFlags |= MountLayoutDev;
              }
              workInProgress2.flags |= fiberFlags;
            }
            return false;
          }
          if (typeof getDerivedStateFromProps === "function") {
            applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, newProps);
            newState = workInProgress2.memoizedState;
          }
          const shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext);
          if (shouldUpdate) {
            if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillMount === "function" || typeof instance.componentWillMount === "function")) {
              if (typeof instance.componentWillMount === "function") {
                instance.componentWillMount();
              }
              if (typeof instance.UNSAFE_componentWillMount === "function") {
                instance.UNSAFE_componentWillMount();
              }
            }
            if (typeof instance.componentDidMount === "function") {
              let _fiberFlags = Update;
              {
                _fiberFlags |= LayoutStatic;
              }
              if ((workInProgress2.mode & StrictEffectsMode) !== NoMode) {
                _fiberFlags |= MountLayoutDev;
              }
              workInProgress2.flags |= _fiberFlags;
            }
          } else {
            if (typeof instance.componentDidMount === "function") {
              let _fiberFlags2 = Update;
              {
                _fiberFlags2 |= LayoutStatic;
              }
              if ((workInProgress2.mode & StrictEffectsMode) !== NoMode) {
                _fiberFlags2 |= MountLayoutDev;
              }
              workInProgress2.flags |= _fiberFlags2;
            }
            workInProgress2.memoizedProps = newProps;
            workInProgress2.memoizedState = newState;
          }
          instance.props = newProps;
          instance.state = newState;
          instance.context = nextContext;
          return shouldUpdate;
        }
        function updateClassInstance(current2, workInProgress2, ctor, newProps, renderLanes2) {
          const instance = workInProgress2.stateNode;
          cloneUpdateQueue(current2, workInProgress2);
          const unresolvedOldProps = workInProgress2.memoizedProps;
          const oldProps = workInProgress2.type === workInProgress2.elementType ? unresolvedOldProps : resolveDefaultProps(workInProgress2.type, unresolvedOldProps);
          instance.props = oldProps;
          const unresolvedNewProps = workInProgress2.pendingProps;
          const oldContext = instance.context;
          const contextType = ctor.contextType;
          let nextContext = emptyContextObject;
          if (typeof contextType === "object" && contextType !== null) {
            nextContext = readContext(contextType);
          } else {
            const nextUnmaskedContext = getUnmaskedContext(workInProgress2, ctor, true);
            nextContext = getMaskedContext(workInProgress2, nextUnmaskedContext);
          }
          const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
          const hasNewLifecycles = typeof getDerivedStateFromProps === "function" || typeof instance.getSnapshotBeforeUpdate === "function";
          if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === "function" || typeof instance.componentWillReceiveProps === "function")) {
            if (unresolvedOldProps !== unresolvedNewProps || oldContext !== nextContext) {
              callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext);
            }
          }
          resetHasForceUpdateBeforeProcessing();
          const oldState = workInProgress2.memoizedState;
          let newState = instance.state = oldState;
          processUpdateQueue(workInProgress2, newProps, instance, renderLanes2);
          newState = workInProgress2.memoizedState;
          if (unresolvedOldProps === unresolvedNewProps && oldState === newState && !hasContextChanged() && !checkHasForceUpdateAfterProcessing() && !enableLazyContextPropagation) {
            if (typeof instance.componentDidUpdate === "function") {
              if (unresolvedOldProps !== current2.memoizedProps || oldState !== current2.memoizedState) {
                workInProgress2.flags |= Update;
              }
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function") {
              if (unresolvedOldProps !== current2.memoizedProps || oldState !== current2.memoizedState) {
                workInProgress2.flags |= Snapshot;
              }
            }
            return false;
          }
          if (typeof getDerivedStateFromProps === "function") {
            applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, newProps);
            newState = workInProgress2.memoizedState;
          }
          const shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) || // TODO: In some cases, we'll end up checking if context has changed twice,
          // both before and after `shouldComponentUpdate` has been called. Not ideal,
          // but I'm loath to refactor this function. This only happens for memoized
          // components so it's not that common.
          enableLazyContextPropagation;
          if (shouldUpdate) {
            if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillUpdate === "function" || typeof instance.componentWillUpdate === "function")) {
              if (typeof instance.componentWillUpdate === "function") {
                instance.componentWillUpdate(newProps, newState, nextContext);
              }
              if (typeof instance.UNSAFE_componentWillUpdate === "function") {
                instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
              }
            }
            if (typeof instance.componentDidUpdate === "function") {
              workInProgress2.flags |= Update;
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function") {
              workInProgress2.flags |= Snapshot;
            }
          } else {
            if (typeof instance.componentDidUpdate === "function") {
              if (unresolvedOldProps !== current2.memoizedProps || oldState !== current2.memoizedState) {
                workInProgress2.flags |= Update;
              }
            }
            if (typeof instance.getSnapshotBeforeUpdate === "function") {
              if (unresolvedOldProps !== current2.memoizedProps || oldState !== current2.memoizedState) {
                workInProgress2.flags |= Snapshot;
              }
            }
            workInProgress2.memoizedProps = newProps;
            workInProgress2.memoizedState = newState;
          }
          instance.props = newProps;
          instance.state = newState;
          instance.context = nextContext;
          return shouldUpdate;
        }
        function createCapturedValueAtFiber(value, source) {
          return {
            value,
            source,
            stack: getStackByFiberInDevAndProd(source),
            digest: null
          };
        }
        function createCapturedValue(value, digest, stack) {
          return {
            value,
            source: null,
            stack: stack != null ? stack : null,
            digest: digest != null ? digest : null
          };
        }
        function showErrorDialog(boundary, errorInfo) {
          return true;
        }
        function logCapturedError(boundary, errorInfo) {
          try {
            const logError = showErrorDialog(boundary, errorInfo);
            if (logError === false) {
              return;
            }
            const error2 = errorInfo.value;
            if (true) {
              const source = errorInfo.source;
              const stack = errorInfo.stack;
              const componentStack = stack !== null ? stack : "";
              if (error2 != null && error2._suppressLogging) {
                if (boundary.tag === ClassComponent) {
                  return;
                }
                console["error"](error2);
              }
              const componentName = source ? getComponentNameFromFiber(source) : null;
              const componentNameMessage = componentName ? "The above error occurred in the <" + componentName + "> component:" : "The above error occurred in one of your React components:";
              let errorBoundaryMessage;
              if (boundary.tag === HostRoot) {
                errorBoundaryMessage = "Consider adding an error boundary to your tree to customize error handling behavior.\nVisit https://reactjs.org/link/error-boundaries to learn more about error boundaries.";
              } else {
                const errorBoundaryName = getComponentNameFromFiber(boundary) || "Anonymous";
                errorBoundaryMessage = "React will try to recreate this component tree from scratch " + ("using the error boundary you provided, " + errorBoundaryName + ".");
              }
              const combinedMessage = componentNameMessage + "\n" + componentStack + "\n\n" + ("" + errorBoundaryMessage);
              console["error"](combinedMessage);
            } else {
              console["error"](error2);
            }
          } catch (e) {
            setTimeout(function() {
              throw e;
            });
          }
        }
        const PossiblyWeakMap$1 = typeof WeakMap === "function" ? WeakMap : Map;
        function createRootErrorUpdate(fiber, errorInfo, lane) {
          const update = createUpdate(NoTimestamp, lane);
          update.tag = CaptureUpdate;
          update.payload = {
            element: null
          };
          const error2 = errorInfo.value;
          update.callback = function() {
            onUncaughtError(error2);
            logCapturedError(fiber, errorInfo);
          };
          return update;
        }
        function createClassErrorUpdate(fiber, errorInfo, lane) {
          const update = createUpdate(NoTimestamp, lane);
          update.tag = CaptureUpdate;
          const getDerivedStateFromError = fiber.type.getDerivedStateFromError;
          if (typeof getDerivedStateFromError === "function") {
            const error$1 = errorInfo.value;
            update.payload = function() {
              return getDerivedStateFromError(error$1);
            };
            update.callback = function() {
              {
                markFailedErrorBoundaryForHotReloading(fiber);
              }
              logCapturedError(fiber, errorInfo);
            };
          }
          const inst = fiber.stateNode;
          if (inst !== null && typeof inst.componentDidCatch === "function") {
            update.callback = function callback() {
              {
                markFailedErrorBoundaryForHotReloading(fiber);
              }
              logCapturedError(fiber, errorInfo);
              if (typeof getDerivedStateFromError !== "function") {
                markLegacyErrorBoundaryAsFailed(this);
              }
              const error$12 = errorInfo.value;
              const stack = errorInfo.stack;
              this.componentDidCatch(error$12, {
                componentStack: stack !== null ? stack : ""
              });
              {
                if (typeof getDerivedStateFromError !== "function") {
                  if (!includesSomeLane(fiber.lanes, SyncLane)) {
                    error("%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.", getComponentNameFromFiber(fiber) || "Unknown");
                  }
                }
              }
            };
          }
          return update;
        }
        function attachPingListener(root2, wakeable, lanes) {
          let pingCache = root2.pingCache;
          let threadIDs;
          if (pingCache === null) {
            pingCache = root2.pingCache = new PossiblyWeakMap$1();
            threadIDs = /* @__PURE__ */ new Set();
            pingCache.set(wakeable, threadIDs);
          } else {
            threadIDs = pingCache.get(wakeable);
            if (threadIDs === void 0) {
              threadIDs = /* @__PURE__ */ new Set();
              pingCache.set(wakeable, threadIDs);
            }
          }
          if (!threadIDs.has(lanes)) {
            threadIDs.add(lanes);
            const ping = pingSuspendedRoot.bind(null, root2, wakeable, lanes);
            {
              if (isDevToolsPresent) {
                restorePendingUpdaters(root2, lanes);
              }
            }
            wakeable.then(ping, ping);
          }
        }
        function attachRetryListener(suspenseBoundary, root2, wakeable, lanes) {
          const wakeables = suspenseBoundary.updateQueue;
          if (wakeables === null) {
            const updateQueue = /* @__PURE__ */ new Set();
            updateQueue.add(wakeable);
            suspenseBoundary.updateQueue = updateQueue;
          } else {
            wakeables.add(wakeable);
          }
        }
        function resetSuspendedComponent(sourceFiber, rootRenderLanes) {
          const tag = sourceFiber.tag;
          if ((sourceFiber.mode & ConcurrentMode) === NoMode && (tag === FunctionComponent || tag === ForwardRef || tag === SimpleMemoComponent)) {
            const currentSource = sourceFiber.alternate;
            if (currentSource) {
              sourceFiber.updateQueue = currentSource.updateQueue;
              sourceFiber.memoizedState = currentSource.memoizedState;
              sourceFiber.lanes = currentSource.lanes;
            } else {
              sourceFiber.updateQueue = null;
              sourceFiber.memoizedState = null;
            }
          }
        }
        function getNearestSuspenseBoundaryToCapture(returnFiber) {
          let node = returnFiber;
          do {
            if (node.tag === SuspenseComponent && shouldCaptureSuspense(node)) {
              return node;
            }
            node = node.return;
          } while (node !== null);
          return null;
        }
        function markSuspenseBoundaryShouldCapture(suspenseBoundary, returnFiber, sourceFiber, root2, rootRenderLanes) {
          if ((suspenseBoundary.mode & ConcurrentMode) === NoMode) {
            if (suspenseBoundary === returnFiber) {
              suspenseBoundary.flags |= ShouldCapture;
            } else {
              suspenseBoundary.flags |= DidCapture;
              sourceFiber.flags |= ForceUpdateForLegacySuspense;
              sourceFiber.flags &= ~(LifecycleEffectMask | Incomplete);
              if (sourceFiber.tag === ClassComponent) {
                const currentSourceFiber = sourceFiber.alternate;
                if (currentSourceFiber === null) {
                  sourceFiber.tag = IncompleteClassComponent;
                } else {
                  const update = createUpdate(NoTimestamp, SyncLane);
                  update.tag = ForceUpdate;
                  enqueueUpdate(sourceFiber, update, SyncLane);
                }
              }
              sourceFiber.lanes = mergeLanes(sourceFiber.lanes, SyncLane);
            }
            return suspenseBoundary;
          }
          suspenseBoundary.flags |= ShouldCapture;
          suspenseBoundary.lanes = rootRenderLanes;
          return suspenseBoundary;
        }
        function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
          sourceFiber.flags |= Incomplete;
          {
            if (isDevToolsPresent) {
              restorePendingUpdaters(root2, rootRenderLanes);
            }
          }
          if (value !== null && typeof value === "object" && typeof value.then === "function") {
            const wakeable = value;
            resetSuspendedComponent(sourceFiber);
            {
              if (getIsHydrating() && sourceFiber.mode & ConcurrentMode) {
                markDidThrowWhileHydratingDEV();
              }
            }
            const suspenseBoundary = getNearestSuspenseBoundaryToCapture(returnFiber);
            if (suspenseBoundary !== null) {
              suspenseBoundary.flags &= ~ForceClientRender;
              markSuspenseBoundaryShouldCapture(suspenseBoundary, returnFiber, sourceFiber, root2, rootRenderLanes);
              if (suspenseBoundary.mode & ConcurrentMode) {
                attachPingListener(root2, wakeable, rootRenderLanes);
              }
              attachRetryListener(suspenseBoundary, root2, wakeable);
              return;
            } else {
              if (!includesSyncLane(rootRenderLanes)) {
                attachPingListener(root2, wakeable, rootRenderLanes);
                renderDidSuspendDelayIfPossible();
                return;
              }
              const uncaughtSuspenseError = new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
              value = uncaughtSuspenseError;
            }
          } else {
            if (getIsHydrating() && sourceFiber.mode & ConcurrentMode) {
              markDidThrowWhileHydratingDEV();
              const _suspenseBoundary = getNearestSuspenseBoundaryToCapture(returnFiber);
              if (_suspenseBoundary !== null) {
                if ((_suspenseBoundary.flags & ShouldCapture) === NoFlags) {
                  _suspenseBoundary.flags |= ForceClientRender;
                }
                markSuspenseBoundaryShouldCapture(_suspenseBoundary, returnFiber, sourceFiber, root2, rootRenderLanes);
                queueHydrationError(createCapturedValueAtFiber(value, sourceFiber));
                return;
              }
            }
          }
          value = createCapturedValueAtFiber(value, sourceFiber);
          renderDidError(value);
          let workInProgress2 = returnFiber;
          do {
            switch (workInProgress2.tag) {
              case HostRoot: {
                const _errorInfo = value;
                workInProgress2.flags |= ShouldCapture;
                const lane = pickArbitraryLane(rootRenderLanes);
                workInProgress2.lanes = mergeLanes(workInProgress2.lanes, lane);
                const update = createRootErrorUpdate(workInProgress2, _errorInfo, lane);
                enqueueCapturedUpdate(workInProgress2, update);
                return;
              }
              case ClassComponent:
                var errorInfo = value;
                var ctor = workInProgress2.type;
                var instance = workInProgress2.stateNode;
                if ((workInProgress2.flags & DidCapture) === NoFlags && (typeof ctor.getDerivedStateFromError === "function" || instance !== null && typeof instance.componentDidCatch === "function" && !isAlreadyFailedLegacyErrorBoundary(instance))) {
                  workInProgress2.flags |= ShouldCapture;
                  const _lane = pickArbitraryLane(rootRenderLanes);
                  workInProgress2.lanes = mergeLanes(workInProgress2.lanes, _lane);
                  const _update = createClassErrorUpdate(workInProgress2, errorInfo, _lane);
                  enqueueCapturedUpdate(workInProgress2, _update);
                  return;
                }
                break;
            }
            workInProgress2 = workInProgress2.return;
          } while (workInProgress2 !== null);
        }
        function getSuspendedCache() {
          {
            return null;
          }
        }
        const ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
        let didReceiveUpdate = false;
        let didWarnAboutBadClass;
        let didWarnAboutModulePatternComponent;
        let didWarnAboutContextTypeOnFunctionComponent;
        let didWarnAboutGetDerivedStateOnFunctionComponent;
        let didWarnAboutFunctionRefs;
        let didWarnAboutReassigningProps;
        let didWarnAboutRevealOrder;
        let didWarnAboutTailOptions;
        let didWarnAboutDefaultPropsOnFunctionComponent;
        {
          didWarnAboutBadClass = {};
          didWarnAboutModulePatternComponent = {};
          didWarnAboutContextTypeOnFunctionComponent = {};
          didWarnAboutGetDerivedStateOnFunctionComponent = {};
          didWarnAboutFunctionRefs = {};
          didWarnAboutReassigningProps = false;
          didWarnAboutRevealOrder = {};
          didWarnAboutTailOptions = {};
          didWarnAboutDefaultPropsOnFunctionComponent = {};
        }
        function reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2) {
          if (current2 === null) {
            workInProgress2.child = mountChildFibers(workInProgress2, null, nextChildren, renderLanes2);
          } else {
            workInProgress2.child = reconcileChildFibers(workInProgress2, current2.child, nextChildren, renderLanes2);
          }
        }
        function forceUnmountCurrentAndReconcile(current2, workInProgress2, nextChildren, renderLanes2) {
          workInProgress2.child = reconcileChildFibers(workInProgress2, current2.child, null, renderLanes2);
          workInProgress2.child = reconcileChildFibers(workInProgress2, null, nextChildren, renderLanes2);
        }
        function updateForwardRef(current2, workInProgress2, Component, nextProps, renderLanes2) {
          {
            if (workInProgress2.type !== workInProgress2.elementType) {
              const innerPropTypes = Component.propTypes;
              if (innerPropTypes) {
                checkPropTypes(
                  innerPropTypes,
                  nextProps,
                  // Resolved props
                  "prop",
                  getComponentNameFromType(Component)
                );
              }
            }
          }
          const render2 = Component.render;
          const ref = workInProgress2.ref;
          let nextChildren;
          let hasId;
          prepareToReadContext(workInProgress2, renderLanes2);
          {
            markComponentRenderStarted(workInProgress2);
          }
          {
            ReactCurrentOwner$1.current = workInProgress2;
            setIsRendering(true);
            nextChildren = renderWithHooks(current2, workInProgress2, render2, nextProps, ref, renderLanes2);
            hasId = checkDidRenderIdHook();
            if (workInProgress2.mode & StrictLegacyMode) {
              setIsStrictModeForDevtools(true);
              try {
                nextChildren = renderWithHooks(current2, workInProgress2, render2, nextProps, ref, renderLanes2);
                hasId = checkDidRenderIdHook();
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
            setIsRendering(false);
          }
          {
            markComponentRenderStopped();
          }
          if (current2 !== null && !didReceiveUpdate) {
            bailoutHooks(current2, workInProgress2, renderLanes2);
            return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
          }
          if (getIsHydrating() && hasId) {
            pushMaterializedTreeId(workInProgress2);
          }
          workInProgress2.flags |= PerformedWork;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateMemoComponent(current2, workInProgress2, Component, nextProps, renderLanes2) {
          if (current2 === null) {
            const type = Component.type;
            if (isSimpleFunctionComponent(type) && Component.compare === null && // SimpleMemoComponent codepath doesn't resolve outer props either.
            Component.defaultProps === void 0) {
              let resolvedType = type;
              {
                resolvedType = resolveFunctionForHotReloading(type);
              }
              workInProgress2.tag = SimpleMemoComponent;
              workInProgress2.type = resolvedType;
              {
                validateFunctionComponentInDev(workInProgress2, type);
              }
              return updateSimpleMemoComponent(current2, workInProgress2, resolvedType, nextProps, renderLanes2);
            }
            {
              const innerPropTypes = type.propTypes;
              if (innerPropTypes) {
                checkPropTypes(
                  innerPropTypes,
                  nextProps,
                  // Resolved props
                  "prop",
                  getComponentNameFromType(type)
                );
              }
              if (Component.defaultProps !== void 0) {
                const componentName = getComponentNameFromType(type) || "Unknown";
                if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
                  error("%s: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.", componentName);
                  didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
                }
              }
            }
            const child = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress2, workInProgress2.mode, renderLanes2);
            child.ref = workInProgress2.ref;
            child.return = workInProgress2;
            workInProgress2.child = child;
            return child;
          }
          {
            const _type = Component.type;
            const _innerPropTypes = _type.propTypes;
            if (_innerPropTypes) {
              checkPropTypes(
                _innerPropTypes,
                nextProps,
                // Resolved props
                "prop",
                getComponentNameFromType(_type)
              );
            }
          }
          const currentChild = current2.child;
          const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current2, renderLanes2);
          if (!hasScheduledUpdateOrContext) {
            const prevProps = currentChild.memoizedProps;
            let compare = Component.compare;
            compare = compare !== null ? compare : shallowEqual;
            if (compare(prevProps, nextProps) && current2.ref === workInProgress2.ref) {
              return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
            }
          }
          workInProgress2.flags |= PerformedWork;
          const newChild = createWorkInProgress(currentChild, nextProps);
          newChild.ref = workInProgress2.ref;
          newChild.return = workInProgress2;
          workInProgress2.child = newChild;
          return newChild;
        }
        function updateSimpleMemoComponent(current2, workInProgress2, Component, nextProps, renderLanes2) {
          {
            if (workInProgress2.type !== workInProgress2.elementType) {
              let outerMemoType = workInProgress2.elementType;
              if (outerMemoType.$$typeof === REACT_LAZY_TYPE) {
                const lazyComponent = outerMemoType;
                const payload = lazyComponent._payload;
                const init = lazyComponent._init;
                try {
                  outerMemoType = init(payload);
                } catch (x) {
                  outerMemoType = null;
                }
                const outerPropTypes = outerMemoType && outerMemoType.propTypes;
                if (outerPropTypes) {
                  checkPropTypes(
                    outerPropTypes,
                    nextProps,
                    // Resolved (SimpleMemoComponent has no defaultProps)
                    "prop",
                    getComponentNameFromType(outerMemoType)
                  );
                }
              }
            }
          }
          if (current2 !== null) {
            const prevProps = current2.memoizedProps;
            if (shallowEqual(prevProps, nextProps) && current2.ref === workInProgress2.ref && // Prevent bailout if the implementation changed due to hot reload.
            workInProgress2.type === current2.type) {
              didReceiveUpdate = false;
              workInProgress2.pendingProps = nextProps = prevProps;
              if (!checkScheduledUpdateOrContext(current2, renderLanes2)) {
                workInProgress2.lanes = current2.lanes;
                return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
              } else if ((current2.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
                didReceiveUpdate = true;
              }
            }
          }
          return updateFunctionComponent(current2, workInProgress2, Component, nextProps, renderLanes2);
        }
        function updateOffscreenComponent(current2, workInProgress2, renderLanes2) {
          const nextProps = workInProgress2.pendingProps;
          const nextChildren = nextProps.children;
          const prevState = current2 !== null ? current2.memoizedState : null;
          if (nextProps.mode === "hidden" || enableLegacyHidden) {
            if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
              const nextState = {
                baseLanes: NoLanes,
                cachePool: null,
                transitions: null
              };
              workInProgress2.memoizedState = nextState;
              pushRenderLanes(workInProgress2, renderLanes2);
            } else if (!includesSomeLane(renderLanes2, OffscreenLane)) {
              const spawnedCachePool = null;
              let nextBaseLanes;
              if (prevState !== null) {
                const prevBaseLanes = prevState.baseLanes;
                nextBaseLanes = mergeLanes(prevBaseLanes, renderLanes2);
              } else {
                nextBaseLanes = renderLanes2;
              }
              workInProgress2.lanes = workInProgress2.childLanes = laneToLanes(OffscreenLane);
              const _nextState = {
                baseLanes: nextBaseLanes,
                cachePool: spawnedCachePool,
                transitions: null
              };
              workInProgress2.memoizedState = _nextState;
              workInProgress2.updateQueue = null;
              pushRenderLanes(workInProgress2, nextBaseLanes);
              return null;
            } else {
              const _nextState2 = {
                baseLanes: NoLanes,
                cachePool: null,
                transitions: null
              };
              workInProgress2.memoizedState = _nextState2;
              const subtreeRenderLanes2 = prevState !== null ? prevState.baseLanes : renderLanes2;
              pushRenderLanes(workInProgress2, subtreeRenderLanes2);
            }
          } else {
            let _subtreeRenderLanes;
            if (prevState !== null) {
              _subtreeRenderLanes = mergeLanes(prevState.baseLanes, renderLanes2);
              workInProgress2.memoizedState = null;
            } else {
              _subtreeRenderLanes = renderLanes2;
            }
            pushRenderLanes(workInProgress2, _subtreeRenderLanes);
          }
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateFragment(current2, workInProgress2, renderLanes2) {
          const nextChildren = workInProgress2.pendingProps;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateMode(current2, workInProgress2, renderLanes2) {
          const nextChildren = workInProgress2.pendingProps.children;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateProfiler(current2, workInProgress2, renderLanes2) {
          {
            workInProgress2.flags |= Update;
            {
              const stateNode = workInProgress2.stateNode;
              stateNode.effectDuration = 0;
              stateNode.passiveEffectDuration = 0;
            }
          }
          const nextProps = workInProgress2.pendingProps;
          const nextChildren = nextProps.children;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function markRef(current2, workInProgress2) {
          const ref = workInProgress2.ref;
          if (current2 === null && ref !== null || current2 !== null && current2.ref !== ref) {
            workInProgress2.flags |= Ref;
            {
              workInProgress2.flags |= RefStatic;
            }
          }
        }
        function updateFunctionComponent(current2, workInProgress2, Component, nextProps, renderLanes2) {
          {
            if (workInProgress2.type !== workInProgress2.elementType) {
              const innerPropTypes = Component.propTypes;
              if (innerPropTypes) {
                checkPropTypes(
                  innerPropTypes,
                  nextProps,
                  // Resolved props
                  "prop",
                  getComponentNameFromType(Component)
                );
              }
            }
          }
          let context;
          {
            const unmaskedContext = getUnmaskedContext(workInProgress2, Component, true);
            context = getMaskedContext(workInProgress2, unmaskedContext);
          }
          let nextChildren;
          let hasId;
          prepareToReadContext(workInProgress2, renderLanes2);
          {
            markComponentRenderStarted(workInProgress2);
          }
          {
            ReactCurrentOwner$1.current = workInProgress2;
            setIsRendering(true);
            nextChildren = renderWithHooks(current2, workInProgress2, Component, nextProps, context, renderLanes2);
            hasId = checkDidRenderIdHook();
            if (workInProgress2.mode & StrictLegacyMode) {
              setIsStrictModeForDevtools(true);
              try {
                nextChildren = renderWithHooks(current2, workInProgress2, Component, nextProps, context, renderLanes2);
                hasId = checkDidRenderIdHook();
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
            setIsRendering(false);
          }
          {
            markComponentRenderStopped();
          }
          if (current2 !== null && !didReceiveUpdate) {
            bailoutHooks(current2, workInProgress2, renderLanes2);
            return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
          }
          if (getIsHydrating() && hasId) {
            pushMaterializedTreeId(workInProgress2);
          }
          workInProgress2.flags |= PerformedWork;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateClassComponent(current2, workInProgress2, Component, nextProps, renderLanes2) {
          {
            switch (shouldError(workInProgress2)) {
              case false: {
                const _instance = workInProgress2.stateNode;
                const ctor = workInProgress2.type;
                const tempInstance = new ctor(workInProgress2.memoizedProps, _instance.context);
                const state = tempInstance.state;
                _instance.updater.enqueueSetState(_instance, state, null);
                break;
              }
              case true: {
                workInProgress2.flags |= DidCapture;
                workInProgress2.flags |= ShouldCapture;
                const error$1 = new Error("Simulated error coming from DevTools");
                const lane = pickArbitraryLane(renderLanes2);
                workInProgress2.lanes = mergeLanes(workInProgress2.lanes, lane);
                const update = createClassErrorUpdate(workInProgress2, createCapturedValueAtFiber(error$1, workInProgress2), lane);
                enqueueCapturedUpdate(workInProgress2, update);
                break;
              }
            }
            if (workInProgress2.type !== workInProgress2.elementType) {
              const innerPropTypes = Component.propTypes;
              if (innerPropTypes) {
                checkPropTypes(
                  innerPropTypes,
                  nextProps,
                  // Resolved props
                  "prop",
                  getComponentNameFromType(Component)
                );
              }
            }
          }
          let hasContext;
          if (isContextProvider(Component)) {
            hasContext = true;
            pushContextProvider(workInProgress2);
          } else {
            hasContext = false;
          }
          prepareToReadContext(workInProgress2, renderLanes2);
          const instance = workInProgress2.stateNode;
          let shouldUpdate;
          if (instance === null) {
            resetSuspendedCurrentOnMountInLegacyMode(current2, workInProgress2);
            constructClassInstance(workInProgress2, Component, nextProps);
            mountClassInstance(workInProgress2, Component, nextProps, renderLanes2);
            shouldUpdate = true;
          } else if (current2 === null) {
            shouldUpdate = resumeMountClassInstance(workInProgress2, Component, nextProps, renderLanes2);
          } else {
            shouldUpdate = updateClassInstance(current2, workInProgress2, Component, nextProps, renderLanes2);
          }
          const nextUnitOfWork = finishClassComponent(current2, workInProgress2, Component, shouldUpdate, hasContext, renderLanes2);
          {
            const inst = workInProgress2.stateNode;
            if (shouldUpdate && inst.props !== nextProps) {
              if (!didWarnAboutReassigningProps) {
                error("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", getComponentNameFromFiber(workInProgress2) || "a component");
              }
              didWarnAboutReassigningProps = true;
            }
          }
          return nextUnitOfWork;
        }
        function finishClassComponent(current2, workInProgress2, Component, shouldUpdate, hasContext, renderLanes2) {
          markRef(current2, workInProgress2);
          const didCaptureError = (workInProgress2.flags & DidCapture) !== NoFlags;
          if (!shouldUpdate && !didCaptureError) {
            if (hasContext) {
              invalidateContextProvider(workInProgress2, Component, false);
            }
            return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
          }
          const instance = workInProgress2.stateNode;
          ReactCurrentOwner$1.current = workInProgress2;
          let nextChildren;
          if (didCaptureError && typeof Component.getDerivedStateFromError !== "function") {
            nextChildren = null;
            {
              stopProfilerTimerIfRunning();
            }
          } else {
            {
              markComponentRenderStarted(workInProgress2);
            }
            {
              setIsRendering(true);
              nextChildren = instance.render();
              if (workInProgress2.mode & StrictLegacyMode) {
                setIsStrictModeForDevtools(true);
                try {
                  instance.render();
                } finally {
                  setIsStrictModeForDevtools(false);
                }
              }
              setIsRendering(false);
            }
            {
              markComponentRenderStopped();
            }
          }
          workInProgress2.flags |= PerformedWork;
          if (current2 !== null && didCaptureError) {
            forceUnmountCurrentAndReconcile(current2, workInProgress2, nextChildren, renderLanes2);
          } else {
            reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          }
          workInProgress2.memoizedState = instance.state;
          if (hasContext) {
            invalidateContextProvider(workInProgress2, Component, true);
          }
          return workInProgress2.child;
        }
        function pushHostRootContext(workInProgress2) {
          const root2 = workInProgress2.stateNode;
          if (root2.pendingContext) {
            pushTopLevelContextObject(workInProgress2, root2.pendingContext, root2.pendingContext !== root2.context);
          } else if (root2.context) {
            pushTopLevelContextObject(workInProgress2, root2.context, false);
          }
          pushHostContainer(workInProgress2, root2.containerInfo);
        }
        function updateHostRoot(current2, workInProgress2, renderLanes2) {
          pushHostRootContext(workInProgress2);
          if (current2 === null) {
            throw new Error("Should have a current fiber. This is a bug in React.");
          }
          const nextProps = workInProgress2.pendingProps;
          const prevState = workInProgress2.memoizedState;
          const prevChildren = prevState.element;
          cloneUpdateQueue(current2, workInProgress2);
          processUpdateQueue(workInProgress2, nextProps, null, renderLanes2);
          const nextState = workInProgress2.memoizedState;
          const root2 = workInProgress2.stateNode;
          const nextChildren = nextState.element;
          if (prevState.isDehydrated) {
            const overrideState = {
              element: nextChildren,
              isDehydrated: false,
              cache: nextState.cache,
              pendingSuspenseBoundaries: nextState.pendingSuspenseBoundaries,
              transitions: nextState.transitions
            };
            const updateQueue = workInProgress2.updateQueue;
            updateQueue.baseState = overrideState;
            workInProgress2.memoizedState = overrideState;
            if (workInProgress2.flags & ForceClientRender) {
              const recoverableError = createCapturedValueAtFiber(new Error("There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering."), workInProgress2);
              return mountHostRootWithoutHydrating(current2, workInProgress2, nextChildren, renderLanes2, recoverableError);
            } else if (nextChildren !== prevChildren) {
              const _recoverableError = createCapturedValueAtFiber(new Error("This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."), workInProgress2);
              return mountHostRootWithoutHydrating(current2, workInProgress2, nextChildren, renderLanes2, _recoverableError);
            } else {
              enterHydrationState(workInProgress2);
              const child = mountChildFibers(workInProgress2, null, nextChildren, renderLanes2);
              workInProgress2.child = child;
              let node = child;
              while (node) {
                node.flags = node.flags & ~Placement | Hydrating;
                node = node.sibling;
              }
            }
          } else {
            resetHydrationState();
            if (nextChildren === prevChildren) {
              return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
            }
            reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          }
          return workInProgress2.child;
        }
        function mountHostRootWithoutHydrating(current2, workInProgress2, nextChildren, renderLanes2, recoverableError) {
          resetHydrationState();
          queueHydrationError(recoverableError);
          workInProgress2.flags |= ForceClientRender;
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateHostComponent(current2, workInProgress2, renderLanes2) {
          pushHostContext(workInProgress2);
          if (current2 === null) {
            tryToClaimNextHydratableInstance(workInProgress2);
          }
          const type = workInProgress2.type;
          const nextProps = workInProgress2.pendingProps;
          const prevProps = current2 !== null ? current2.memoizedProps : null;
          let nextChildren = nextProps.children;
          const isDirectTextChild = shouldSetTextContent(type, nextProps);
          if (isDirectTextChild) {
            nextChildren = null;
          } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
            workInProgress2.flags |= ContentReset;
          }
          markRef(current2, workInProgress2);
          reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          return workInProgress2.child;
        }
        function updateHostText(current2, workInProgress2) {
          if (current2 === null) {
            tryToClaimNextHydratableInstance(workInProgress2);
          }
          return null;
        }
        function mountLazyComponent(_current, workInProgress2, elementType, renderLanes2) {
          resetSuspendedCurrentOnMountInLegacyMode(_current, workInProgress2);
          const props = workInProgress2.pendingProps;
          const lazyComponent = elementType;
          const payload = lazyComponent._payload;
          const init = lazyComponent._init;
          let Component = init(payload);
          workInProgress2.type = Component;
          const resolvedTag = workInProgress2.tag = resolveLazyComponentTag(Component);
          const resolvedProps = resolveDefaultProps(Component, props);
          let child;
          switch (resolvedTag) {
            case FunctionComponent: {
              {
                validateFunctionComponentInDev(workInProgress2, Component);
                workInProgress2.type = Component = resolveFunctionForHotReloading(Component);
              }
              child = updateFunctionComponent(null, workInProgress2, Component, resolvedProps, renderLanes2);
              return child;
            }
            case ClassComponent: {
              {
                workInProgress2.type = Component = resolveClassForHotReloading(Component);
              }
              child = updateClassComponent(null, workInProgress2, Component, resolvedProps, renderLanes2);
              return child;
            }
            case ForwardRef: {
              {
                workInProgress2.type = Component = resolveForwardRefForHotReloading(Component);
              }
              child = updateForwardRef(null, workInProgress2, Component, resolvedProps, renderLanes2);
              return child;
            }
            case MemoComponent: {
              {
                if (workInProgress2.type !== workInProgress2.elementType) {
                  const outerPropTypes = Component.propTypes;
                  if (outerPropTypes) {
                    checkPropTypes(
                      outerPropTypes,
                      resolvedProps,
                      // Resolved for outer only
                      "prop",
                      getComponentNameFromType(Component)
                    );
                  }
                }
              }
              child = updateMemoComponent(
                null,
                workInProgress2,
                Component,
                resolveDefaultProps(Component.type, resolvedProps),
                // The inner type can have defaults too
                renderLanes2
              );
              return child;
            }
          }
          let hint = "";
          {
            if (Component !== null && typeof Component === "object" && Component.$$typeof === REACT_LAZY_TYPE) {
              hint = " Did you wrap a component in React.lazy() more than once?";
            }
          }
          throw new Error("Element type is invalid. Received a promise that resolves to: " + Component + ". " + ("Lazy element type must resolve to a class or function." + hint));
        }
        function mountIncompleteClassComponent(_current, workInProgress2, Component, nextProps, renderLanes2) {
          resetSuspendedCurrentOnMountInLegacyMode(_current, workInProgress2);
          workInProgress2.tag = ClassComponent;
          let hasContext;
          if (isContextProvider(Component)) {
            hasContext = true;
            pushContextProvider(workInProgress2);
          } else {
            hasContext = false;
          }
          prepareToReadContext(workInProgress2, renderLanes2);
          constructClassInstance(workInProgress2, Component, nextProps);
          mountClassInstance(workInProgress2, Component, nextProps, renderLanes2);
          return finishClassComponent(null, workInProgress2, Component, true, hasContext, renderLanes2);
        }
        function mountIndeterminateComponent(_current, workInProgress2, Component, renderLanes2) {
          resetSuspendedCurrentOnMountInLegacyMode(_current, workInProgress2);
          const props = workInProgress2.pendingProps;
          let context;
          {
            const unmaskedContext = getUnmaskedContext(workInProgress2, Component, false);
            context = getMaskedContext(workInProgress2, unmaskedContext);
          }
          prepareToReadContext(workInProgress2, renderLanes2);
          let value;
          let hasId;
          {
            markComponentRenderStarted(workInProgress2);
          }
          {
            if (Component.prototype && typeof Component.prototype.render === "function") {
              const componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutBadClass[componentName]) {
                error("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", componentName, componentName);
                didWarnAboutBadClass[componentName] = true;
              }
            }
            if (workInProgress2.mode & StrictLegacyMode) {
              ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress2, null);
            }
            setIsRendering(true);
            ReactCurrentOwner$1.current = workInProgress2;
            value = renderWithHooks(null, workInProgress2, Component, props, context, renderLanes2);
            hasId = checkDidRenderIdHook();
            setIsRendering(false);
          }
          {
            markComponentRenderStopped();
          }
          workInProgress2.flags |= PerformedWork;
          {
            if (typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0) {
              const _componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName, _componentName, _componentName);
                didWarnAboutModulePatternComponent[_componentName] = true;
              }
            }
          }
          if (
            // Run these checks in production only if the flag is off.
            // Eventually we'll delete this branch altogether.
            typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === void 0
          ) {
            {
              const _componentName2 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutModulePatternComponent[_componentName2]) {
                error("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", _componentName2, _componentName2, _componentName2);
                didWarnAboutModulePatternComponent[_componentName2] = true;
              }
            }
            workInProgress2.tag = ClassComponent;
            workInProgress2.memoizedState = null;
            workInProgress2.updateQueue = null;
            let hasContext = false;
            if (isContextProvider(Component)) {
              hasContext = true;
              pushContextProvider(workInProgress2);
            } else {
              hasContext = false;
            }
            workInProgress2.memoizedState = value.state !== null && value.state !== void 0 ? value.state : null;
            initializeUpdateQueue(workInProgress2);
            adoptClassInstance(workInProgress2, value);
            mountClassInstance(workInProgress2, Component, props, renderLanes2);
            return finishClassComponent(null, workInProgress2, Component, true, hasContext, renderLanes2);
          } else {
            workInProgress2.tag = FunctionComponent;
            {
              if (workInProgress2.mode & StrictLegacyMode) {
                setIsStrictModeForDevtools(true);
                try {
                  value = renderWithHooks(null, workInProgress2, Component, props, context, renderLanes2);
                  hasId = checkDidRenderIdHook();
                } finally {
                  setIsStrictModeForDevtools(false);
                }
              }
            }
            if (getIsHydrating() && hasId) {
              pushMaterializedTreeId(workInProgress2);
            }
            reconcileChildren(null, workInProgress2, value, renderLanes2);
            {
              validateFunctionComponentInDev(workInProgress2, Component);
            }
            return workInProgress2.child;
          }
        }
        function validateFunctionComponentInDev(workInProgress2, Component) {
          {
            if (Component) {
              if (Component.childContextTypes) {
                error("%s(...): childContextTypes cannot be defined on a function component.", Component.displayName || Component.name || "Component");
              }
            }
            if (workInProgress2.ref !== null) {
              let info = "";
              const ownerName = getCurrentFiberOwnerNameInDevOrNull();
              if (ownerName) {
                info += "\n\nCheck the render method of `" + ownerName + "`.";
              }
              let warningKey = ownerName || "";
              const debugSource = workInProgress2._debugSource;
              if (debugSource) {
                warningKey = debugSource.fileName + ":" + debugSource.lineNumber;
              }
              if (!didWarnAboutFunctionRefs[warningKey]) {
                didWarnAboutFunctionRefs[warningKey] = true;
                error("Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?%s", info);
              }
            }
            if (Component.defaultProps !== void 0) {
              const componentName = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutDefaultPropsOnFunctionComponent[componentName]) {
                error("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", componentName);
                didWarnAboutDefaultPropsOnFunctionComponent[componentName] = true;
              }
            }
            if (typeof Component.getDerivedStateFromProps === "function") {
              const _componentName3 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3]) {
                error("%s: Function components do not support getDerivedStateFromProps.", _componentName3);
                didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3] = true;
              }
            }
            if (typeof Component.contextType === "object" && Component.contextType !== null) {
              const _componentName4 = getComponentNameFromType(Component) || "Unknown";
              if (!didWarnAboutContextTypeOnFunctionComponent[_componentName4]) {
                error("%s: Function components do not support contextType.", _componentName4);
                didWarnAboutContextTypeOnFunctionComponent[_componentName4] = true;
              }
            }
          }
        }
        const SUSPENDED_MARKER = {
          dehydrated: null,
          treeContext: null,
          retryLane: NoLane
        };
        function mountSuspenseOffscreenState(renderLanes2) {
          return {
            baseLanes: renderLanes2,
            cachePool: getSuspendedCache(),
            transitions: null
          };
        }
        function updateSuspenseOffscreenState(prevOffscreenState, renderLanes2) {
          const cachePool = null;
          return {
            baseLanes: mergeLanes(prevOffscreenState.baseLanes, renderLanes2),
            cachePool,
            transitions: prevOffscreenState.transitions
          };
        }
        function shouldRemainOnFallback(suspenseContext, current2, workInProgress2, renderLanes2) {
          if (current2 !== null) {
            const suspenseState = current2.memoizedState;
            if (suspenseState === null) {
              return false;
            }
          }
          return hasSuspenseContext(suspenseContext, ForceSuspenseFallback);
        }
        function getRemainingWorkInPrimaryTree(current2, renderLanes2) {
          return removeLanes(current2.childLanes, renderLanes2);
        }
        function updateSuspenseComponent(current2, workInProgress2, renderLanes2) {
          const nextProps = workInProgress2.pendingProps;
          {
            if (shouldSuspend(workInProgress2)) {
              workInProgress2.flags |= DidCapture;
            }
          }
          let suspenseContext = suspenseStackCursor.current;
          let showFallback = false;
          const didSuspend = (workInProgress2.flags & DidCapture) !== NoFlags;
          if (didSuspend || shouldRemainOnFallback(suspenseContext, current2)) {
            showFallback = true;
            workInProgress2.flags &= ~DidCapture;
          } else {
            if (current2 === null || current2.memoizedState !== null) {
              {
                suspenseContext = addSubtreeSuspenseContext(suspenseContext, InvisibleParentSuspenseContext);
              }
            }
          }
          suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
          pushSuspenseContext(workInProgress2, suspenseContext);
          if (current2 === null) {
            tryToClaimNextHydratableInstance(workInProgress2);
            const suspenseState = workInProgress2.memoizedState;
            if (suspenseState !== null) {
              const dehydrated = suspenseState.dehydrated;
              if (dehydrated !== null) {
                return mountDehydratedSuspenseComponent(workInProgress2, dehydrated);
              }
            }
            const nextPrimaryChildren = nextProps.children;
            const nextFallbackChildren = nextProps.fallback;
            if (showFallback) {
              const fallbackFragment = mountSuspenseFallbackChildren(workInProgress2, nextPrimaryChildren, nextFallbackChildren, renderLanes2);
              const primaryChildFragment = workInProgress2.child;
              primaryChildFragment.memoizedState = mountSuspenseOffscreenState(renderLanes2);
              workInProgress2.memoizedState = SUSPENDED_MARKER;
              return fallbackFragment;
            } else {
              return mountSuspensePrimaryChildren(workInProgress2, nextPrimaryChildren);
            }
          } else {
            const prevState = current2.memoizedState;
            if (prevState !== null) {
              const _dehydrated = prevState.dehydrated;
              if (_dehydrated !== null) {
                return updateDehydratedSuspenseComponent(current2, workInProgress2, didSuspend, nextProps, _dehydrated, prevState, renderLanes2);
              }
            }
            if (showFallback) {
              const _nextFallbackChildren = nextProps.fallback;
              const _nextPrimaryChildren = nextProps.children;
              const fallbackChildFragment = updateSuspenseFallbackChildren(current2, workInProgress2, _nextPrimaryChildren, _nextFallbackChildren, renderLanes2);
              const _primaryChildFragment2 = workInProgress2.child;
              const prevOffscreenState = current2.child.memoizedState;
              _primaryChildFragment2.memoizedState = prevOffscreenState === null ? mountSuspenseOffscreenState(renderLanes2) : updateSuspenseOffscreenState(prevOffscreenState, renderLanes2);
              _primaryChildFragment2.childLanes = getRemainingWorkInPrimaryTree(current2, renderLanes2);
              workInProgress2.memoizedState = SUSPENDED_MARKER;
              return fallbackChildFragment;
            } else {
              const _nextPrimaryChildren2 = nextProps.children;
              const _primaryChildFragment3 = updateSuspensePrimaryChildren(current2, workInProgress2, _nextPrimaryChildren2, renderLanes2);
              workInProgress2.memoizedState = null;
              return _primaryChildFragment3;
            }
          }
        }
        function mountSuspensePrimaryChildren(workInProgress2, primaryChildren, renderLanes2) {
          const mode = workInProgress2.mode;
          const primaryChildProps = {
            mode: "visible",
            children: primaryChildren
          };
          const primaryChildFragment = mountWorkInProgressOffscreenFiber(primaryChildProps, mode);
          primaryChildFragment.return = workInProgress2;
          workInProgress2.child = primaryChildFragment;
          return primaryChildFragment;
        }
        function mountSuspenseFallbackChildren(workInProgress2, primaryChildren, fallbackChildren, renderLanes2) {
          const mode = workInProgress2.mode;
          const progressedPrimaryFragment = workInProgress2.child;
          const primaryChildProps = {
            mode: "hidden",
            children: primaryChildren
          };
          let primaryChildFragment;
          let fallbackChildFragment;
          if ((mode & ConcurrentMode) === NoMode && progressedPrimaryFragment !== null) {
            primaryChildFragment = progressedPrimaryFragment;
            primaryChildFragment.childLanes = NoLanes;
            primaryChildFragment.pendingProps = primaryChildProps;
            if (workInProgress2.mode & ProfileMode) {
              primaryChildFragment.actualDuration = 0;
              primaryChildFragment.actualStartTime = -1;
              primaryChildFragment.selfBaseDuration = 0;
              primaryChildFragment.treeBaseDuration = 0;
            }
            fallbackChildFragment = createFiberFromFragment(fallbackChildren, mode, renderLanes2, null);
          } else {
            primaryChildFragment = mountWorkInProgressOffscreenFiber(primaryChildProps, mode);
            fallbackChildFragment = createFiberFromFragment(fallbackChildren, mode, renderLanes2, null);
          }
          primaryChildFragment.return = workInProgress2;
          fallbackChildFragment.return = workInProgress2;
          primaryChildFragment.sibling = fallbackChildFragment;
          workInProgress2.child = primaryChildFragment;
          return fallbackChildFragment;
        }
        function mountWorkInProgressOffscreenFiber(offscreenProps, mode, renderLanes2) {
          return createFiberFromOffscreen(offscreenProps, mode, NoLanes, null);
        }
        function updateWorkInProgressOffscreenFiber(current2, offscreenProps) {
          return createWorkInProgress(current2, offscreenProps);
        }
        function updateSuspensePrimaryChildren(current2, workInProgress2, primaryChildren, renderLanes2) {
          const currentPrimaryChildFragment = current2.child;
          const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;
          const primaryChildFragment = updateWorkInProgressOffscreenFiber(currentPrimaryChildFragment, {
            mode: "visible",
            children: primaryChildren
          });
          if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
            primaryChildFragment.lanes = renderLanes2;
          }
          primaryChildFragment.return = workInProgress2;
          primaryChildFragment.sibling = null;
          if (currentFallbackChildFragment !== null) {
            const deletions = workInProgress2.deletions;
            if (deletions === null) {
              workInProgress2.deletions = [currentFallbackChildFragment];
              workInProgress2.flags |= ChildDeletion;
            } else {
              deletions.push(currentFallbackChildFragment);
            }
          }
          workInProgress2.child = primaryChildFragment;
          return primaryChildFragment;
        }
        function updateSuspenseFallbackChildren(current2, workInProgress2, primaryChildren, fallbackChildren, renderLanes2) {
          const mode = workInProgress2.mode;
          const currentPrimaryChildFragment = current2.child;
          const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;
          const primaryChildProps = {
            mode: "hidden",
            children: primaryChildren
          };
          let primaryChildFragment;
          if (
            // In legacy mode, we commit the primary tree as if it successfully
            // completed, even though it's in an inconsistent state.
            (mode & ConcurrentMode) === NoMode && // Make sure we're on the second pass, i.e. the primary child fragment was
            // already cloned. In legacy mode, the only case where this isn't true is
            // when DevTools forces us to display a fallback; we skip the first render
            // pass entirely and go straight to rendering the fallback. (In Concurrent
            // Mode, SuspenseList can also trigger this scenario, but this is a legacy-
            // only codepath.)
            workInProgress2.child !== currentPrimaryChildFragment
          ) {
            const progressedPrimaryFragment = workInProgress2.child;
            primaryChildFragment = progressedPrimaryFragment;
            primaryChildFragment.childLanes = NoLanes;
            primaryChildFragment.pendingProps = primaryChildProps;
            if (workInProgress2.mode & ProfileMode) {
              primaryChildFragment.actualDuration = 0;
              primaryChildFragment.actualStartTime = -1;
              primaryChildFragment.selfBaseDuration = currentPrimaryChildFragment.selfBaseDuration;
              primaryChildFragment.treeBaseDuration = currentPrimaryChildFragment.treeBaseDuration;
            }
            workInProgress2.deletions = null;
          } else {
            primaryChildFragment = updateWorkInProgressOffscreenFiber(currentPrimaryChildFragment, primaryChildProps);
            primaryChildFragment.subtreeFlags = currentPrimaryChildFragment.subtreeFlags & StaticMask;
          }
          let fallbackChildFragment;
          if (currentFallbackChildFragment !== null) {
            fallbackChildFragment = createWorkInProgress(currentFallbackChildFragment, fallbackChildren);
          } else {
            fallbackChildFragment = createFiberFromFragment(fallbackChildren, mode, renderLanes2, null);
            fallbackChildFragment.flags |= Placement;
          }
          fallbackChildFragment.return = workInProgress2;
          primaryChildFragment.return = workInProgress2;
          primaryChildFragment.sibling = fallbackChildFragment;
          workInProgress2.child = primaryChildFragment;
          return fallbackChildFragment;
        }
        function retrySuspenseComponentWithoutHydrating(current2, workInProgress2, renderLanes2, recoverableError) {
          if (recoverableError !== null) {
            queueHydrationError(recoverableError);
          }
          reconcileChildFibers(workInProgress2, current2.child, null, renderLanes2);
          const nextProps = workInProgress2.pendingProps;
          const primaryChildren = nextProps.children;
          const primaryChildFragment = mountSuspensePrimaryChildren(workInProgress2, primaryChildren);
          primaryChildFragment.flags |= Placement;
          workInProgress2.memoizedState = null;
          return primaryChildFragment;
        }
        function mountSuspenseFallbackAfterRetryWithoutHydrating(current2, workInProgress2, primaryChildren, fallbackChildren, renderLanes2) {
          const fiberMode = workInProgress2.mode;
          const primaryChildProps = {
            mode: "visible",
            children: primaryChildren
          };
          const primaryChildFragment = mountWorkInProgressOffscreenFiber(primaryChildProps, fiberMode);
          const fallbackChildFragment = createFiberFromFragment(fallbackChildren, fiberMode, renderLanes2, null);
          fallbackChildFragment.flags |= Placement;
          primaryChildFragment.return = workInProgress2;
          fallbackChildFragment.return = workInProgress2;
          primaryChildFragment.sibling = fallbackChildFragment;
          workInProgress2.child = primaryChildFragment;
          if ((workInProgress2.mode & ConcurrentMode) !== NoMode) {
            reconcileChildFibers(workInProgress2, current2.child, null, renderLanes2);
          }
          return fallbackChildFragment;
        }
        function mountDehydratedSuspenseComponent(workInProgress2, suspenseInstance, renderLanes2) {
          if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
            {
              error("Cannot hydrate Suspense in legacy mode. Switch from ReactDOM.hydrate(element, container) to ReactDOMClient.hydrateRoot(container, <App />).render(element) or remove the Suspense components from the server rendered components.");
            }
            workInProgress2.lanes = laneToLanes(SyncLane);
          } else if (isSuspenseInstanceFallback(suspenseInstance)) {
            workInProgress2.lanes = laneToLanes(DefaultHydrationLane);
          } else {
            workInProgress2.lanes = laneToLanes(OffscreenLane);
          }
          return null;
        }
        function updateDehydratedSuspenseComponent(current2, workInProgress2, didSuspend, nextProps, suspenseInstance, suspenseState, renderLanes2) {
          if (!didSuspend) {
            warnIfHydrating();
            if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
              return retrySuspenseComponentWithoutHydrating(
                current2,
                workInProgress2,
                renderLanes2,
                // TODO: When we delete legacy mode, we should make this error argument
                // required — every concurrent mode path that causes hydration to
                // de-opt to client rendering should have an error message.
                null
              );
            }
            if (isSuspenseInstanceFallback(suspenseInstance)) {
              let digest, message, stack;
              {
                const _getSuspenseInstanceF = getSuspenseInstanceFallbackErrorDetails(suspenseInstance);
                digest = _getSuspenseInstanceF.digest;
                message = _getSuspenseInstanceF.message;
                stack = _getSuspenseInstanceF.stack;
              }
              let error2;
              if (message) {
                error2 = new Error(message);
              } else {
                error2 = new Error("The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering.");
              }
              const capturedValue = createCapturedValue(error2, digest, stack);
              return retrySuspenseComponentWithoutHydrating(current2, workInProgress2, renderLanes2, capturedValue);
            }
            const hasContextChanged2 = includesSomeLane(renderLanes2, current2.childLanes);
            if (didReceiveUpdate || hasContextChanged2) {
              const root2 = getWorkInProgressRoot();
              if (root2 !== null) {
                const attemptHydrationAtLane = getBumpedLaneForHydration(root2, renderLanes2);
                if (attemptHydrationAtLane !== NoLane && attemptHydrationAtLane !== suspenseState.retryLane) {
                  suspenseState.retryLane = attemptHydrationAtLane;
                  const eventTime = NoTimestamp;
                  enqueueConcurrentRenderForLane(current2, attemptHydrationAtLane);
                  scheduleUpdateOnFiber(root2, current2, attemptHydrationAtLane, eventTime);
                }
              }
              renderDidSuspendDelayIfPossible();
              const _capturedValue = createCapturedValue(new Error("This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering. The usual way to fix this is to wrap the original update in startTransition."));
              return retrySuspenseComponentWithoutHydrating(current2, workInProgress2, renderLanes2, _capturedValue);
            } else if (isSuspenseInstancePending(suspenseInstance)) {
              workInProgress2.flags |= DidCapture;
              workInProgress2.child = current2.child;
              const retry = retryDehydratedSuspenseBoundary.bind(null, current2);
              registerSuspenseInstanceRetry(suspenseInstance, retry);
              return null;
            } else {
              reenterHydrationStateFromDehydratedSuspenseInstance(workInProgress2, suspenseInstance, suspenseState.treeContext);
              const primaryChildren = nextProps.children;
              const primaryChildFragment = mountSuspensePrimaryChildren(workInProgress2, primaryChildren);
              primaryChildFragment.flags |= Hydrating;
              return primaryChildFragment;
            }
          } else {
            if (workInProgress2.flags & ForceClientRender) {
              workInProgress2.flags &= ~ForceClientRender;
              const _capturedValue2 = createCapturedValue(new Error("There was an error while hydrating this Suspense boundary. Switched to client rendering."));
              return retrySuspenseComponentWithoutHydrating(current2, workInProgress2, renderLanes2, _capturedValue2);
            } else if (workInProgress2.memoizedState !== null) {
              workInProgress2.child = current2.child;
              workInProgress2.flags |= DidCapture;
              return null;
            } else {
              const nextPrimaryChildren = nextProps.children;
              const nextFallbackChildren = nextProps.fallback;
              const fallbackChildFragment = mountSuspenseFallbackAfterRetryWithoutHydrating(current2, workInProgress2, nextPrimaryChildren, nextFallbackChildren, renderLanes2);
              const _primaryChildFragment4 = workInProgress2.child;
              _primaryChildFragment4.memoizedState = mountSuspenseOffscreenState(renderLanes2);
              workInProgress2.memoizedState = SUSPENDED_MARKER;
              return fallbackChildFragment;
            }
          }
        }
        function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
          fiber.lanes = mergeLanes(fiber.lanes, renderLanes2);
          const alternate = fiber.alternate;
          if (alternate !== null) {
            alternate.lanes = mergeLanes(alternate.lanes, renderLanes2);
          }
          scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
        }
        function propagateSuspenseContextChange(workInProgress2, firstChild, renderLanes2) {
          let node = firstChild;
          while (node !== null) {
            if (node.tag === SuspenseComponent) {
              const state = node.memoizedState;
              if (state !== null) {
                scheduleSuspenseWorkOnFiber(node, renderLanes2, workInProgress2);
              }
            } else if (node.tag === SuspenseListComponent) {
              scheduleSuspenseWorkOnFiber(node, renderLanes2, workInProgress2);
            } else if (node.child !== null) {
              node.child.return = node;
              node = node.child;
              continue;
            }
            if (node === workInProgress2) {
              return;
            }
            while (node.sibling === null) {
              if (node.return === null || node.return === workInProgress2) {
                return;
              }
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
          }
        }
        function findLastContentRow(firstChild) {
          let row = firstChild;
          let lastContentRow = null;
          while (row !== null) {
            const currentRow = row.alternate;
            if (currentRow !== null && findFirstSuspended(currentRow) === null) {
              lastContentRow = row;
            }
            row = row.sibling;
          }
          return lastContentRow;
        }
        function validateRevealOrder(revealOrder) {
          {
            if (revealOrder !== void 0 && revealOrder !== "forwards" && revealOrder !== "backwards" && revealOrder !== "together" && !didWarnAboutRevealOrder[revealOrder]) {
              didWarnAboutRevealOrder[revealOrder] = true;
              if (typeof revealOrder === "string") {
                switch (revealOrder.toLowerCase()) {
                  case "together":
                  case "forwards":
                  case "backwards": {
                    error('"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.', revealOrder, revealOrder.toLowerCase());
                    break;
                  }
                  case "forward":
                  case "backward": {
                    error('"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.', revealOrder, revealOrder.toLowerCase());
                    break;
                  }
                  default:
                    error('"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', revealOrder);
                    break;
                }
              } else {
                error('%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', revealOrder);
              }
            }
          }
        }
        function validateTailOptions(tailMode, revealOrder) {
          {
            if (tailMode !== void 0 && !didWarnAboutTailOptions[tailMode]) {
              if (tailMode !== "collapsed" && tailMode !== "hidden") {
                didWarnAboutTailOptions[tailMode] = true;
                error('"%s" is not a supported value for tail on <SuspenseList />. Did you mean "collapsed" or "hidden"?', tailMode);
              } else if (revealOrder !== "forwards" && revealOrder !== "backwards") {
                didWarnAboutTailOptions[tailMode] = true;
                error('<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?', tailMode);
              }
            }
          }
        }
        function validateSuspenseListNestedChild(childSlot, index2) {
          {
            const isAnArray = isArray(childSlot);
            const isIterable = !isAnArray && typeof getIteratorFn(childSlot) === "function";
            if (isAnArray || isIterable) {
              const type = isAnArray ? "array" : "iterable";
              error("A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>", type, index2, type);
              return false;
            }
          }
          return true;
        }
        function validateSuspenseListChildren(children, revealOrder) {
          {
            if ((revealOrder === "forwards" || revealOrder === "backwards") && children !== void 0 && children !== null && children !== false) {
              if (isArray(children)) {
                for (let i = 0; i < children.length; i++) {
                  if (!validateSuspenseListNestedChild(children[i], i)) {
                    return;
                  }
                }
              } else {
                const iteratorFn = getIteratorFn(children);
                if (typeof iteratorFn === "function") {
                  const childrenIterator = iteratorFn.call(children);
                  if (childrenIterator) {
                    let step = childrenIterator.next();
                    let _i = 0;
                    for (; !step.done; step = childrenIterator.next()) {
                      if (!validateSuspenseListNestedChild(step.value, _i)) {
                        return;
                      }
                      _i++;
                    }
                  }
                } else {
                  error('A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?', revealOrder);
                }
              }
            }
          }
        }
        function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode) {
          const renderState = workInProgress2.memoizedState;
          if (renderState === null) {
            workInProgress2.memoizedState = {
              isBackwards,
              rendering: null,
              renderingStartTime: 0,
              last: lastContentRow,
              tail,
              tailMode
            };
          } else {
            renderState.isBackwards = isBackwards;
            renderState.rendering = null;
            renderState.renderingStartTime = 0;
            renderState.last = lastContentRow;
            renderState.tail = tail;
            renderState.tailMode = tailMode;
          }
        }
        function updateSuspenseListComponent(current2, workInProgress2, renderLanes2) {
          const nextProps = workInProgress2.pendingProps;
          const revealOrder = nextProps.revealOrder;
          const tailMode = nextProps.tail;
          const newChildren = nextProps.children;
          validateRevealOrder(revealOrder);
          validateTailOptions(tailMode, revealOrder);
          validateSuspenseListChildren(newChildren, revealOrder);
          reconcileChildren(current2, workInProgress2, newChildren, renderLanes2);
          let suspenseContext = suspenseStackCursor.current;
          const shouldForceFallback = hasSuspenseContext(suspenseContext, ForceSuspenseFallback);
          if (shouldForceFallback) {
            suspenseContext = setShallowSuspenseContext(suspenseContext, ForceSuspenseFallback);
            workInProgress2.flags |= DidCapture;
          } else {
            const didSuspendBefore = current2 !== null && (current2.flags & DidCapture) !== NoFlags;
            if (didSuspendBefore) {
              propagateSuspenseContextChange(workInProgress2, workInProgress2.child, renderLanes2);
            }
            suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
          }
          pushSuspenseContext(workInProgress2, suspenseContext);
          if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
            workInProgress2.memoizedState = null;
          } else {
            switch (revealOrder) {
              case "forwards": {
                const lastContentRow = findLastContentRow(workInProgress2.child);
                let tail;
                if (lastContentRow === null) {
                  tail = workInProgress2.child;
                  workInProgress2.child = null;
                } else {
                  tail = lastContentRow.sibling;
                  lastContentRow.sibling = null;
                }
                initSuspenseListRenderState(
                  workInProgress2,
                  false,
                  // isBackwards
                  tail,
                  lastContentRow,
                  tailMode
                );
                break;
              }
              case "backwards": {
                let _tail = null;
                let row = workInProgress2.child;
                workInProgress2.child = null;
                while (row !== null) {
                  const currentRow = row.alternate;
                  if (currentRow !== null && findFirstSuspended(currentRow) === null) {
                    workInProgress2.child = row;
                    break;
                  }
                  const nextRow = row.sibling;
                  row.sibling = _tail;
                  _tail = row;
                  row = nextRow;
                }
                initSuspenseListRenderState(
                  workInProgress2,
                  true,
                  // isBackwards
                  _tail,
                  null,
                  // last
                  tailMode
                );
                break;
              }
              case "together": {
                initSuspenseListRenderState(
                  workInProgress2,
                  false,
                  // isBackwards
                  null,
                  // tail
                  null,
                  // last
                  void 0
                );
                break;
              }
              default: {
                workInProgress2.memoizedState = null;
              }
            }
          }
          return workInProgress2.child;
        }
        function updatePortalComponent(current2, workInProgress2, renderLanes2) {
          pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
          const nextChildren = workInProgress2.pendingProps;
          if (current2 === null) {
            workInProgress2.child = reconcileChildFibers(workInProgress2, null, nextChildren, renderLanes2);
          } else {
            reconcileChildren(current2, workInProgress2, nextChildren, renderLanes2);
          }
          return workInProgress2.child;
        }
        let hasWarnedAboutUsingNoValuePropOnContextProvider = false;
        function updateContextProvider(current2, workInProgress2, renderLanes2) {
          const providerType = workInProgress2.type;
          const context = providerType._context;
          const newProps = workInProgress2.pendingProps;
          const oldProps = workInProgress2.memoizedProps;
          const newValue = newProps.value;
          {
            if (!("value" in newProps)) {
              if (!hasWarnedAboutUsingNoValuePropOnContextProvider) {
                hasWarnedAboutUsingNoValuePropOnContextProvider = true;
                error("The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?");
              }
            }
            const providerPropTypes = workInProgress2.type.propTypes;
            if (providerPropTypes) {
              checkPropTypes(providerPropTypes, newProps, "prop", "Context.Provider");
            }
          }
          pushProvider(workInProgress2, context, newValue);
          {
            if (oldProps !== null) {
              const oldValue = oldProps.value;
              if (objectIs(oldValue, newValue)) {
                if (oldProps.children === newProps.children && !hasContextChanged()) {
                  return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
                }
              } else {
                propagateContextChange(workInProgress2, context, renderLanes2);
              }
            }
          }
          const newChildren = newProps.children;
          reconcileChildren(current2, workInProgress2, newChildren, renderLanes2);
          return workInProgress2.child;
        }
        let hasWarnedAboutUsingContextAsConsumer = false;
        function updateContextConsumer(current2, workInProgress2, renderLanes2) {
          let context = workInProgress2.type;
          {
            if (context._context === void 0) {
              if (context !== context.Consumer) {
                if (!hasWarnedAboutUsingContextAsConsumer) {
                  hasWarnedAboutUsingContextAsConsumer = true;
                  error("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                }
              }
            } else {
              context = context._context;
            }
          }
          const newProps = workInProgress2.pendingProps;
          const render2 = newProps.children;
          {
            if (typeof render2 !== "function") {
              error("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it.");
            }
          }
          prepareToReadContext(workInProgress2, renderLanes2);
          const newValue = readContext(context);
          {
            markComponentRenderStarted(workInProgress2);
          }
          let newChildren;
          {
            ReactCurrentOwner$1.current = workInProgress2;
            setIsRendering(true);
            newChildren = render2(newValue);
            setIsRendering(false);
          }
          {
            markComponentRenderStopped();
          }
          workInProgress2.flags |= PerformedWork;
          reconcileChildren(current2, workInProgress2, newChildren, renderLanes2);
          return workInProgress2.child;
        }
        function markWorkInProgressReceivedUpdate() {
          didReceiveUpdate = true;
        }
        function resetSuspendedCurrentOnMountInLegacyMode(current2, workInProgress2) {
          if ((workInProgress2.mode & ConcurrentMode) === NoMode) {
            if (current2 !== null) {
              current2.alternate = null;
              workInProgress2.alternate = null;
              workInProgress2.flags |= Placement;
            }
          }
        }
        function bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2) {
          if (current2 !== null) {
            workInProgress2.dependencies = current2.dependencies;
          }
          {
            stopProfilerTimerIfRunning();
          }
          markSkippedUpdateLanes(workInProgress2.lanes);
          if (!includesSomeLane(renderLanes2, workInProgress2.childLanes)) {
            {
              return null;
            }
          }
          cloneChildFibers(current2, workInProgress2);
          return workInProgress2.child;
        }
        function remountFiber(current2, oldWorkInProgress, newWorkInProgress) {
          {
            const returnFiber = oldWorkInProgress.return;
            if (returnFiber === null) {
              throw new Error("Cannot swap the root fiber.");
            }
            current2.alternate = null;
            oldWorkInProgress.alternate = null;
            newWorkInProgress.index = oldWorkInProgress.index;
            newWorkInProgress.sibling = oldWorkInProgress.sibling;
            newWorkInProgress.return = oldWorkInProgress.return;
            newWorkInProgress.ref = oldWorkInProgress.ref;
            if (oldWorkInProgress === returnFiber.child) {
              returnFiber.child = newWorkInProgress;
            } else {
              let prevSibling = returnFiber.child;
              if (prevSibling === null) {
                throw new Error("Expected parent to have a child.");
              }
              while (prevSibling.sibling !== oldWorkInProgress) {
                prevSibling = prevSibling.sibling;
                if (prevSibling === null) {
                  throw new Error("Expected to find the previous sibling.");
                }
              }
              prevSibling.sibling = newWorkInProgress;
            }
            const deletions = returnFiber.deletions;
            if (deletions === null) {
              returnFiber.deletions = [current2];
              returnFiber.flags |= ChildDeletion;
            } else {
              deletions.push(current2);
            }
            newWorkInProgress.flags |= Placement;
            return newWorkInProgress;
          }
        }
        function checkScheduledUpdateOrContext(current2, renderLanes2) {
          const updateLanes = current2.lanes;
          if (includesSomeLane(updateLanes, renderLanes2)) {
            return true;
          }
          return false;
        }
        function attemptEarlyBailoutIfNoScheduledUpdate(current2, workInProgress2, renderLanes2) {
          switch (workInProgress2.tag) {
            case HostRoot:
              pushHostRootContext(workInProgress2);
              var root2 = workInProgress2.stateNode;
              resetHydrationState();
              break;
            case HostComponent:
              pushHostContext(workInProgress2);
              break;
            case ClassComponent: {
              const Component = workInProgress2.type;
              if (isContextProvider(Component)) {
                pushContextProvider(workInProgress2);
              }
              break;
            }
            case HostPortal:
              pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
              break;
            case ContextProvider: {
              const newValue = workInProgress2.memoizedProps.value;
              const context = workInProgress2.type._context;
              pushProvider(workInProgress2, context, newValue);
              break;
            }
            case Profiler:
              {
                const hasChildWork = includesSomeLane(renderLanes2, workInProgress2.childLanes);
                if (hasChildWork) {
                  workInProgress2.flags |= Update;
                }
                {
                  const stateNode = workInProgress2.stateNode;
                  stateNode.effectDuration = 0;
                  stateNode.passiveEffectDuration = 0;
                }
              }
              break;
            case SuspenseComponent: {
              const state = workInProgress2.memoizedState;
              if (state !== null) {
                if (state.dehydrated !== null) {
                  pushSuspenseContext(workInProgress2, setDefaultShallowSuspenseContext(suspenseStackCursor.current));
                  workInProgress2.flags |= DidCapture;
                  return null;
                }
                const primaryChildFragment = workInProgress2.child;
                const primaryChildLanes = primaryChildFragment.childLanes;
                if (includesSomeLane(renderLanes2, primaryChildLanes)) {
                  return updateSuspenseComponent(current2, workInProgress2, renderLanes2);
                } else {
                  pushSuspenseContext(workInProgress2, setDefaultShallowSuspenseContext(suspenseStackCursor.current));
                  const child = bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
                  if (child !== null) {
                    return child.sibling;
                  } else {
                    return null;
                  }
                }
              } else {
                pushSuspenseContext(workInProgress2, setDefaultShallowSuspenseContext(suspenseStackCursor.current));
              }
              break;
            }
            case SuspenseListComponent: {
              const didSuspendBefore = (current2.flags & DidCapture) !== NoFlags;
              const _hasChildWork = includesSomeLane(renderLanes2, workInProgress2.childLanes);
              if (didSuspendBefore) {
                if (_hasChildWork) {
                  return updateSuspenseListComponent(current2, workInProgress2, renderLanes2);
                }
                workInProgress2.flags |= DidCapture;
              }
              const renderState = workInProgress2.memoizedState;
              if (renderState !== null) {
                renderState.rendering = null;
                renderState.tail = null;
                renderState.lastEffect = null;
              }
              pushSuspenseContext(workInProgress2, suspenseStackCursor.current);
              if (_hasChildWork) {
                break;
              } else {
                return null;
              }
            }
            case OffscreenComponent:
            case LegacyHiddenComponent: {
              workInProgress2.lanes = NoLanes;
              return updateOffscreenComponent(current2, workInProgress2, renderLanes2);
            }
          }
          return bailoutOnAlreadyFinishedWork(current2, workInProgress2, renderLanes2);
        }
        function beginWork(current2, workInProgress2, renderLanes2) {
          {
            if (workInProgress2._debugNeedsRemount && current2 !== null) {
              return remountFiber(current2, workInProgress2, createFiberFromTypeAndProps(workInProgress2.type, workInProgress2.key, workInProgress2.pendingProps, workInProgress2._debugOwner || null, workInProgress2.mode, workInProgress2.lanes));
            }
          }
          if (current2 !== null) {
            const oldProps = current2.memoizedProps;
            const newProps = workInProgress2.pendingProps;
            if (oldProps !== newProps || hasContextChanged() || // Force a re-render if the implementation changed due to hot reload:
            workInProgress2.type !== current2.type) {
              didReceiveUpdate = true;
            } else {
              const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current2, renderLanes2);
              if (!hasScheduledUpdateOrContext && // If this is the second pass of an error or suspense boundary, there
              // may not be work scheduled on `current`, so we check for this flag.
              (workInProgress2.flags & DidCapture) === NoFlags) {
                didReceiveUpdate = false;
                return attemptEarlyBailoutIfNoScheduledUpdate(current2, workInProgress2, renderLanes2);
              }
              if ((current2.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
                didReceiveUpdate = true;
              } else {
                didReceiveUpdate = false;
              }
            }
          } else {
            didReceiveUpdate = false;
            if (getIsHydrating() && isForkedChild(workInProgress2)) {
              const slotIndex = workInProgress2.index;
              const numberOfForks = getForksAtLevel();
              pushTreeId(workInProgress2, numberOfForks, slotIndex);
            }
          }
          workInProgress2.lanes = NoLanes;
          switch (workInProgress2.tag) {
            case IndeterminateComponent: {
              return mountIndeterminateComponent(current2, workInProgress2, workInProgress2.type, renderLanes2);
            }
            case LazyComponent: {
              const elementType = workInProgress2.elementType;
              return mountLazyComponent(current2, workInProgress2, elementType, renderLanes2);
            }
            case FunctionComponent: {
              const Component = workInProgress2.type;
              const unresolvedProps = workInProgress2.pendingProps;
              const resolvedProps = workInProgress2.elementType === Component ? unresolvedProps : resolveDefaultProps(Component, unresolvedProps);
              return updateFunctionComponent(current2, workInProgress2, Component, resolvedProps, renderLanes2);
            }
            case ClassComponent: {
              const _Component = workInProgress2.type;
              const _unresolvedProps = workInProgress2.pendingProps;
              const _resolvedProps = workInProgress2.elementType === _Component ? _unresolvedProps : resolveDefaultProps(_Component, _unresolvedProps);
              return updateClassComponent(current2, workInProgress2, _Component, _resolvedProps, renderLanes2);
            }
            case HostRoot:
              return updateHostRoot(current2, workInProgress2, renderLanes2);
            case HostComponent:
              return updateHostComponent(current2, workInProgress2, renderLanes2);
            case HostText:
              return updateHostText(current2, workInProgress2);
            case SuspenseComponent:
              return updateSuspenseComponent(current2, workInProgress2, renderLanes2);
            case HostPortal:
              return updatePortalComponent(current2, workInProgress2, renderLanes2);
            case ForwardRef: {
              const type = workInProgress2.type;
              const _unresolvedProps2 = workInProgress2.pendingProps;
              const _resolvedProps2 = workInProgress2.elementType === type ? _unresolvedProps2 : resolveDefaultProps(type, _unresolvedProps2);
              return updateForwardRef(current2, workInProgress2, type, _resolvedProps2, renderLanes2);
            }
            case Fragment:
              return updateFragment(current2, workInProgress2, renderLanes2);
            case Mode:
              return updateMode(current2, workInProgress2, renderLanes2);
            case Profiler:
              return updateProfiler(current2, workInProgress2, renderLanes2);
            case ContextProvider:
              return updateContextProvider(current2, workInProgress2, renderLanes2);
            case ContextConsumer:
              return updateContextConsumer(current2, workInProgress2, renderLanes2);
            case MemoComponent: {
              const _type2 = workInProgress2.type;
              const _unresolvedProps3 = workInProgress2.pendingProps;
              let _resolvedProps3 = resolveDefaultProps(_type2, _unresolvedProps3);
              {
                if (workInProgress2.type !== workInProgress2.elementType) {
                  const outerPropTypes = _type2.propTypes;
                  if (outerPropTypes) {
                    checkPropTypes(
                      outerPropTypes,
                      _resolvedProps3,
                      // Resolved for outer only
                      "prop",
                      getComponentNameFromType(_type2)
                    );
                  }
                }
              }
              _resolvedProps3 = resolveDefaultProps(_type2.type, _resolvedProps3);
              return updateMemoComponent(current2, workInProgress2, _type2, _resolvedProps3, renderLanes2);
            }
            case SimpleMemoComponent: {
              return updateSimpleMemoComponent(current2, workInProgress2, workInProgress2.type, workInProgress2.pendingProps, renderLanes2);
            }
            case IncompleteClassComponent: {
              const _Component2 = workInProgress2.type;
              const _unresolvedProps4 = workInProgress2.pendingProps;
              const _resolvedProps4 = workInProgress2.elementType === _Component2 ? _unresolvedProps4 : resolveDefaultProps(_Component2, _unresolvedProps4);
              return mountIncompleteClassComponent(current2, workInProgress2, _Component2, _resolvedProps4, renderLanes2);
            }
            case SuspenseListComponent: {
              return updateSuspenseListComponent(current2, workInProgress2, renderLanes2);
            }
            case ScopeComponent: {
              break;
            }
            case OffscreenComponent: {
              return updateOffscreenComponent(current2, workInProgress2, renderLanes2);
            }
          }
          throw new Error("Unknown unit of work tag (" + workInProgress2.tag + "). This error is likely caused by a bug in React. Please file an issue.");
        }
        function markUpdate(workInProgress2) {
          workInProgress2.flags |= Update;
        }
        function markRef$1(workInProgress2) {
          workInProgress2.flags |= Ref;
          {
            workInProgress2.flags |= RefStatic;
          }
        }
        let appendAllChildren;
        let updateHostContainer;
        let updateHostComponent$1;
        let updateHostText$1;
        {
          appendAllChildren = function(parent, workInProgress2, needsVisibilityToggle, isHidden) {
            let node = workInProgress2.child;
            while (node !== null) {
              if (node.tag === HostComponent || node.tag === HostText) {
                appendInitialChild(parent, node.stateNode);
              } else if (node.tag === HostPortal) ;
              else if (node.child !== null) {
                node.child.return = node;
                node = node.child;
                continue;
              }
              if (node === workInProgress2) {
                return;
              }
              while (node.sibling === null) {
                if (node.return === null || node.return === workInProgress2) {
                  return;
                }
                node = node.return;
              }
              node.sibling.return = node.return;
              node = node.sibling;
            }
          };
          updateHostContainer = function(current2, workInProgress2) {
          };
          updateHostComponent$1 = function(current2, workInProgress2, type, newProps, rootContainerInstance) {
            const oldProps = current2.memoizedProps;
            if (oldProps === newProps) {
              return;
            }
            const instance = workInProgress2.stateNode;
            const currentHostContext = getHostContext();
            const updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
            workInProgress2.updateQueue = updatePayload;
            if (updatePayload) {
              markUpdate(workInProgress2);
            }
          };
          updateHostText$1 = function(current2, workInProgress2, oldText, newText) {
            if (oldText !== newText) {
              markUpdate(workInProgress2);
            }
          };
        }
        function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
          if (getIsHydrating()) {
            return;
          }
          switch (renderState.tailMode) {
            case "hidden": {
              let tailNode = renderState.tail;
              let lastTailNode = null;
              while (tailNode !== null) {
                if (tailNode.alternate !== null) {
                  lastTailNode = tailNode;
                }
                tailNode = tailNode.sibling;
              }
              if (lastTailNode === null) {
                renderState.tail = null;
              } else {
                lastTailNode.sibling = null;
              }
              break;
            }
            case "collapsed": {
              let _tailNode = renderState.tail;
              let _lastTailNode = null;
              while (_tailNode !== null) {
                if (_tailNode.alternate !== null) {
                  _lastTailNode = _tailNode;
                }
                _tailNode = _tailNode.sibling;
              }
              if (_lastTailNode === null) {
                if (!hasRenderedATailFallback && renderState.tail !== null) {
                  renderState.tail.sibling = null;
                } else {
                  renderState.tail = null;
                }
              } else {
                _lastTailNode.sibling = null;
              }
              break;
            }
          }
        }
        function bubbleProperties(completedWork) {
          const didBailout = completedWork.alternate !== null && completedWork.alternate.child === completedWork.child;
          let newChildLanes = NoLanes;
          let subtreeFlags = NoFlags;
          if (!didBailout) {
            if ((completedWork.mode & ProfileMode) !== NoMode) {
              let actualDuration = completedWork.actualDuration;
              let treeBaseDuration = completedWork.selfBaseDuration;
              let child = completedWork.child;
              while (child !== null) {
                newChildLanes = mergeLanes(newChildLanes, mergeLanes(child.lanes, child.childLanes));
                subtreeFlags |= child.subtreeFlags;
                subtreeFlags |= child.flags;
                actualDuration += child.actualDuration;
                treeBaseDuration += child.treeBaseDuration;
                child = child.sibling;
              }
              completedWork.actualDuration = actualDuration;
              completedWork.treeBaseDuration = treeBaseDuration;
            } else {
              let _child = completedWork.child;
              while (_child !== null) {
                newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child.lanes, _child.childLanes));
                subtreeFlags |= _child.subtreeFlags;
                subtreeFlags |= _child.flags;
                _child.return = completedWork;
                _child = _child.sibling;
              }
            }
            completedWork.subtreeFlags |= subtreeFlags;
          } else {
            if ((completedWork.mode & ProfileMode) !== NoMode) {
              let _treeBaseDuration = completedWork.selfBaseDuration;
              let _child2 = completedWork.child;
              while (_child2 !== null) {
                newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child2.lanes, _child2.childLanes));
                subtreeFlags |= _child2.subtreeFlags & StaticMask;
                subtreeFlags |= _child2.flags & StaticMask;
                _treeBaseDuration += _child2.treeBaseDuration;
                _child2 = _child2.sibling;
              }
              completedWork.treeBaseDuration = _treeBaseDuration;
            } else {
              let _child3 = completedWork.child;
              while (_child3 !== null) {
                newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child3.lanes, _child3.childLanes));
                subtreeFlags |= _child3.subtreeFlags & StaticMask;
                subtreeFlags |= _child3.flags & StaticMask;
                _child3.return = completedWork;
                _child3 = _child3.sibling;
              }
            }
            completedWork.subtreeFlags |= subtreeFlags;
          }
          completedWork.childLanes = newChildLanes;
          return didBailout;
        }
        function completeDehydratedSuspenseBoundary(current2, workInProgress2, nextState) {
          if (hasUnhydratedTailNodes() && (workInProgress2.mode & ConcurrentMode) !== NoMode && (workInProgress2.flags & DidCapture) === NoFlags) {
            warnIfUnhydratedTailNodes(workInProgress2);
            resetHydrationState();
            workInProgress2.flags |= ForceClientRender | Incomplete | ShouldCapture;
            return false;
          }
          const wasHydrated = popHydrationState(workInProgress2);
          if (nextState !== null && nextState.dehydrated !== null) {
            if (current2 === null) {
              if (!wasHydrated) {
                throw new Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
              }
              prepareToHydrateHostSuspenseInstance(workInProgress2);
              bubbleProperties(workInProgress2);
              {
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  const isTimedOutSuspense = nextState !== null;
                  if (isTimedOutSuspense) {
                    const primaryChildFragment = workInProgress2.child;
                    if (primaryChildFragment !== null) {
                      workInProgress2.treeBaseDuration -= primaryChildFragment.treeBaseDuration;
                    }
                  }
                }
              }
              return false;
            } else {
              resetHydrationState();
              if ((workInProgress2.flags & DidCapture) === NoFlags) {
                workInProgress2.memoizedState = null;
              }
              workInProgress2.flags |= Update;
              bubbleProperties(workInProgress2);
              {
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  const _isTimedOutSuspense = nextState !== null;
                  if (_isTimedOutSuspense) {
                    const _primaryChildFragment = workInProgress2.child;
                    if (_primaryChildFragment !== null) {
                      workInProgress2.treeBaseDuration -= _primaryChildFragment.treeBaseDuration;
                    }
                  }
                }
              }
              return false;
            }
          } else {
            upgradeHydrationErrorsToRecoverable();
            return true;
          }
        }
        function completeWork(current2, workInProgress2, renderLanes2) {
          const newProps = workInProgress2.pendingProps;
          popTreeContext(workInProgress2);
          switch (workInProgress2.tag) {
            case IndeterminateComponent:
            case LazyComponent:
            case SimpleMemoComponent:
            case FunctionComponent:
            case ForwardRef:
            case Fragment:
            case Mode:
            case Profiler:
            case ContextConsumer:
            case MemoComponent:
              bubbleProperties(workInProgress2);
              return null;
            case ClassComponent: {
              const Component = workInProgress2.type;
              if (isContextProvider(Component)) {
                popContext(workInProgress2);
              }
              bubbleProperties(workInProgress2);
              return null;
            }
            case HostRoot: {
              const fiberRoot = workInProgress2.stateNode;
              popHostContainer(workInProgress2);
              popTopLevelContextObject(workInProgress2);
              resetWorkInProgressVersions();
              if (fiberRoot.pendingContext) {
                fiberRoot.context = fiberRoot.pendingContext;
                fiberRoot.pendingContext = null;
              }
              if (current2 === null || current2.child === null) {
                const wasHydrated = popHydrationState(workInProgress2);
                if (wasHydrated) {
                  markUpdate(workInProgress2);
                } else {
                  if (current2 !== null) {
                    const prevState = current2.memoizedState;
                    if (
                      // Check if this is a client root
                      !prevState.isDehydrated || // Check if we reverted to client rendering (e.g. due to an error)
                      (workInProgress2.flags & ForceClientRender) !== NoFlags
                    ) {
                      workInProgress2.flags |= Snapshot;
                      upgradeHydrationErrorsToRecoverable();
                    }
                  }
                }
              }
              updateHostContainer(current2, workInProgress2);
              bubbleProperties(workInProgress2);
              return null;
            }
            case HostComponent: {
              popHostContext(workInProgress2);
              const rootContainerInstance = getRootHostContainer();
              const type = workInProgress2.type;
              if (current2 !== null && workInProgress2.stateNode != null) {
                updateHostComponent$1(current2, workInProgress2, type, newProps, rootContainerInstance);
                if (current2.ref !== workInProgress2.ref) {
                  markRef$1(workInProgress2);
                }
              } else {
                if (!newProps) {
                  if (workInProgress2.stateNode === null) {
                    throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                  }
                  bubbleProperties(workInProgress2);
                  return null;
                }
                const currentHostContext = getHostContext();
                const _wasHydrated = popHydrationState(workInProgress2);
                if (_wasHydrated) {
                  if (prepareToHydrateHostInstance(workInProgress2, rootContainerInstance, currentHostContext)) {
                    markUpdate(workInProgress2);
                  }
                } else {
                  const instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress2);
                  appendAllChildren(instance, workInProgress2, false, false);
                  workInProgress2.stateNode = instance;
                  if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance)) {
                    markUpdate(workInProgress2);
                  }
                }
                if (workInProgress2.ref !== null) {
                  markRef$1(workInProgress2);
                }
              }
              bubbleProperties(workInProgress2);
              return null;
            }
            case HostText: {
              const newText = newProps;
              if (current2 && workInProgress2.stateNode != null) {
                const oldText = current2.memoizedProps;
                updateHostText$1(current2, workInProgress2, oldText, newText);
              } else {
                if (typeof newText !== "string") {
                  if (workInProgress2.stateNode === null) {
                    throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                  }
                }
                const _rootContainerInstance = getRootHostContainer();
                const _currentHostContext = getHostContext();
                const _wasHydrated2 = popHydrationState(workInProgress2);
                if (_wasHydrated2) {
                  if (prepareToHydrateHostTextInstance(workInProgress2)) {
                    markUpdate(workInProgress2);
                  }
                } else {
                  workInProgress2.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext, workInProgress2);
                }
              }
              bubbleProperties(workInProgress2);
              return null;
            }
            case SuspenseComponent: {
              popSuspenseContext(workInProgress2);
              const nextState = workInProgress2.memoizedState;
              if (current2 === null || current2.memoizedState !== null && current2.memoizedState.dehydrated !== null) {
                const fallthroughToNormalSuspensePath = completeDehydratedSuspenseBoundary(current2, workInProgress2, nextState);
                if (!fallthroughToNormalSuspensePath) {
                  if (workInProgress2.flags & ShouldCapture) {
                    return workInProgress2;
                  } else {
                    return null;
                  }
                }
              }
              if ((workInProgress2.flags & DidCapture) !== NoFlags) {
                workInProgress2.lanes = renderLanes2;
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  transferActualDuration(workInProgress2);
                }
                return workInProgress2;
              }
              const nextDidTimeout = nextState !== null;
              const prevDidTimeout = current2 !== null && current2.memoizedState !== null;
              if (nextDidTimeout !== prevDidTimeout) {
                if (nextDidTimeout) {
                  const _offscreenFiber2 = workInProgress2.child;
                  _offscreenFiber2.flags |= Visibility;
                  if ((workInProgress2.mode & ConcurrentMode) !== NoMode) {
                    const hasInvisibleChildContext = current2 === null && (workInProgress2.memoizedProps.unstable_avoidThisFallback !== true || !enableSuspenseAvoidThisFallback);
                    if (hasInvisibleChildContext || hasSuspenseContext(suspenseStackCursor.current, InvisibleParentSuspenseContext)) {
                      renderDidSuspend();
                    } else {
                      renderDidSuspendDelayIfPossible();
                    }
                  }
                }
              }
              const wakeables = workInProgress2.updateQueue;
              if (wakeables !== null) {
                workInProgress2.flags |= Update;
              }
              bubbleProperties(workInProgress2);
              {
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  if (nextDidTimeout) {
                    const primaryChildFragment = workInProgress2.child;
                    if (primaryChildFragment !== null) {
                      workInProgress2.treeBaseDuration -= primaryChildFragment.treeBaseDuration;
                    }
                  }
                }
              }
              return null;
            }
            case HostPortal:
              popHostContainer(workInProgress2);
              updateHostContainer(current2, workInProgress2);
              if (current2 === null) {
                preparePortalMount(workInProgress2.stateNode.containerInfo);
              }
              bubbleProperties(workInProgress2);
              return null;
            case ContextProvider:
              var context = workInProgress2.type._context;
              popProvider(context, workInProgress2);
              bubbleProperties(workInProgress2);
              return null;
            case IncompleteClassComponent: {
              const _Component = workInProgress2.type;
              if (isContextProvider(_Component)) {
                popContext(workInProgress2);
              }
              bubbleProperties(workInProgress2);
              return null;
            }
            case SuspenseListComponent: {
              popSuspenseContext(workInProgress2);
              const renderState = workInProgress2.memoizedState;
              if (renderState === null) {
                bubbleProperties(workInProgress2);
                return null;
              }
              let didSuspendAlready = (workInProgress2.flags & DidCapture) !== NoFlags;
              const renderedTail = renderState.rendering;
              if (renderedTail === null) {
                if (!didSuspendAlready) {
                  const cannotBeSuspended = renderHasNotSuspendedYet() && (current2 === null || (current2.flags & DidCapture) === NoFlags);
                  if (!cannotBeSuspended) {
                    let row = workInProgress2.child;
                    while (row !== null) {
                      const suspended = findFirstSuspended(row);
                      if (suspended !== null) {
                        didSuspendAlready = true;
                        workInProgress2.flags |= DidCapture;
                        cutOffTailIfNeeded(renderState, false);
                        const newThenables = suspended.updateQueue;
                        if (newThenables !== null) {
                          workInProgress2.updateQueue = newThenables;
                          workInProgress2.flags |= Update;
                        }
                        workInProgress2.subtreeFlags = NoFlags;
                        resetChildFibers(workInProgress2, renderLanes2);
                        pushSuspenseContext(workInProgress2, setShallowSuspenseContext(suspenseStackCursor.current, ForceSuspenseFallback));
                        return workInProgress2.child;
                      }
                      row = row.sibling;
                    }
                  }
                  if (renderState.tail !== null && now() > getRenderTargetTime()) {
                    workInProgress2.flags |= DidCapture;
                    didSuspendAlready = true;
                    cutOffTailIfNeeded(renderState, false);
                    workInProgress2.lanes = SomeRetryLane;
                  }
                } else {
                  cutOffTailIfNeeded(renderState, false);
                }
              } else {
                if (!didSuspendAlready) {
                  const _suspended = findFirstSuspended(renderedTail);
                  if (_suspended !== null) {
                    workInProgress2.flags |= DidCapture;
                    didSuspendAlready = true;
                    const _newThenables = _suspended.updateQueue;
                    if (_newThenables !== null) {
                      workInProgress2.updateQueue = _newThenables;
                      workInProgress2.flags |= Update;
                    }
                    cutOffTailIfNeeded(renderState, true);
                    if (renderState.tail === null && renderState.tailMode === "hidden" && !renderedTail.alternate && !getIsHydrating()) {
                      bubbleProperties(workInProgress2);
                      return null;
                    }
                  } else if (
                    // The time it took to render last row is greater than the remaining
                    // time we have to render. So rendering one more row would likely
                    // exceed it.
                    now() * 2 - renderState.renderingStartTime > getRenderTargetTime() && renderLanes2 !== OffscreenLane
                  ) {
                    workInProgress2.flags |= DidCapture;
                    didSuspendAlready = true;
                    cutOffTailIfNeeded(renderState, false);
                    workInProgress2.lanes = SomeRetryLane;
                  }
                }
                if (renderState.isBackwards) {
                  renderedTail.sibling = workInProgress2.child;
                  workInProgress2.child = renderedTail;
                } else {
                  const previousSibling = renderState.last;
                  if (previousSibling !== null) {
                    previousSibling.sibling = renderedTail;
                  } else {
                    workInProgress2.child = renderedTail;
                  }
                  renderState.last = renderedTail;
                }
              }
              if (renderState.tail !== null) {
                const next = renderState.tail;
                renderState.rendering = next;
                renderState.tail = next.sibling;
                renderState.renderingStartTime = now();
                next.sibling = null;
                let suspenseContext = suspenseStackCursor.current;
                if (didSuspendAlready) {
                  suspenseContext = setShallowSuspenseContext(suspenseContext, ForceSuspenseFallback);
                } else {
                  suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
                }
                pushSuspenseContext(workInProgress2, suspenseContext);
                return next;
              }
              bubbleProperties(workInProgress2);
              return null;
            }
            case ScopeComponent: {
              break;
            }
            case OffscreenComponent:
            case LegacyHiddenComponent: {
              popRenderLanes(workInProgress2);
              const _nextState = workInProgress2.memoizedState;
              const nextIsHidden = _nextState !== null;
              if (current2 !== null) {
                const _prevState = current2.memoizedState;
                const prevIsHidden = _prevState !== null;
                if (prevIsHidden !== nextIsHidden && // LegacyHidden doesn't do any hiding — it only pre-renders.
                !enableLegacyHidden) {
                  workInProgress2.flags |= Visibility;
                }
              }
              if (!nextIsHidden || (workInProgress2.mode & ConcurrentMode) === NoMode) {
                bubbleProperties(workInProgress2);
              } else {
                if (includesSomeLane(subtreeRenderLanes, OffscreenLane)) {
                  bubbleProperties(workInProgress2);
                  {
                    if (workInProgress2.subtreeFlags & (Placement | Update)) {
                      workInProgress2.flags |= Visibility;
                    }
                  }
                }
              }
              return null;
            }
            case CacheComponent: {
              return null;
            }
            case TracingMarkerComponent: {
              return null;
            }
          }
          throw new Error("Unknown unit of work tag (" + workInProgress2.tag + "). This error is likely caused by a bug in React. Please file an issue.");
        }
        function unwindWork(current2, workInProgress2, renderLanes2) {
          popTreeContext(workInProgress2);
          switch (workInProgress2.tag) {
            case ClassComponent: {
              const Component = workInProgress2.type;
              if (isContextProvider(Component)) {
                popContext(workInProgress2);
              }
              const flags = workInProgress2.flags;
              if (flags & ShouldCapture) {
                workInProgress2.flags = flags & ~ShouldCapture | DidCapture;
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  transferActualDuration(workInProgress2);
                }
                return workInProgress2;
              }
              return null;
            }
            case HostRoot: {
              const root2 = workInProgress2.stateNode;
              popHostContainer(workInProgress2);
              popTopLevelContextObject(workInProgress2);
              resetWorkInProgressVersions();
              const _flags = workInProgress2.flags;
              if ((_flags & ShouldCapture) !== NoFlags && (_flags & DidCapture) === NoFlags) {
                workInProgress2.flags = _flags & ~ShouldCapture | DidCapture;
                return workInProgress2;
              }
              return null;
            }
            case HostComponent: {
              popHostContext(workInProgress2);
              return null;
            }
            case SuspenseComponent: {
              popSuspenseContext(workInProgress2);
              const suspenseState = workInProgress2.memoizedState;
              if (suspenseState !== null && suspenseState.dehydrated !== null) {
                if (workInProgress2.alternate === null) {
                  throw new Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
                }
                resetHydrationState();
              }
              const _flags2 = workInProgress2.flags;
              if (_flags2 & ShouldCapture) {
                workInProgress2.flags = _flags2 & ~ShouldCapture | DidCapture;
                if ((workInProgress2.mode & ProfileMode) !== NoMode) {
                  transferActualDuration(workInProgress2);
                }
                return workInProgress2;
              }
              return null;
            }
            case SuspenseListComponent: {
              popSuspenseContext(workInProgress2);
              return null;
            }
            case HostPortal:
              popHostContainer(workInProgress2);
              return null;
            case ContextProvider:
              var context = workInProgress2.type._context;
              popProvider(context, workInProgress2);
              return null;
            case OffscreenComponent:
            case LegacyHiddenComponent:
              popRenderLanes(workInProgress2);
              return null;
            case CacheComponent:
              return null;
            default:
              return null;
          }
        }
        function unwindInterruptedWork(current2, interruptedWork, renderLanes2) {
          popTreeContext(interruptedWork);
          switch (interruptedWork.tag) {
            case ClassComponent: {
              const childContextTypes = interruptedWork.type.childContextTypes;
              if (childContextTypes !== null && childContextTypes !== void 0) {
                popContext(interruptedWork);
              }
              break;
            }
            case HostRoot: {
              const root2 = interruptedWork.stateNode;
              popHostContainer(interruptedWork);
              popTopLevelContextObject(interruptedWork);
              resetWorkInProgressVersions();
              break;
            }
            case HostComponent: {
              popHostContext(interruptedWork);
              break;
            }
            case HostPortal:
              popHostContainer(interruptedWork);
              break;
            case SuspenseComponent:
              popSuspenseContext(interruptedWork);
              break;
            case SuspenseListComponent:
              popSuspenseContext(interruptedWork);
              break;
            case ContextProvider:
              var context = interruptedWork.type._context;
              popProvider(context, interruptedWork);
              break;
            case OffscreenComponent:
            case LegacyHiddenComponent:
              popRenderLanes(interruptedWork);
              break;
          }
        }
        let didWarnAboutUndefinedSnapshotBeforeUpdate = null;
        {
          didWarnAboutUndefinedSnapshotBeforeUpdate = /* @__PURE__ */ new Set();
        }
        let offscreenSubtreeIsHidden = false;
        let offscreenSubtreeWasHidden = false;
        const PossiblyWeakSet = typeof WeakSet === "function" ? WeakSet : Set;
        let nextEffect = null;
        let inProgressLanes = null;
        let inProgressRoot = null;
        function reportUncaughtErrorInDEV(error2) {
          {
            invokeGuardedCallback(null, function() {
              throw error2;
            });
            clearCaughtError();
          }
        }
        const callComponentWillUnmountWithTimer = function(current2, instance) {
          instance.props = current2.memoizedProps;
          instance.state = current2.memoizedState;
          if (current2.mode & ProfileMode) {
            try {
              startLayoutEffectTimer();
              instance.componentWillUnmount();
            } finally {
              recordLayoutEffectDuration(current2);
            }
          } else {
            instance.componentWillUnmount();
          }
        };
        function safelyCallCommitHookLayoutEffectListMount(current2, nearestMountedAncestor) {
          try {
            commitHookEffectListMount(Layout, current2);
          } catch (error2) {
            captureCommitPhaseError(current2, nearestMountedAncestor, error2);
          }
        }
        function safelyCallComponentWillUnmount(current2, nearestMountedAncestor, instance) {
          try {
            callComponentWillUnmountWithTimer(current2, instance);
          } catch (error2) {
            captureCommitPhaseError(current2, nearestMountedAncestor, error2);
          }
        }
        function safelyCallComponentDidMount(current2, nearestMountedAncestor, instance) {
          try {
            instance.componentDidMount();
          } catch (error2) {
            captureCommitPhaseError(current2, nearestMountedAncestor, error2);
          }
        }
        function safelyAttachRef(current2, nearestMountedAncestor) {
          try {
            commitAttachRef(current2);
          } catch (error2) {
            captureCommitPhaseError(current2, nearestMountedAncestor, error2);
          }
        }
        function safelyDetachRef(current2, nearestMountedAncestor) {
          const ref = current2.ref;
          if (ref !== null) {
            if (typeof ref === "function") {
              let retVal;
              try {
                if (enableProfilerTimer && enableProfilerCommitHooks && current2.mode & ProfileMode) {
                  try {
                    startLayoutEffectTimer();
                    retVal = ref(null);
                  } finally {
                    recordLayoutEffectDuration(current2);
                  }
                } else {
                  retVal = ref(null);
                }
              } catch (error2) {
                captureCommitPhaseError(current2, nearestMountedAncestor, error2);
              }
              {
                if (typeof retVal === "function") {
                  error("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", getComponentNameFromFiber(current2));
                }
              }
            } else {
              ref.current = null;
            }
          }
        }
        function safelyCallDestroy(current2, nearestMountedAncestor, destroy) {
          try {
            destroy();
          } catch (error2) {
            captureCommitPhaseError(current2, nearestMountedAncestor, error2);
          }
        }
        let focusedInstanceHandle = null;
        let shouldFireAfterActiveInstanceBlur = false;
        function commitBeforeMutationEffects(root2, firstChild) {
          focusedInstanceHandle = prepareForCommit(root2.containerInfo);
          nextEffect = firstChild;
          commitBeforeMutationEffects_begin();
          const shouldFire = shouldFireAfterActiveInstanceBlur;
          shouldFireAfterActiveInstanceBlur = false;
          focusedInstanceHandle = null;
          return shouldFire;
        }
        function commitBeforeMutationEffects_begin() {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const child = fiber.child;
            if ((fiber.subtreeFlags & BeforeMutationMask) !== NoFlags && child !== null) {
              child.return = fiber;
              nextEffect = child;
            } else {
              commitBeforeMutationEffects_complete();
            }
          }
        }
        function commitBeforeMutationEffects_complete() {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            setCurrentFiber(fiber);
            try {
              commitBeforeMutationEffectsOnFiber(fiber);
            } catch (error2) {
              captureCommitPhaseError(fiber, fiber.return, error2);
            }
            resetCurrentFiber();
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function commitBeforeMutationEffectsOnFiber(finishedWork) {
          const current2 = finishedWork.alternate;
          const flags = finishedWork.flags;
          if ((flags & Snapshot) !== NoFlags) {
            setCurrentFiber(finishedWork);
            switch (finishedWork.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                break;
              }
              case ClassComponent: {
                if (current2 !== null) {
                  const prevProps = current2.memoizedProps;
                  const prevState = current2.memoizedState;
                  const instance = finishedWork.stateNode;
                  {
                    if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                      if (instance.props !== finishedWork.memoizedProps) {
                        error("Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                      }
                      if (instance.state !== finishedWork.memoizedState) {
                        error("Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                      }
                    }
                  }
                  const snapshot = instance.getSnapshotBeforeUpdate(finishedWork.elementType === finishedWork.type ? prevProps : resolveDefaultProps(finishedWork.type, prevProps), prevState);
                  {
                    const didWarnSet = didWarnAboutUndefinedSnapshotBeforeUpdate;
                    if (snapshot === void 0 && !didWarnSet.has(finishedWork.type)) {
                      didWarnSet.add(finishedWork.type);
                      error("%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.", getComponentNameFromFiber(finishedWork));
                    }
                  }
                  instance.__reactInternalSnapshotBeforeUpdate = snapshot;
                }
                break;
              }
              case HostRoot: {
                {
                  const root2 = finishedWork.stateNode;
                  clearContainer(root2.containerInfo);
                }
                break;
              }
              case HostComponent:
              case HostText:
              case HostPortal:
              case IncompleteClassComponent:
                break;
              default: {
                throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
              }
            }
            resetCurrentFiber();
          }
        }
        function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor) {
          const updateQueue = finishedWork.updateQueue;
          const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;
            let effect = firstEffect;
            do {
              if ((effect.tag & flags) === flags) {
                const destroy = effect.destroy;
                effect.destroy = void 0;
                if (destroy !== void 0) {
                  {
                    if ((flags & Passive$1) !== NoFlags$1) {
                      markComponentPassiveEffectUnmountStarted(finishedWork);
                    } else if ((flags & Layout) !== NoFlags$1) {
                      markComponentLayoutEffectUnmountStarted(finishedWork);
                    }
                  }
                  {
                    if ((flags & Insertion) !== NoFlags$1) {
                      setIsRunningInsertionEffect(true);
                    }
                  }
                  safelyCallDestroy(finishedWork, nearestMountedAncestor, destroy);
                  {
                    if ((flags & Insertion) !== NoFlags$1) {
                      setIsRunningInsertionEffect(false);
                    }
                  }
                  {
                    if ((flags & Passive$1) !== NoFlags$1) {
                      markComponentPassiveEffectUnmountStopped();
                    } else if ((flags & Layout) !== NoFlags$1) {
                      markComponentLayoutEffectUnmountStopped();
                    }
                  }
                }
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
        function commitHookEffectListMount(flags, finishedWork) {
          const updateQueue = finishedWork.updateQueue;
          const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;
            let effect = firstEffect;
            do {
              if ((effect.tag & flags) === flags) {
                {
                  if ((flags & Passive$1) !== NoFlags$1) {
                    markComponentPassiveEffectMountStarted(finishedWork);
                  } else if ((flags & Layout) !== NoFlags$1) {
                    markComponentLayoutEffectMountStarted(finishedWork);
                  }
                }
                const create = effect.create;
                {
                  if ((flags & Insertion) !== NoFlags$1) {
                    setIsRunningInsertionEffect(true);
                  }
                }
                effect.destroy = create();
                {
                  if ((flags & Insertion) !== NoFlags$1) {
                    setIsRunningInsertionEffect(false);
                  }
                }
                {
                  if ((flags & Passive$1) !== NoFlags$1) {
                    markComponentPassiveEffectMountStopped();
                  } else if ((flags & Layout) !== NoFlags$1) {
                    markComponentLayoutEffectMountStopped();
                  }
                }
                {
                  const destroy = effect.destroy;
                  if (destroy !== void 0 && typeof destroy !== "function") {
                    let hookName = void 0;
                    if ((effect.tag & Layout) !== NoFlags) {
                      hookName = "useLayoutEffect";
                    } else if ((effect.tag & Insertion) !== NoFlags) {
                      hookName = "useInsertionEffect";
                    } else {
                      hookName = "useEffect";
                    }
                    let addendum = void 0;
                    if (destroy === null) {
                      addendum = " You returned null. If your effect does not require clean up, return undefined (or nothing).";
                    } else if (typeof destroy.then === "function") {
                      addendum = "\n\nIt looks like you wrote " + hookName + "(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:\n\n" + hookName + "(() => {\n  async function fetchData() {\n    // You can await here\n    const response = await MyAPI.getData(someId);\n    // ...\n  }\n  fetchData();\n}, [someId]); // Or [] if effect doesn't need props or state\n\nLearn more about data fetching with Hooks: https://reactjs.org/link/hooks-data-fetching";
                    } else {
                      addendum = " You returned: " + destroy;
                    }
                    error("%s must not return anything besides a function, which is used for clean-up.%s", hookName, addendum);
                  }
                }
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
        function commitPassiveEffectDurations(finishedRoot, finishedWork) {
          {
            if ((finishedWork.flags & Update) !== NoFlags) {
              switch (finishedWork.tag) {
                case Profiler: {
                  const passiveEffectDuration = finishedWork.stateNode.passiveEffectDuration;
                  const _finishedWork$memoize = finishedWork.memoizedProps, id = _finishedWork$memoize.id, onPostCommit = _finishedWork$memoize.onPostCommit;
                  const commitTime2 = getCommitTime();
                  let phase = finishedWork.alternate === null ? "mount" : "update";
                  {
                    if (isCurrentUpdateNested()) {
                      phase = "nested-update";
                    }
                  }
                  if (typeof onPostCommit === "function") {
                    onPostCommit(id, phase, passiveEffectDuration, commitTime2);
                  }
                  let parentFiber = finishedWork.return;
                  outer: while (parentFiber !== null) {
                    switch (parentFiber.tag) {
                      case HostRoot:
                        var root2 = parentFiber.stateNode;
                        root2.passiveEffectDuration += passiveEffectDuration;
                        break outer;
                      case Profiler:
                        var parentStateNode = parentFiber.stateNode;
                        parentStateNode.passiveEffectDuration += passiveEffectDuration;
                        break outer;
                    }
                    parentFiber = parentFiber.return;
                  }
                  break;
                }
              }
            }
          }
        }
        function commitLayoutEffectOnFiber(finishedRoot, current2, finishedWork, committedLanes) {
          if ((finishedWork.flags & LayoutMask) !== NoFlags) {
            switch (finishedWork.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                if (!offscreenSubtreeWasHidden) {
                  if (finishedWork.mode & ProfileMode) {
                    try {
                      startLayoutEffectTimer();
                      commitHookEffectListMount(Layout | HasEffect, finishedWork);
                    } finally {
                      recordLayoutEffectDuration(finishedWork);
                    }
                  } else {
                    commitHookEffectListMount(Layout | HasEffect, finishedWork);
                  }
                }
                break;
              }
              case ClassComponent: {
                const instance = finishedWork.stateNode;
                if (finishedWork.flags & Update) {
                  if (!offscreenSubtreeWasHidden) {
                    if (current2 === null) {
                      {
                        if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                          if (instance.props !== finishedWork.memoizedProps) {
                            error("Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                          }
                          if (instance.state !== finishedWork.memoizedState) {
                            error("Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                          }
                        }
                      }
                      if (finishedWork.mode & ProfileMode) {
                        try {
                          startLayoutEffectTimer();
                          instance.componentDidMount();
                        } finally {
                          recordLayoutEffectDuration(finishedWork);
                        }
                      } else {
                        instance.componentDidMount();
                      }
                    } else {
                      const prevProps = finishedWork.elementType === finishedWork.type ? current2.memoizedProps : resolveDefaultProps(finishedWork.type, current2.memoizedProps);
                      const prevState = current2.memoizedState;
                      {
                        if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                          if (instance.props !== finishedWork.memoizedProps) {
                            error("Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                          }
                          if (instance.state !== finishedWork.memoizedState) {
                            error("Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                          }
                        }
                      }
                      if (finishedWork.mode & ProfileMode) {
                        try {
                          startLayoutEffectTimer();
                          instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
                        } finally {
                          recordLayoutEffectDuration(finishedWork);
                        }
                      } else {
                        instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
                      }
                    }
                  }
                }
                const updateQueue = finishedWork.updateQueue;
                if (updateQueue !== null) {
                  {
                    if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                      if (instance.props !== finishedWork.memoizedProps) {
                        error("Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                      }
                      if (instance.state !== finishedWork.memoizedState) {
                        error("Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", getComponentNameFromFiber(finishedWork) || "instance");
                      }
                    }
                  }
                  commitUpdateQueue(finishedWork, updateQueue, instance);
                }
                break;
              }
              case HostRoot: {
                const _updateQueue = finishedWork.updateQueue;
                if (_updateQueue !== null) {
                  let _instance = null;
                  if (finishedWork.child !== null) {
                    switch (finishedWork.child.tag) {
                      case HostComponent:
                        _instance = getPublicInstance(finishedWork.child.stateNode);
                        break;
                      case ClassComponent:
                        _instance = finishedWork.child.stateNode;
                        break;
                    }
                  }
                  commitUpdateQueue(finishedWork, _updateQueue, _instance);
                }
                break;
              }
              case HostComponent: {
                const _instance2 = finishedWork.stateNode;
                if (current2 === null && finishedWork.flags & Update) {
                  const type = finishedWork.type;
                  const props = finishedWork.memoizedProps;
                  commitMount(_instance2, type, props);
                }
                break;
              }
              case HostText: {
                break;
              }
              case HostPortal: {
                break;
              }
              case Profiler: {
                {
                  const _finishedWork$memoize2 = finishedWork.memoizedProps, onCommit = _finishedWork$memoize2.onCommit, onRender = _finishedWork$memoize2.onRender;
                  const effectDuration = finishedWork.stateNode.effectDuration;
                  const commitTime2 = getCommitTime();
                  let phase = current2 === null ? "mount" : "update";
                  {
                    if (isCurrentUpdateNested()) {
                      phase = "nested-update";
                    }
                  }
                  if (typeof onRender === "function") {
                    onRender(finishedWork.memoizedProps.id, phase, finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, commitTime2);
                  }
                  {
                    if (typeof onCommit === "function") {
                      onCommit(finishedWork.memoizedProps.id, phase, effectDuration, commitTime2);
                    }
                    enqueuePendingPassiveProfilerEffect(finishedWork);
                    let parentFiber = finishedWork.return;
                    outer: while (parentFiber !== null) {
                      switch (parentFiber.tag) {
                        case HostRoot:
                          var root2 = parentFiber.stateNode;
                          root2.effectDuration += effectDuration;
                          break outer;
                        case Profiler:
                          var parentStateNode = parentFiber.stateNode;
                          parentStateNode.effectDuration += effectDuration;
                          break outer;
                      }
                      parentFiber = parentFiber.return;
                    }
                  }
                }
                break;
              }
              case SuspenseComponent: {
                commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
                break;
              }
              case SuspenseListComponent:
              case IncompleteClassComponent:
              case ScopeComponent:
              case OffscreenComponent:
              case LegacyHiddenComponent:
              case TracingMarkerComponent: {
                break;
              }
              default:
                throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
          if (!offscreenSubtreeWasHidden) {
            {
              if (finishedWork.flags & Ref) {
                commitAttachRef(finishedWork);
              }
            }
          }
        }
        function reappearLayoutEffectsOnFiber(node) {
          switch (node.tag) {
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent: {
              if (node.mode & ProfileMode) {
                try {
                  startLayoutEffectTimer();
                  safelyCallCommitHookLayoutEffectListMount(node, node.return);
                } finally {
                  recordLayoutEffectDuration(node);
                }
              } else {
                safelyCallCommitHookLayoutEffectListMount(node, node.return);
              }
              break;
            }
            case ClassComponent: {
              const instance = node.stateNode;
              if (typeof instance.componentDidMount === "function") {
                safelyCallComponentDidMount(node, node.return, instance);
              }
              safelyAttachRef(node, node.return);
              break;
            }
            case HostComponent: {
              safelyAttachRef(node, node.return);
              break;
            }
          }
        }
        function hideOrUnhideAllChildren(finishedWork, isHidden) {
          let hostSubtreeRoot = null;
          {
            let node = finishedWork;
            while (true) {
              if (node.tag === HostComponent) {
                if (hostSubtreeRoot === null) {
                  hostSubtreeRoot = node;
                  try {
                    const instance = node.stateNode;
                    if (isHidden) {
                      hideInstance(instance);
                    } else {
                      unhideInstance(node.stateNode, node.memoizedProps);
                    }
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                }
              } else if (node.tag === HostText) {
                if (hostSubtreeRoot === null) {
                  try {
                    const _instance3 = node.stateNode;
                    if (isHidden) {
                      hideTextInstance(_instance3);
                    } else {
                      unhideTextInstance(_instance3, node.memoizedProps);
                    }
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                }
              } else if ((node.tag === OffscreenComponent || node.tag === LegacyHiddenComponent) && node.memoizedState !== null && node !== finishedWork) ;
              else if (node.child !== null) {
                node.child.return = node;
                node = node.child;
                continue;
              }
              if (node === finishedWork) {
                return;
              }
              while (node.sibling === null) {
                if (node.return === null || node.return === finishedWork) {
                  return;
                }
                if (hostSubtreeRoot === node) {
                  hostSubtreeRoot = null;
                }
                node = node.return;
              }
              if (hostSubtreeRoot === node) {
                hostSubtreeRoot = null;
              }
              node.sibling.return = node.return;
              node = node.sibling;
            }
          }
        }
        function commitAttachRef(finishedWork) {
          const ref = finishedWork.ref;
          if (ref !== null) {
            const instance = finishedWork.stateNode;
            let instanceToUse;
            switch (finishedWork.tag) {
              case HostComponent:
                instanceToUse = getPublicInstance(instance);
                break;
              default:
                instanceToUse = instance;
            }
            if (typeof ref === "function") {
              let retVal;
              if (finishedWork.mode & ProfileMode) {
                try {
                  startLayoutEffectTimer();
                  retVal = ref(instanceToUse);
                } finally {
                  recordLayoutEffectDuration(finishedWork);
                }
              } else {
                retVal = ref(instanceToUse);
              }
              {
                if (typeof retVal === "function") {
                  error("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", getComponentNameFromFiber(finishedWork));
                }
              }
            } else {
              {
                if (!ref.hasOwnProperty("current")) {
                  error("Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().", getComponentNameFromFiber(finishedWork));
                }
              }
              ref.current = instanceToUse;
            }
          }
        }
        function detachFiberMutation(fiber) {
          const alternate = fiber.alternate;
          if (alternate !== null) {
            alternate.return = null;
          }
          fiber.return = null;
        }
        function detachFiberAfterEffects(fiber) {
          const alternate = fiber.alternate;
          if (alternate !== null) {
            fiber.alternate = null;
            detachFiberAfterEffects(alternate);
          }
          {
            fiber.child = null;
            fiber.deletions = null;
            fiber.sibling = null;
            if (fiber.tag === HostComponent) {
              const hostInstance = fiber.stateNode;
              if (hostInstance !== null) {
                detachDeletedInstance(hostInstance);
              }
            }
            fiber.stateNode = null;
            {
              fiber._debugOwner = null;
            }
            {
              fiber.return = null;
              fiber.dependencies = null;
              fiber.memoizedProps = null;
              fiber.memoizedState = null;
              fiber.pendingProps = null;
              fiber.stateNode = null;
              fiber.updateQueue = null;
            }
          }
        }
        function getHostParentFiber(fiber) {
          let parent = fiber.return;
          while (parent !== null) {
            if (isHostParent(parent)) {
              return parent;
            }
            parent = parent.return;
          }
          throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
        }
        function isHostParent(fiber) {
          return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
        }
        function getHostSibling(fiber) {
          let node = fiber;
          siblings: while (true) {
            while (node.sibling === null) {
              if (node.return === null || isHostParent(node.return)) {
                return null;
              }
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
            while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedFragment) {
              if (node.flags & Placement) {
                continue siblings;
              }
              if (node.child === null || node.tag === HostPortal) {
                continue siblings;
              } else {
                node.child.return = node;
                node = node.child;
              }
            }
            if (!(node.flags & Placement)) {
              return node.stateNode;
            }
          }
        }
        function commitPlacement(finishedWork) {
          const parentFiber = getHostParentFiber(finishedWork);
          switch (parentFiber.tag) {
            case HostComponent: {
              const parent = parentFiber.stateNode;
              if (parentFiber.flags & ContentReset) {
                resetTextContent(parent);
                parentFiber.flags &= ~ContentReset;
              }
              const before = getHostSibling(finishedWork);
              insertOrAppendPlacementNode(finishedWork, before, parent);
              break;
            }
            case HostRoot:
            case HostPortal: {
              const _parent = parentFiber.stateNode.containerInfo;
              const _before = getHostSibling(finishedWork);
              insertOrAppendPlacementNodeIntoContainer(finishedWork, _before, _parent);
              break;
            }
            default:
              throw new Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
        function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
          const tag = node.tag;
          const isHost = tag === HostComponent || tag === HostText;
          if (isHost) {
            const stateNode = node.stateNode;
            if (before) {
              insertInContainerBefore(parent, stateNode, before);
            } else {
              appendChildToContainer(parent, stateNode);
            }
          } else if (tag === HostPortal) ;
          else {
            const child = node.child;
            if (child !== null) {
              insertOrAppendPlacementNodeIntoContainer(child, before, parent);
              let sibling = child.sibling;
              while (sibling !== null) {
                insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                sibling = sibling.sibling;
              }
            }
          }
        }
        function insertOrAppendPlacementNode(node, before, parent) {
          const tag = node.tag;
          const isHost = tag === HostComponent || tag === HostText;
          if (isHost) {
            const stateNode = node.stateNode;
            if (before) {
              insertBefore(parent, stateNode, before);
            } else {
              appendChild(parent, stateNode);
            }
          } else if (tag === HostPortal) ;
          else {
            const child = node.child;
            if (child !== null) {
              insertOrAppendPlacementNode(child, before, parent);
              let sibling = child.sibling;
              while (sibling !== null) {
                insertOrAppendPlacementNode(sibling, before, parent);
                sibling = sibling.sibling;
              }
            }
          }
        }
        let hostParent = null;
        let hostParentIsContainer = false;
        function commitDeletionEffects(root2, returnFiber, deletedFiber) {
          {
            let parent = returnFiber;
            findParent: while (parent !== null) {
              switch (parent.tag) {
                case HostComponent: {
                  hostParent = parent.stateNode;
                  hostParentIsContainer = false;
                  break findParent;
                }
                case HostRoot: {
                  hostParent = parent.stateNode.containerInfo;
                  hostParentIsContainer = true;
                  break findParent;
                }
                case HostPortal: {
                  hostParent = parent.stateNode.containerInfo;
                  hostParentIsContainer = true;
                  break findParent;
                }
              }
              parent = parent.return;
            }
            if (hostParent === null) {
              throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
            }
            commitDeletionEffectsOnFiber(root2, returnFiber, deletedFiber);
            hostParent = null;
            hostParentIsContainer = false;
          }
          detachFiberMutation(deletedFiber);
        }
        function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
          let child = parent.child;
          while (child !== null) {
            commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
            child = child.sibling;
          }
        }
        function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
          onCommitUnmount(deletedFiber);
          switch (deletedFiber.tag) {
            case HostComponent: {
              if (!offscreenSubtreeWasHidden) {
                safelyDetachRef(deletedFiber, nearestMountedAncestor);
              }
            }
            case HostText: {
              {
                const prevHostParent = hostParent;
                const prevHostParentIsContainer = hostParentIsContainer;
                hostParent = null;
                recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
                hostParent = prevHostParent;
                hostParentIsContainer = prevHostParentIsContainer;
                if (hostParent !== null) {
                  if (hostParentIsContainer) {
                    removeChildFromContainer(hostParent, deletedFiber.stateNode);
                  } else {
                    removeChild(hostParent, deletedFiber.stateNode);
                  }
                }
              }
              return;
            }
            case DehydratedFragment: {
              {
                if (hostParent !== null) {
                  if (hostParentIsContainer) {
                    clearSuspenseBoundaryFromContainer(hostParent, deletedFiber.stateNode);
                  } else {
                    clearSuspenseBoundary(hostParent, deletedFiber.stateNode);
                  }
                }
              }
              return;
            }
            case HostPortal: {
              {
                const _prevHostParent = hostParent;
                const _prevHostParentIsContainer = hostParentIsContainer;
                hostParent = deletedFiber.stateNode.containerInfo;
                hostParentIsContainer = true;
                recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
                hostParent = _prevHostParent;
                hostParentIsContainer = _prevHostParentIsContainer;
              }
              return;
            }
            case FunctionComponent:
            case ForwardRef:
            case MemoComponent:
            case SimpleMemoComponent: {
              if (!offscreenSubtreeWasHidden) {
                const updateQueue = deletedFiber.updateQueue;
                if (updateQueue !== null) {
                  const lastEffect = updateQueue.lastEffect;
                  if (lastEffect !== null) {
                    const firstEffect = lastEffect.next;
                    let effect = firstEffect;
                    do {
                      const _effect = effect, destroy = _effect.destroy, tag = _effect.tag;
                      if (destroy !== void 0) {
                        if ((tag & Insertion) !== NoFlags$1) {
                          safelyCallDestroy(deletedFiber, nearestMountedAncestor, destroy);
                        } else if ((tag & Layout) !== NoFlags$1) {
                          {
                            markComponentLayoutEffectUnmountStarted(deletedFiber);
                          }
                          if (deletedFiber.mode & ProfileMode) {
                            startLayoutEffectTimer();
                            safelyCallDestroy(deletedFiber, nearestMountedAncestor, destroy);
                            recordLayoutEffectDuration(deletedFiber);
                          } else {
                            safelyCallDestroy(deletedFiber, nearestMountedAncestor, destroy);
                          }
                          {
                            markComponentLayoutEffectUnmountStopped();
                          }
                        }
                      }
                      effect = effect.next;
                    } while (effect !== firstEffect);
                  }
                }
              }
              recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
              return;
            }
            case ClassComponent: {
              if (!offscreenSubtreeWasHidden) {
                safelyDetachRef(deletedFiber, nearestMountedAncestor);
                const instance = deletedFiber.stateNode;
                if (typeof instance.componentWillUnmount === "function") {
                  safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, instance);
                }
              }
              recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
              return;
            }
            case ScopeComponent: {
              recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
              return;
            }
            case OffscreenComponent: {
              if (
                // TODO: Remove this dead flag
                deletedFiber.mode & ConcurrentMode
              ) {
                const prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
                offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || deletedFiber.memoizedState !== null;
                recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
                offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
              } else {
                recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
              }
              break;
            }
            default: {
              recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
              return;
            }
          }
        }
        function commitSuspenseCallback(finishedWork) {
          const newState = finishedWork.memoizedState;
        }
        function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
          const newState = finishedWork.memoizedState;
          if (newState === null) {
            const current2 = finishedWork.alternate;
            if (current2 !== null) {
              const prevState = current2.memoizedState;
              if (prevState !== null) {
                const suspenseInstance = prevState.dehydrated;
                if (suspenseInstance !== null) {
                  commitHydratedSuspenseInstance(suspenseInstance);
                }
              }
            }
          }
        }
        function attachSuspenseRetryListeners(finishedWork) {
          const wakeables = finishedWork.updateQueue;
          if (wakeables !== null) {
            finishedWork.updateQueue = null;
            let retryCache = finishedWork.stateNode;
            if (retryCache === null) {
              retryCache = finishedWork.stateNode = new PossiblyWeakSet();
            }
            wakeables.forEach(function(wakeable) {
              const retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
              if (!retryCache.has(wakeable)) {
                retryCache.add(wakeable);
                {
                  if (isDevToolsPresent) {
                    if (inProgressLanes !== null && inProgressRoot !== null) {
                      restorePendingUpdaters(inProgressRoot, inProgressLanes);
                    } else {
                      throw Error("Expected finished root and lanes to be set. This is a bug in React.");
                    }
                  }
                }
                wakeable.then(retry, retry);
              }
            });
          }
        }
        function commitMutationEffects(root2, finishedWork, committedLanes) {
          inProgressLanes = committedLanes;
          inProgressRoot = root2;
          setCurrentFiber(finishedWork);
          commitMutationEffectsOnFiber(finishedWork, root2);
          setCurrentFiber(finishedWork);
          inProgressLanes = null;
          inProgressRoot = null;
        }
        function recursivelyTraverseMutationEffects(root2, parentFiber, lanes) {
          const deletions = parentFiber.deletions;
          if (deletions !== null) {
            for (let i = 0; i < deletions.length; i++) {
              const childToDelete = deletions[i];
              try {
                commitDeletionEffects(root2, parentFiber, childToDelete);
              } catch (error2) {
                captureCommitPhaseError(childToDelete, parentFiber, error2);
              }
            }
          }
          const prevDebugFiber = getCurrentFiber();
          if (parentFiber.subtreeFlags & MutationMask) {
            let child = parentFiber.child;
            while (child !== null) {
              setCurrentFiber(child);
              commitMutationEffectsOnFiber(child, root2);
              child = child.sibling;
            }
          }
          setCurrentFiber(prevDebugFiber);
        }
        function commitMutationEffectsOnFiber(finishedWork, root2, lanes) {
          const current2 = finishedWork.alternate;
          const flags = finishedWork.flags;
          switch (finishedWork.tag) {
            case FunctionComponent:
            case ForwardRef:
            case MemoComponent:
            case SimpleMemoComponent: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Update) {
                try {
                  commitHookEffectListUnmount(Insertion | HasEffect, finishedWork, finishedWork.return);
                  commitHookEffectListMount(Insertion | HasEffect, finishedWork);
                } catch (error2) {
                  captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                }
                if (finishedWork.mode & ProfileMode) {
                  try {
                    startLayoutEffectTimer();
                    commitHookEffectListUnmount(Layout | HasEffect, finishedWork, finishedWork.return);
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                  recordLayoutEffectDuration(finishedWork);
                } else {
                  try {
                    commitHookEffectListUnmount(Layout | HasEffect, finishedWork, finishedWork.return);
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                }
              }
              return;
            }
            case ClassComponent: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Ref) {
                if (current2 !== null) {
                  safelyDetachRef(current2, current2.return);
                }
              }
              return;
            }
            case HostComponent: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Ref) {
                if (current2 !== null) {
                  safelyDetachRef(current2, current2.return);
                }
              }
              {
                if (finishedWork.flags & ContentReset) {
                  const instance = finishedWork.stateNode;
                  try {
                    resetTextContent(instance);
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                }
                if (flags & Update) {
                  const _instance4 = finishedWork.stateNode;
                  if (_instance4 != null) {
                    const newProps = finishedWork.memoizedProps;
                    const oldProps = current2 !== null ? current2.memoizedProps : newProps;
                    const type = finishedWork.type;
                    const updatePayload = finishedWork.updateQueue;
                    finishedWork.updateQueue = null;
                    if (updatePayload !== null) {
                      try {
                        commitUpdate(_instance4, updatePayload, type, oldProps, newProps, finishedWork);
                      } catch (error2) {
                        captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                      }
                    }
                  }
                }
              }
              return;
            }
            case HostText: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Update) {
                {
                  if (finishedWork.stateNode === null) {
                    throw new Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
                  }
                  const textInstance = finishedWork.stateNode;
                  const newText = finishedWork.memoizedProps;
                  const oldText = current2 !== null ? current2.memoizedProps : newText;
                  try {
                    commitTextUpdate(textInstance, oldText, newText);
                  } catch (error2) {
                    captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                  }
                }
              }
              return;
            }
            case HostRoot: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Update) {
                {
                  if (current2 !== null) {
                    const prevRootState = current2.memoizedState;
                    if (prevRootState.isDehydrated) {
                      try {
                        commitHydratedContainer(root2.containerInfo);
                      } catch (error2) {
                        captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                      }
                    }
                  }
                }
              }
              return;
            }
            case HostPortal: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              return;
            }
            case SuspenseComponent: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              const offscreenFiber = finishedWork.child;
              if (offscreenFiber.flags & Visibility) {
                const offscreenInstance = offscreenFiber.stateNode;
                const newState = offscreenFiber.memoizedState;
                const isHidden = newState !== null;
                offscreenInstance.isHidden = isHidden;
                if (isHidden) {
                  const wasHidden = offscreenFiber.alternate !== null && offscreenFiber.alternate.memoizedState !== null;
                  if (!wasHidden) {
                    markCommitTimeOfFallback();
                  }
                }
              }
              if (flags & Update) {
                try {
                  commitSuspenseCallback(finishedWork);
                } catch (error2) {
                  captureCommitPhaseError(finishedWork, finishedWork.return, error2);
                }
                attachSuspenseRetryListeners(finishedWork);
              }
              return;
            }
            case OffscreenComponent: {
              const _wasHidden = current2 !== null && current2.memoizedState !== null;
              if (
                // TODO: Remove this dead flag
                finishedWork.mode & ConcurrentMode
              ) {
                const prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
                offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _wasHidden;
                recursivelyTraverseMutationEffects(root2, finishedWork);
                offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
              } else {
                recursivelyTraverseMutationEffects(root2, finishedWork);
              }
              commitReconciliationEffects(finishedWork);
              if (flags & Visibility) {
                const _offscreenInstance = finishedWork.stateNode;
                const _newState = finishedWork.memoizedState;
                const _isHidden = _newState !== null;
                const offscreenBoundary = finishedWork;
                _offscreenInstance.isHidden = _isHidden;
                {
                  if (_isHidden) {
                    if (!_wasHidden) {
                      if ((offscreenBoundary.mode & ConcurrentMode) !== NoMode) {
                        nextEffect = offscreenBoundary;
                        let offscreenChild = offscreenBoundary.child;
                        while (offscreenChild !== null) {
                          nextEffect = offscreenChild;
                          disappearLayoutEffects_begin(offscreenChild);
                          offscreenChild = offscreenChild.sibling;
                        }
                      }
                    }
                  }
                }
                {
                  hideOrUnhideAllChildren(offscreenBoundary, _isHidden);
                }
              }
              return;
            }
            case SuspenseListComponent: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              if (flags & Update) {
                attachSuspenseRetryListeners(finishedWork);
              }
              return;
            }
            case ScopeComponent: {
              return;
            }
            default: {
              recursivelyTraverseMutationEffects(root2, finishedWork);
              commitReconciliationEffects(finishedWork);
              return;
            }
          }
        }
        function commitReconciliationEffects(finishedWork) {
          const flags = finishedWork.flags;
          if (flags & Placement) {
            try {
              commitPlacement(finishedWork);
            } catch (error2) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error2);
            }
            finishedWork.flags &= ~Placement;
          }
          if (flags & Hydrating) {
            finishedWork.flags &= ~Hydrating;
          }
        }
        function commitLayoutEffects(finishedWork, root2, committedLanes) {
          inProgressLanes = committedLanes;
          inProgressRoot = root2;
          nextEffect = finishedWork;
          commitLayoutEffects_begin(finishedWork, root2, committedLanes);
          inProgressLanes = null;
          inProgressRoot = null;
        }
        function commitLayoutEffects_begin(subtreeRoot, root2, committedLanes) {
          const isModernRoot = (subtreeRoot.mode & ConcurrentMode) !== NoMode;
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const firstChild = fiber.child;
            if (fiber.tag === OffscreenComponent && isModernRoot) {
              const isHidden = fiber.memoizedState !== null;
              const newOffscreenSubtreeIsHidden = isHidden || offscreenSubtreeIsHidden;
              if (newOffscreenSubtreeIsHidden) {
                commitLayoutMountEffects_complete(subtreeRoot, root2, committedLanes);
                continue;
              } else {
                const current2 = fiber.alternate;
                const wasHidden = current2 !== null && current2.memoizedState !== null;
                const newOffscreenSubtreeWasHidden = wasHidden || offscreenSubtreeWasHidden;
                const prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden;
                const prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
                offscreenSubtreeIsHidden = newOffscreenSubtreeIsHidden;
                offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden;
                if (offscreenSubtreeWasHidden && !prevOffscreenSubtreeWasHidden) {
                  nextEffect = fiber;
                  reappearLayoutEffects_begin(fiber);
                }
                let child = firstChild;
                while (child !== null) {
                  nextEffect = child;
                  commitLayoutEffects_begin(
                    child,
                    // New root; bubble back up to here and stop.
                    root2,
                    committedLanes
                  );
                  child = child.sibling;
                }
                nextEffect = fiber;
                offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
                offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
                commitLayoutMountEffects_complete(subtreeRoot, root2, committedLanes);
                continue;
              }
            }
            if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
              firstChild.return = fiber;
              nextEffect = firstChild;
            } else {
              commitLayoutMountEffects_complete(subtreeRoot, root2, committedLanes);
            }
          }
        }
        function commitLayoutMountEffects_complete(subtreeRoot, root2, committedLanes) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            if ((fiber.flags & LayoutMask) !== NoFlags) {
              const current2 = fiber.alternate;
              setCurrentFiber(fiber);
              try {
                commitLayoutEffectOnFiber(root2, current2, fiber, committedLanes);
              } catch (error2) {
                captureCommitPhaseError(fiber, fiber.return, error2);
              }
              resetCurrentFiber();
            }
            if (fiber === subtreeRoot) {
              nextEffect = null;
              return;
            }
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function disappearLayoutEffects_begin(subtreeRoot) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const firstChild = fiber.child;
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case MemoComponent:
              case SimpleMemoComponent: {
                if (fiber.mode & ProfileMode) {
                  try {
                    startLayoutEffectTimer();
                    commitHookEffectListUnmount(Layout, fiber, fiber.return);
                  } finally {
                    recordLayoutEffectDuration(fiber);
                  }
                } else {
                  commitHookEffectListUnmount(Layout, fiber, fiber.return);
                }
                break;
              }
              case ClassComponent: {
                safelyDetachRef(fiber, fiber.return);
                const instance = fiber.stateNode;
                if (typeof instance.componentWillUnmount === "function") {
                  safelyCallComponentWillUnmount(fiber, fiber.return, instance);
                }
                break;
              }
              case HostComponent: {
                safelyDetachRef(fiber, fiber.return);
                break;
              }
              case OffscreenComponent: {
                const isHidden = fiber.memoizedState !== null;
                if (isHidden) {
                  disappearLayoutEffects_complete(subtreeRoot);
                  continue;
                }
                break;
              }
            }
            if (firstChild !== null) {
              firstChild.return = fiber;
              nextEffect = firstChild;
            } else {
              disappearLayoutEffects_complete(subtreeRoot);
            }
          }
        }
        function disappearLayoutEffects_complete(subtreeRoot) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            if (fiber === subtreeRoot) {
              nextEffect = null;
              return;
            }
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function reappearLayoutEffects_begin(subtreeRoot) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const firstChild = fiber.child;
            if (fiber.tag === OffscreenComponent) {
              const isHidden = fiber.memoizedState !== null;
              if (isHidden) {
                reappearLayoutEffects_complete(subtreeRoot);
                continue;
              }
            }
            if (firstChild !== null) {
              firstChild.return = fiber;
              nextEffect = firstChild;
            } else {
              reappearLayoutEffects_complete(subtreeRoot);
            }
          }
        }
        function reappearLayoutEffects_complete(subtreeRoot) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            setCurrentFiber(fiber);
            try {
              reappearLayoutEffectsOnFiber(fiber);
            } catch (error2) {
              captureCommitPhaseError(fiber, fiber.return, error2);
            }
            resetCurrentFiber();
            if (fiber === subtreeRoot) {
              nextEffect = null;
              return;
            }
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function commitPassiveMountEffects(root2, finishedWork, committedLanes, committedTransitions) {
          nextEffect = finishedWork;
          commitPassiveMountEffects_begin(finishedWork, root2, committedLanes, committedTransitions);
        }
        function commitPassiveMountEffects_begin(subtreeRoot, root2, committedLanes, committedTransitions) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const firstChild = fiber.child;
            if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && firstChild !== null) {
              firstChild.return = fiber;
              nextEffect = firstChild;
            } else {
              commitPassiveMountEffects_complete(subtreeRoot, root2, committedLanes, committedTransitions);
            }
          }
        }
        function commitPassiveMountEffects_complete(subtreeRoot, root2, committedLanes, committedTransitions) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            if ((fiber.flags & Passive) !== NoFlags) {
              setCurrentFiber(fiber);
              try {
                commitPassiveMountOnFiber(root2, fiber, committedLanes, committedTransitions);
              } catch (error2) {
                captureCommitPhaseError(fiber, fiber.return, error2);
              }
              resetCurrentFiber();
            }
            if (fiber === subtreeRoot) {
              nextEffect = null;
              return;
            }
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
          switch (finishedWork.tag) {
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent: {
              if (finishedWork.mode & ProfileMode) {
                startPassiveEffectTimer();
                try {
                  commitHookEffectListMount(Passive$1 | HasEffect, finishedWork);
                } finally {
                  recordPassiveEffectDuration(finishedWork);
                }
              } else {
                commitHookEffectListMount(Passive$1 | HasEffect, finishedWork);
              }
              break;
            }
          }
        }
        function commitPassiveUnmountEffects(firstChild) {
          nextEffect = firstChild;
          commitPassiveUnmountEffects_begin();
        }
        function commitPassiveUnmountEffects_begin() {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const child = fiber.child;
            if ((nextEffect.flags & ChildDeletion) !== NoFlags) {
              const deletions = fiber.deletions;
              if (deletions !== null) {
                for (let i = 0; i < deletions.length; i++) {
                  const fiberToDelete = deletions[i];
                  nextEffect = fiberToDelete;
                  commitPassiveUnmountEffectsInsideOfDeletedTree_begin(fiberToDelete, fiber);
                }
                {
                  const previousFiber = fiber.alternate;
                  if (previousFiber !== null) {
                    let detachedChild = previousFiber.child;
                    if (detachedChild !== null) {
                      previousFiber.child = null;
                      do {
                        const detachedSibling = detachedChild.sibling;
                        detachedChild.sibling = null;
                        detachedChild = detachedSibling;
                      } while (detachedChild !== null);
                    }
                  }
                }
                nextEffect = fiber;
              }
            }
            if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
              child.return = fiber;
              nextEffect = child;
            } else {
              commitPassiveUnmountEffects_complete();
            }
          }
        }
        function commitPassiveUnmountEffects_complete() {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            if ((fiber.flags & Passive) !== NoFlags) {
              setCurrentFiber(fiber);
              commitPassiveUnmountOnFiber(fiber);
              resetCurrentFiber();
            }
            const sibling = fiber.sibling;
            if (sibling !== null) {
              sibling.return = fiber.return;
              nextEffect = sibling;
              return;
            }
            nextEffect = fiber.return;
          }
        }
        function commitPassiveUnmountOnFiber(finishedWork) {
          switch (finishedWork.tag) {
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent: {
              if (finishedWork.mode & ProfileMode) {
                startPassiveEffectTimer();
                commitHookEffectListUnmount(Passive$1 | HasEffect, finishedWork, finishedWork.return);
                recordPassiveEffectDuration(finishedWork);
              } else {
                commitHookEffectListUnmount(Passive$1 | HasEffect, finishedWork, finishedWork.return);
              }
              break;
            }
          }
        }
        function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            setCurrentFiber(fiber);
            commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor);
            resetCurrentFiber();
            const child = fiber.child;
            if (child !== null) {
              child.return = fiber;
              nextEffect = child;
            } else {
              commitPassiveUnmountEffectsInsideOfDeletedTree_complete(deletedSubtreeRoot);
            }
          }
        }
        function commitPassiveUnmountEffectsInsideOfDeletedTree_complete(deletedSubtreeRoot) {
          while (nextEffect !== null) {
            const fiber = nextEffect;
            const sibling = fiber.sibling;
            const returnFiber = fiber.return;
            {
              detachFiberAfterEffects(fiber);
              if (fiber === deletedSubtreeRoot) {
                nextEffect = null;
                return;
              }
            }
            if (sibling !== null) {
              sibling.return = returnFiber;
              nextEffect = sibling;
              return;
            }
            nextEffect = returnFiber;
          }
        }
        function commitPassiveUnmountInsideDeletedTreeOnFiber(current2, nearestMountedAncestor) {
          switch (current2.tag) {
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent: {
              if (current2.mode & ProfileMode) {
                startPassiveEffectTimer();
                commitHookEffectListUnmount(Passive$1, current2, nearestMountedAncestor);
                recordPassiveEffectDuration(current2);
              } else {
                commitHookEffectListUnmount(Passive$1, current2, nearestMountedAncestor);
              }
              break;
            }
          }
        }
        function invokeLayoutEffectMountInDEV(fiber) {
          {
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                try {
                  commitHookEffectListMount(Layout | HasEffect, fiber);
                } catch (error2) {
                  captureCommitPhaseError(fiber, fiber.return, error2);
                }
                break;
              }
              case ClassComponent: {
                const instance = fiber.stateNode;
                try {
                  instance.componentDidMount();
                } catch (error2) {
                  captureCommitPhaseError(fiber, fiber.return, error2);
                }
                break;
              }
            }
          }
        }
        function invokePassiveEffectMountInDEV(fiber) {
          {
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                try {
                  commitHookEffectListMount(Passive$1 | HasEffect, fiber);
                } catch (error2) {
                  captureCommitPhaseError(fiber, fiber.return, error2);
                }
                break;
              }
            }
          }
        }
        function invokeLayoutEffectUnmountInDEV(fiber) {
          {
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                try {
                  commitHookEffectListUnmount(Layout | HasEffect, fiber, fiber.return);
                } catch (error2) {
                  captureCommitPhaseError(fiber, fiber.return, error2);
                }
                break;
              }
              case ClassComponent: {
                const instance = fiber.stateNode;
                if (typeof instance.componentWillUnmount === "function") {
                  safelyCallComponentWillUnmount(fiber, fiber.return, instance);
                }
                break;
              }
            }
          }
        }
        function invokePassiveEffectUnmountInDEV(fiber) {
          {
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent: {
                try {
                  commitHookEffectListUnmount(Passive$1 | HasEffect, fiber, fiber.return);
                } catch (error2) {
                  captureCommitPhaseError(fiber, fiber.return, error2);
                }
              }
            }
          }
        }
        let COMPONENT_TYPE = 0;
        let HAS_PSEUDO_CLASS_TYPE = 1;
        let ROLE_TYPE = 2;
        let TEST_NAME_TYPE = 3;
        let TEXT_TYPE = 4;
        if (typeof Symbol === "function" && Symbol.for) {
          const symbolFor = Symbol.for;
          COMPONENT_TYPE = symbolFor("selector.component");
          HAS_PSEUDO_CLASS_TYPE = symbolFor("selector.has_pseudo_class");
          ROLE_TYPE = symbolFor("selector.role");
          TEST_NAME_TYPE = symbolFor("selector.test_id");
          TEXT_TYPE = symbolFor("selector.text");
        }
        const commitHooks = [];
        function onCommitRoot$1() {
          {
            commitHooks.forEach(function(commitHook) {
              return commitHook();
            });
          }
        }
        const ReactCurrentActQueue = ReactSharedInternals.ReactCurrentActQueue;
        function isLegacyActEnvironment(fiber) {
          {
            const isReactActEnvironmentGlobal = (
              // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
              typeof IS_REACT_ACT_ENVIRONMENT !== "undefined" ? IS_REACT_ACT_ENVIRONMENT : void 0
            );
            const jestIsDefined = typeof jest !== "undefined";
            return jestIsDefined && isReactActEnvironmentGlobal !== false;
          }
        }
        function isConcurrentActEnvironment() {
          {
            const isReactActEnvironmentGlobal = (
              // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
              typeof IS_REACT_ACT_ENVIRONMENT !== "undefined" ? IS_REACT_ACT_ENVIRONMENT : void 0
            );
            if (!isReactActEnvironmentGlobal && ReactCurrentActQueue.current !== null) {
              error("The current testing environment is not configured to support act(...)");
            }
            return isReactActEnvironmentGlobal;
          }
        }
        const ceil = Math.ceil;
        const ReactCurrentDispatcher$2 = ReactSharedInternals.ReactCurrentDispatcher, ReactCurrentOwner$2 = ReactSharedInternals.ReactCurrentOwner, ReactCurrentBatchConfig$3 = ReactSharedInternals.ReactCurrentBatchConfig, ReactCurrentActQueue$1 = ReactSharedInternals.ReactCurrentActQueue;
        const NoContext = (
          /*             */
          0
        );
        const BatchedContext = (
          /*               */
          1
        );
        const RenderContext = (
          /*                */
          2
        );
        const CommitContext = (
          /*                */
          4
        );
        const RootInProgress = 0;
        const RootFatalErrored = 1;
        const RootErrored = 2;
        const RootSuspended = 3;
        const RootSuspendedWithDelay = 4;
        const RootCompleted = 5;
        const RootDidNotComplete = 6;
        let executionContext = NoContext;
        let workInProgressRoot = null;
        let workInProgress = null;
        let workInProgressRootRenderLanes = NoLanes;
        var subtreeRenderLanes = NoLanes;
        const subtreeRenderLanesCursor = createCursor(NoLanes);
        let workInProgressRootExitStatus = RootInProgress;
        let workInProgressRootFatalError = null;
        let workInProgressRootIncludedLanes = NoLanes;
        let workInProgressRootSkippedLanes = NoLanes;
        let workInProgressRootInterleavedUpdatedLanes = NoLanes;
        let workInProgressRootPingedLanes = NoLanes;
        let workInProgressRootConcurrentErrors = null;
        let workInProgressRootRecoverableErrors = null;
        let globalMostRecentFallbackTime = 0;
        const FALLBACK_THROTTLE_MS = 500;
        let workInProgressRootRenderTargetTime = Infinity;
        const RENDER_TIMEOUT_MS = 500;
        let workInProgressTransitions = null;
        function resetRenderTimer() {
          workInProgressRootRenderTargetTime = now() + RENDER_TIMEOUT_MS;
        }
        function getRenderTargetTime() {
          return workInProgressRootRenderTargetTime;
        }
        let hasUncaughtError = false;
        let firstUncaughtError = null;
        let legacyErrorBoundariesThatAlreadyFailed = null;
        let rootDoesHavePassiveEffects = false;
        let rootWithPendingPassiveEffects = null;
        let pendingPassiveEffectsLanes = NoLanes;
        let pendingPassiveProfilerEffects = [];
        let pendingPassiveTransitions = null;
        const NESTED_UPDATE_LIMIT = 50;
        let nestedUpdateCount = 0;
        let rootWithNestedUpdates = null;
        let isFlushingPassiveEffects = false;
        let didScheduleUpdateDuringPassiveEffects = false;
        const NESTED_PASSIVE_UPDATE_LIMIT = 50;
        let nestedPassiveUpdateCount = 0;
        let rootWithPassiveNestedUpdates = null;
        let currentEventTime = NoTimestamp;
        let currentEventTransitionLane = NoLanes;
        let isRunningInsertionEffect = false;
        function getWorkInProgressRoot() {
          return workInProgressRoot;
        }
        function requestEventTime() {
          if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
            return now();
          }
          if (currentEventTime !== NoTimestamp) {
            return currentEventTime;
          }
          currentEventTime = now();
          return currentEventTime;
        }
        function requestUpdateLane(fiber) {
          const mode = fiber.mode;
          if ((mode & ConcurrentMode) === NoMode) {
            return SyncLane;
          } else if ((executionContext & RenderContext) !== NoContext && workInProgressRootRenderLanes !== NoLanes) {
            return pickArbitraryLane(workInProgressRootRenderLanes);
          }
          const isTransition = requestCurrentTransition() !== NoTransition;
          if (isTransition) {
            if (ReactCurrentBatchConfig$3.transition !== null) {
              const transition = ReactCurrentBatchConfig$3.transition;
              if (!transition._updatedFibers) {
                transition._updatedFibers = /* @__PURE__ */ new Set();
              }
              transition._updatedFibers.add(fiber);
            }
            if (currentEventTransitionLane === NoLane) {
              currentEventTransitionLane = claimNextTransitionLane();
            }
            return currentEventTransitionLane;
          }
          const updateLane = getCurrentUpdatePriority();
          if (updateLane !== NoLane) {
            return updateLane;
          }
          const eventLane = getCurrentEventPriority();
          return eventLane;
        }
        function requestRetryLane(fiber) {
          const mode = fiber.mode;
          if ((mode & ConcurrentMode) === NoMode) {
            return SyncLane;
          }
          return claimNextRetryLane();
        }
        function scheduleUpdateOnFiber(root2, fiber, lane, eventTime) {
          checkForNestedUpdates();
          {
            if (isRunningInsertionEffect) {
              error("useInsertionEffect must not schedule updates.");
            }
          }
          {
            if (isFlushingPassiveEffects) {
              didScheduleUpdateDuringPassiveEffects = true;
            }
          }
          markRootUpdated(root2, lane, eventTime);
          if ((executionContext & RenderContext) !== NoLanes && root2 === workInProgressRoot) {
            warnAboutRenderPhaseUpdatesInDEV(fiber);
          } else {
            {
              if (isDevToolsPresent) {
                addFiberToLanesMap(root2, fiber, lane);
              }
            }
            warnIfUpdatesNotWrappedWithActDEV(fiber);
            if (root2 === workInProgressRoot) {
              if ((executionContext & RenderContext) === NoContext) {
                workInProgressRootInterleavedUpdatedLanes = mergeLanes(workInProgressRootInterleavedUpdatedLanes, lane);
              }
              if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
                markRootSuspended$1(root2, workInProgressRootRenderLanes);
              }
            }
            ensureRootIsScheduled(root2, eventTime);
            if (lane === SyncLane && executionContext === NoContext && (fiber.mode & ConcurrentMode) === NoMode && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
            !ReactCurrentActQueue$1.isBatchingLegacy) {
              resetRenderTimer();
              flushSyncCallbacksOnlyInLegacyMode();
            }
          }
        }
        function scheduleInitialHydrationOnRoot(root2, lane, eventTime) {
          const current2 = root2.current;
          current2.lanes = lane;
          markRootUpdated(root2, lane, eventTime);
          ensureRootIsScheduled(root2, eventTime);
        }
        function isUnsafeClassRenderPhaseUpdate(fiber) {
          return (
            // TODO: Remove outdated deferRenderPhaseUpdateToNextBatch experiment. We
            // decided not to enable it.
            (executionContext & RenderContext) !== NoContext
          );
        }
        function ensureRootIsScheduled(root2, currentTime) {
          const existingCallbackNode = root2.callbackNode;
          markStarvedLanesAsExpired(root2, currentTime);
          const nextLanes = getNextLanes(root2, root2 === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes);
          if (nextLanes === NoLanes) {
            if (existingCallbackNode !== null) {
              cancelCallback$1(existingCallbackNode);
            }
            root2.callbackNode = null;
            root2.callbackPriority = NoLane;
            return;
          }
          const newCallbackPriority = getHighestPriorityLane(nextLanes);
          const existingCallbackPriority = root2.callbackPriority;
          if (existingCallbackPriority === newCallbackPriority && // Special case related to `act`. If the currently scheduled task is a
          // Scheduler task, rather than an `act` task, cancel it and re-scheduled
          // on the `act` queue.
          !(ReactCurrentActQueue$1.current !== null && existingCallbackNode !== fakeActCallbackNode)) {
            {
              if (existingCallbackNode == null && existingCallbackPriority !== SyncLane) {
                error("Expected scheduled callback to exist. This error is likely caused by a bug in React. Please file an issue.");
              }
            }
            return;
          }
          if (existingCallbackNode != null) {
            cancelCallback$1(existingCallbackNode);
          }
          let newCallbackNode;
          if (newCallbackPriority === SyncLane) {
            if (root2.tag === LegacyRoot) {
              if (ReactCurrentActQueue$1.isBatchingLegacy !== null) {
                ReactCurrentActQueue$1.didScheduleLegacyUpdate = true;
              }
              scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root2));
            } else {
              scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root2));
            }
            {
              if (ReactCurrentActQueue$1.current !== null) {
                ReactCurrentActQueue$1.current.push(flushSyncCallbacks);
              } else {
                scheduleMicrotask(function() {
                  if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
                    flushSyncCallbacks();
                  }
                });
              }
            }
            newCallbackNode = null;
          } else {
            let schedulerPriorityLevel;
            switch (lanesToEventPriority(nextLanes)) {
              case DiscreteEventPriority:
                schedulerPriorityLevel = ImmediatePriority;
                break;
              case ContinuousEventPriority:
                schedulerPriorityLevel = UserBlockingPriority;
                break;
              case DefaultEventPriority:
                schedulerPriorityLevel = NormalPriority;
                break;
              case IdleEventPriority:
                schedulerPriorityLevel = IdlePriority;
                break;
              default:
                schedulerPriorityLevel = NormalPriority;
                break;
            }
            newCallbackNode = scheduleCallback$1(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root2));
          }
          root2.callbackPriority = newCallbackPriority;
          root2.callbackNode = newCallbackNode;
        }
        function performConcurrentWorkOnRoot(root2, didTimeout) {
          {
            resetNestedUpdateFlag();
          }
          currentEventTime = NoTimestamp;
          currentEventTransitionLane = NoLanes;
          if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
            throw new Error("Should not already be working.");
          }
          const originalCallbackNode = root2.callbackNode;
          const didFlushPassiveEffects = flushPassiveEffects();
          if (didFlushPassiveEffects) {
            if (root2.callbackNode !== originalCallbackNode) {
              return null;
            }
          }
          let lanes = getNextLanes(root2, root2 === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes);
          if (lanes === NoLanes) {
            return null;
          }
          const shouldTimeSlice = !includesBlockingLane(root2, lanes) && !includesExpiredLane(root2, lanes) && !didTimeout;
          let exitStatus = shouldTimeSlice ? renderRootConcurrent(root2, lanes) : renderRootSync(root2, lanes);
          if (exitStatus !== RootInProgress) {
            if (exitStatus === RootErrored) {
              const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root2);
              if (errorRetryLanes !== NoLanes) {
                lanes = errorRetryLanes;
                exitStatus = recoverFromConcurrentError(root2, errorRetryLanes);
              }
            }
            if (exitStatus === RootFatalErrored) {
              const fatalError = workInProgressRootFatalError;
              prepareFreshStack(root2, NoLanes);
              markRootSuspended$1(root2, lanes);
              ensureRootIsScheduled(root2, now());
              throw fatalError;
            }
            if (exitStatus === RootDidNotComplete) {
              markRootSuspended$1(root2, lanes);
            } else {
              const renderWasConcurrent = !includesBlockingLane(root2, lanes);
              const finishedWork = root2.current.alternate;
              if (renderWasConcurrent && !isRenderConsistentWithExternalStores(finishedWork)) {
                exitStatus = renderRootSync(root2, lanes);
                if (exitStatus === RootErrored) {
                  const _errorRetryLanes = getLanesToRetrySynchronouslyOnError(root2);
                  if (_errorRetryLanes !== NoLanes) {
                    lanes = _errorRetryLanes;
                    exitStatus = recoverFromConcurrentError(root2, _errorRetryLanes);
                  }
                }
                if (exitStatus === RootFatalErrored) {
                  const _fatalError = workInProgressRootFatalError;
                  prepareFreshStack(root2, NoLanes);
                  markRootSuspended$1(root2, lanes);
                  ensureRootIsScheduled(root2, now());
                  throw _fatalError;
                }
              }
              root2.finishedWork = finishedWork;
              root2.finishedLanes = lanes;
              finishConcurrentRender(root2, exitStatus, lanes);
            }
          }
          ensureRootIsScheduled(root2, now());
          if (root2.callbackNode === originalCallbackNode) {
            return performConcurrentWorkOnRoot.bind(null, root2);
          }
          return null;
        }
        function recoverFromConcurrentError(root2, errorRetryLanes) {
          const errorsFromFirstAttempt = workInProgressRootConcurrentErrors;
          if (isRootDehydrated(root2)) {
            const rootWorkInProgress = prepareFreshStack(root2, errorRetryLanes);
            rootWorkInProgress.flags |= ForceClientRender;
            {
              errorHydratingContainer(root2.containerInfo);
            }
          }
          const exitStatus = renderRootSync(root2, errorRetryLanes);
          if (exitStatus !== RootErrored) {
            const errorsFromSecondAttempt = workInProgressRootRecoverableErrors;
            workInProgressRootRecoverableErrors = errorsFromFirstAttempt;
            if (errorsFromSecondAttempt !== null) {
              queueRecoverableErrors(errorsFromSecondAttempt);
            }
          }
          return exitStatus;
        }
        function queueRecoverableErrors(errors) {
          if (workInProgressRootRecoverableErrors === null) {
            workInProgressRootRecoverableErrors = errors;
          } else {
            workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, errors);
          }
        }
        function finishConcurrentRender(root2, exitStatus, lanes) {
          switch (exitStatus) {
            case RootInProgress:
            case RootFatalErrored: {
              throw new Error("Root did not complete. This is a bug in React.");
            }
            case RootErrored: {
              commitRoot(root2, workInProgressRootRecoverableErrors, workInProgressTransitions);
              break;
            }
            case RootSuspended: {
              markRootSuspended$1(root2, lanes);
              if (includesOnlyRetries(lanes) && // do not delay if we're inside an act() scope
              !shouldForceFlushFallbacksInDEV()) {
                const msUntilTimeout = globalMostRecentFallbackTime + FALLBACK_THROTTLE_MS - now();
                if (msUntilTimeout > 10) {
                  const nextLanes = getNextLanes(root2, NoLanes);
                  if (nextLanes !== NoLanes) {
                    break;
                  }
                  const suspendedLanes = root2.suspendedLanes;
                  if (!isSubsetOfLanes(suspendedLanes, lanes)) {
                    const eventTime = requestEventTime();
                    markRootPinged(root2, suspendedLanes);
                    break;
                  }
                  root2.timeoutHandle = scheduleTimeout(commitRoot.bind(null, root2, workInProgressRootRecoverableErrors, workInProgressTransitions), msUntilTimeout);
                  break;
                }
              }
              commitRoot(root2, workInProgressRootRecoverableErrors, workInProgressTransitions);
              break;
            }
            case RootSuspendedWithDelay: {
              markRootSuspended$1(root2, lanes);
              if (includesOnlyTransitions(lanes)) {
                break;
              }
              if (!shouldForceFlushFallbacksInDEV()) {
                const mostRecentEventTime = getMostRecentEventTime(root2, lanes);
                const eventTimeMs = mostRecentEventTime;
                const timeElapsedMs = now() - eventTimeMs;
                const _msUntilTimeout = jnd(timeElapsedMs) - timeElapsedMs;
                if (_msUntilTimeout > 10) {
                  root2.timeoutHandle = scheduleTimeout(commitRoot.bind(null, root2, workInProgressRootRecoverableErrors, workInProgressTransitions), _msUntilTimeout);
                  break;
                }
              }
              commitRoot(root2, workInProgressRootRecoverableErrors, workInProgressTransitions);
              break;
            }
            case RootCompleted: {
              commitRoot(root2, workInProgressRootRecoverableErrors, workInProgressTransitions);
              break;
            }
            default: {
              throw new Error("Unknown root exit status.");
            }
          }
        }
        function isRenderConsistentWithExternalStores(finishedWork) {
          let node = finishedWork;
          while (true) {
            if (node.flags & StoreConsistency) {
              const updateQueue = node.updateQueue;
              if (updateQueue !== null) {
                const checks = updateQueue.stores;
                if (checks !== null) {
                  for (let i = 0; i < checks.length; i++) {
                    const check = checks[i];
                    const getSnapshot = check.getSnapshot;
                    const renderedValue = check.value;
                    try {
                      if (!objectIs(getSnapshot(), renderedValue)) {
                        return false;
                      }
                    } catch (error2) {
                      return false;
                    }
                  }
                }
              }
            }
            const child = node.child;
            if (node.subtreeFlags & StoreConsistency && child !== null) {
              child.return = node;
              node = child;
              continue;
            }
            if (node === finishedWork) {
              return true;
            }
            while (node.sibling === null) {
              if (node.return === null || node.return === finishedWork) {
                return true;
              }
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
          }
          return true;
        }
        function markRootSuspended$1(root2, suspendedLanes) {
          suspendedLanes = removeLanes(suspendedLanes, workInProgressRootPingedLanes);
          suspendedLanes = removeLanes(suspendedLanes, workInProgressRootInterleavedUpdatedLanes);
          markRootSuspended(root2, suspendedLanes);
        }
        function performSyncWorkOnRoot(root2) {
          {
            syncNestedUpdateFlag();
          }
          if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
            throw new Error("Should not already be working.");
          }
          flushPassiveEffects();
          let lanes = getNextLanes(root2, NoLanes);
          if (!includesSomeLane(lanes, SyncLane)) {
            ensureRootIsScheduled(root2, now());
            return null;
          }
          let exitStatus = renderRootSync(root2, lanes);
          if (root2.tag !== LegacyRoot && exitStatus === RootErrored) {
            const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root2);
            if (errorRetryLanes !== NoLanes) {
              lanes = errorRetryLanes;
              exitStatus = recoverFromConcurrentError(root2, errorRetryLanes);
            }
          }
          if (exitStatus === RootFatalErrored) {
            const fatalError = workInProgressRootFatalError;
            prepareFreshStack(root2, NoLanes);
            markRootSuspended$1(root2, lanes);
            ensureRootIsScheduled(root2, now());
            throw fatalError;
          }
          if (exitStatus === RootDidNotComplete) {
            throw new Error("Root did not complete. This is a bug in React.");
          }
          const finishedWork = root2.current.alternate;
          root2.finishedWork = finishedWork;
          root2.finishedLanes = lanes;
          commitRoot(root2, workInProgressRootRecoverableErrors, workInProgressTransitions);
          ensureRootIsScheduled(root2, now());
          return null;
        }
        function flushRoot(root2, lanes) {
          if (lanes !== NoLanes) {
            markRootEntangled(root2, mergeLanes(lanes, SyncLane));
            ensureRootIsScheduled(root2, now());
            if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
              resetRenderTimer();
              flushSyncCallbacks();
            }
          }
        }
        function batchedUpdates$1(fn, a) {
          const prevExecutionContext = executionContext;
          executionContext |= BatchedContext;
          try {
            return fn(a);
          } finally {
            executionContext = prevExecutionContext;
            if (executionContext === NoContext && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
            !ReactCurrentActQueue$1.isBatchingLegacy) {
              resetRenderTimer();
              flushSyncCallbacksOnlyInLegacyMode();
            }
          }
        }
        function discreteUpdates(fn, a, b, c, d) {
          const previousPriority = getCurrentUpdatePriority();
          const prevTransition = ReactCurrentBatchConfig$3.transition;
          try {
            ReactCurrentBatchConfig$3.transition = null;
            setCurrentUpdatePriority(DiscreteEventPriority);
            return fn(a, b, c, d);
          } finally {
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig$3.transition = prevTransition;
            if (executionContext === NoContext) {
              resetRenderTimer();
            }
          }
        }
        function flushSync(fn) {
          if (rootWithPendingPassiveEffects !== null && rootWithPendingPassiveEffects.tag === LegacyRoot && (executionContext & (RenderContext | CommitContext)) === NoContext) {
            flushPassiveEffects();
          }
          const prevExecutionContext = executionContext;
          executionContext |= BatchedContext;
          const prevTransition = ReactCurrentBatchConfig$3.transition;
          const previousPriority = getCurrentUpdatePriority();
          try {
            ReactCurrentBatchConfig$3.transition = null;
            setCurrentUpdatePriority(DiscreteEventPriority);
            if (fn) {
              return fn();
            } else {
              return void 0;
            }
          } finally {
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig$3.transition = prevTransition;
            executionContext = prevExecutionContext;
            if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
              flushSyncCallbacks();
            }
          }
        }
        function isAlreadyRendering() {
          return (executionContext & (RenderContext | CommitContext)) !== NoContext;
        }
        function pushRenderLanes(fiber, lanes) {
          push(subtreeRenderLanesCursor, subtreeRenderLanes, fiber);
          subtreeRenderLanes = mergeLanes(subtreeRenderLanes, lanes);
          workInProgressRootIncludedLanes = mergeLanes(workInProgressRootIncludedLanes, lanes);
        }
        function popRenderLanes(fiber) {
          subtreeRenderLanes = subtreeRenderLanesCursor.current;
          pop(subtreeRenderLanesCursor, fiber);
        }
        function prepareFreshStack(root2, lanes) {
          root2.finishedWork = null;
          root2.finishedLanes = NoLanes;
          const timeoutHandle = root2.timeoutHandle;
          if (timeoutHandle !== noTimeout) {
            root2.timeoutHandle = noTimeout;
            cancelTimeout(timeoutHandle);
          }
          if (workInProgress !== null) {
            let interruptedWork = workInProgress.return;
            while (interruptedWork !== null) {
              const current2 = interruptedWork.alternate;
              unwindInterruptedWork(current2, interruptedWork);
              interruptedWork = interruptedWork.return;
            }
          }
          workInProgressRoot = root2;
          const rootWorkInProgress = createWorkInProgress(root2.current, null);
          workInProgress = rootWorkInProgress;
          workInProgressRootRenderLanes = subtreeRenderLanes = workInProgressRootIncludedLanes = lanes;
          workInProgressRootExitStatus = RootInProgress;
          workInProgressRootFatalError = null;
          workInProgressRootSkippedLanes = NoLanes;
          workInProgressRootInterleavedUpdatedLanes = NoLanes;
          workInProgressRootPingedLanes = NoLanes;
          workInProgressRootConcurrentErrors = null;
          workInProgressRootRecoverableErrors = null;
          finishQueueingConcurrentUpdates();
          {
            ReactStrictModeWarnings.discardPendingWarnings();
          }
          return rootWorkInProgress;
        }
        function handleError(root2, thrownValue) {
          do {
            let erroredWork = workInProgress;
            try {
              resetContextDependencies();
              resetHooksAfterThrow();
              resetCurrentFiber();
              ReactCurrentOwner$2.current = null;
              if (erroredWork === null || erroredWork.return === null) {
                workInProgressRootExitStatus = RootFatalErrored;
                workInProgressRootFatalError = thrownValue;
                workInProgress = null;
                return;
              }
              if (enableProfilerTimer && erroredWork.mode & ProfileMode) {
                stopProfilerTimerIfRunningAndRecordDelta(erroredWork, true);
              }
              if (enableSchedulingProfiler) {
                markComponentRenderStopped();
                if (thrownValue !== null && typeof thrownValue === "object" && typeof thrownValue.then === "function") {
                  const wakeable = thrownValue;
                  markComponentSuspended(erroredWork, wakeable, workInProgressRootRenderLanes);
                } else {
                  markComponentErrored(erroredWork, thrownValue, workInProgressRootRenderLanes);
                }
              }
              throwException(root2, erroredWork.return, erroredWork, thrownValue, workInProgressRootRenderLanes);
              completeUnitOfWork(erroredWork);
            } catch (yetAnotherThrownValue) {
              thrownValue = yetAnotherThrownValue;
              if (workInProgress === erroredWork && erroredWork !== null) {
                erroredWork = erroredWork.return;
                workInProgress = erroredWork;
              } else {
                erroredWork = workInProgress;
              }
              continue;
            }
            return;
          } while (true);
        }
        function pushDispatcher() {
          const prevDispatcher = ReactCurrentDispatcher$2.current;
          ReactCurrentDispatcher$2.current = ContextOnlyDispatcher;
          if (prevDispatcher === null) {
            return ContextOnlyDispatcher;
          } else {
            return prevDispatcher;
          }
        }
        function popDispatcher(prevDispatcher) {
          ReactCurrentDispatcher$2.current = prevDispatcher;
        }
        function markCommitTimeOfFallback() {
          globalMostRecentFallbackTime = now();
        }
        function markSkippedUpdateLanes(lane) {
          workInProgressRootSkippedLanes = mergeLanes(lane, workInProgressRootSkippedLanes);
        }
        function renderDidSuspend() {
          if (workInProgressRootExitStatus === RootInProgress) {
            workInProgressRootExitStatus = RootSuspended;
          }
        }
        function renderDidSuspendDelayIfPossible() {
          if (workInProgressRootExitStatus === RootInProgress || workInProgressRootExitStatus === RootSuspended || workInProgressRootExitStatus === RootErrored) {
            workInProgressRootExitStatus = RootSuspendedWithDelay;
          }
          if (workInProgressRoot !== null && (includesNonIdleWork(workInProgressRootSkippedLanes) || includesNonIdleWork(workInProgressRootInterleavedUpdatedLanes))) {
            markRootSuspended$1(workInProgressRoot, workInProgressRootRenderLanes);
          }
        }
        function renderDidError(error2) {
          if (workInProgressRootExitStatus !== RootSuspendedWithDelay) {
            workInProgressRootExitStatus = RootErrored;
          }
          if (workInProgressRootConcurrentErrors === null) {
            workInProgressRootConcurrentErrors = [error2];
          } else {
            workInProgressRootConcurrentErrors.push(error2);
          }
        }
        function renderHasNotSuspendedYet() {
          return workInProgressRootExitStatus === RootInProgress;
        }
        function renderRootSync(root2, lanes) {
          const prevExecutionContext = executionContext;
          executionContext |= RenderContext;
          const prevDispatcher = pushDispatcher();
          if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes) {
            {
              if (isDevToolsPresent) {
                const memoizedUpdaters = root2.memoizedUpdaters;
                if (memoizedUpdaters.size > 0) {
                  restorePendingUpdaters(root2, workInProgressRootRenderLanes);
                  memoizedUpdaters.clear();
                }
                movePendingFibersToMemoized(root2, lanes);
              }
            }
            workInProgressTransitions = getTransitionsForLanes();
            prepareFreshStack(root2, lanes);
          }
          {
            markRenderStarted(lanes);
          }
          do {
            try {
              workLoopSync();
              break;
            } catch (thrownValue) {
              handleError(root2, thrownValue);
            }
          } while (true);
          resetContextDependencies();
          executionContext = prevExecutionContext;
          popDispatcher(prevDispatcher);
          if (workInProgress !== null) {
            throw new Error("Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.");
          }
          {
            markRenderStopped();
          }
          workInProgressRoot = null;
          workInProgressRootRenderLanes = NoLanes;
          return workInProgressRootExitStatus;
        }
        function workLoopSync() {
          while (workInProgress !== null) {
            performUnitOfWork(workInProgress);
          }
        }
        function renderRootConcurrent(root2, lanes) {
          const prevExecutionContext = executionContext;
          executionContext |= RenderContext;
          const prevDispatcher = pushDispatcher();
          if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes) {
            {
              if (isDevToolsPresent) {
                const memoizedUpdaters = root2.memoizedUpdaters;
                if (memoizedUpdaters.size > 0) {
                  restorePendingUpdaters(root2, workInProgressRootRenderLanes);
                  memoizedUpdaters.clear();
                }
                movePendingFibersToMemoized(root2, lanes);
              }
            }
            workInProgressTransitions = getTransitionsForLanes();
            resetRenderTimer();
            prepareFreshStack(root2, lanes);
          }
          {
            markRenderStarted(lanes);
          }
          do {
            try {
              workLoopConcurrent();
              break;
            } catch (thrownValue) {
              handleError(root2, thrownValue);
            }
          } while (true);
          resetContextDependencies();
          popDispatcher(prevDispatcher);
          executionContext = prevExecutionContext;
          if (workInProgress !== null) {
            {
              markRenderYielded();
            }
            return RootInProgress;
          } else {
            {
              markRenderStopped();
            }
            workInProgressRoot = null;
            workInProgressRootRenderLanes = NoLanes;
            return workInProgressRootExitStatus;
          }
        }
        function workLoopConcurrent() {
          while (workInProgress !== null && !shouldYield()) {
            performUnitOfWork(workInProgress);
          }
        }
        function performUnitOfWork(unitOfWork) {
          const current2 = unitOfWork.alternate;
          setCurrentFiber(unitOfWork);
          let next;
          if ((unitOfWork.mode & ProfileMode) !== NoMode) {
            startProfilerTimer(unitOfWork);
            next = beginWork$1(current2, unitOfWork, subtreeRenderLanes);
            stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
          } else {
            next = beginWork$1(current2, unitOfWork, subtreeRenderLanes);
          }
          resetCurrentFiber();
          unitOfWork.memoizedProps = unitOfWork.pendingProps;
          if (next === null) {
            completeUnitOfWork(unitOfWork);
          } else {
            workInProgress = next;
          }
          ReactCurrentOwner$2.current = null;
        }
        function completeUnitOfWork(unitOfWork) {
          let completedWork = unitOfWork;
          do {
            const current2 = completedWork.alternate;
            const returnFiber = completedWork.return;
            if ((completedWork.flags & Incomplete) === NoFlags) {
              setCurrentFiber(completedWork);
              let next = void 0;
              if ((completedWork.mode & ProfileMode) === NoMode) {
                next = completeWork(current2, completedWork, subtreeRenderLanes);
              } else {
                startProfilerTimer(completedWork);
                next = completeWork(current2, completedWork, subtreeRenderLanes);
                stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);
              }
              resetCurrentFiber();
              if (next !== null) {
                workInProgress = next;
                return;
              }
            } else {
              const _next = unwindWork(current2, completedWork);
              if (_next !== null) {
                _next.flags &= HostEffectMask;
                workInProgress = _next;
                return;
              }
              if ((completedWork.mode & ProfileMode) !== NoMode) {
                stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);
                let actualDuration = completedWork.actualDuration;
                let child = completedWork.child;
                while (child !== null) {
                  actualDuration += child.actualDuration;
                  child = child.sibling;
                }
                completedWork.actualDuration = actualDuration;
              }
              if (returnFiber !== null) {
                returnFiber.flags |= Incomplete;
                returnFiber.subtreeFlags = NoFlags;
                returnFiber.deletions = null;
              } else {
                workInProgressRootExitStatus = RootDidNotComplete;
                workInProgress = null;
                return;
              }
            }
            const siblingFiber = completedWork.sibling;
            if (siblingFiber !== null) {
              workInProgress = siblingFiber;
              return;
            }
            completedWork = returnFiber;
            workInProgress = completedWork;
          } while (completedWork !== null);
          if (workInProgressRootExitStatus === RootInProgress) {
            workInProgressRootExitStatus = RootCompleted;
          }
        }
        function commitRoot(root2, recoverableErrors, transitions) {
          const previousUpdateLanePriority = getCurrentUpdatePriority();
          const prevTransition = ReactCurrentBatchConfig$3.transition;
          try {
            ReactCurrentBatchConfig$3.transition = null;
            setCurrentUpdatePriority(DiscreteEventPriority);
            commitRootImpl(root2, recoverableErrors, transitions, previousUpdateLanePriority);
          } finally {
            ReactCurrentBatchConfig$3.transition = prevTransition;
            setCurrentUpdatePriority(previousUpdateLanePriority);
          }
          return null;
        }
        function commitRootImpl(root2, recoverableErrors, transitions, renderPriorityLevel) {
          do {
            flushPassiveEffects();
          } while (rootWithPendingPassiveEffects !== null);
          flushRenderPhaseStrictModeWarningsInDEV();
          if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
            throw new Error("Should not already be working.");
          }
          const finishedWork = root2.finishedWork;
          const lanes = root2.finishedLanes;
          {
            markCommitStarted(lanes);
          }
          if (finishedWork === null) {
            {
              markCommitStopped();
            }
            return null;
          } else {
            {
              if (lanes === NoLanes) {
                error("root.finishedLanes should not be empty during a commit. This is a bug in React.");
              }
            }
          }
          root2.finishedWork = null;
          root2.finishedLanes = NoLanes;
          if (finishedWork === root2.current) {
            throw new Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
          }
          root2.callbackNode = null;
          root2.callbackPriority = NoLane;
          let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
          markRootFinished(root2, remainingLanes);
          if (root2 === workInProgressRoot) {
            workInProgressRoot = null;
            workInProgress = null;
            workInProgressRootRenderLanes = NoLanes;
          }
          if ((finishedWork.subtreeFlags & PassiveMask) !== NoFlags || (finishedWork.flags & PassiveMask) !== NoFlags) {
            if (!rootDoesHavePassiveEffects) {
              rootDoesHavePassiveEffects = true;
              pendingPassiveTransitions = transitions;
              scheduleCallback$1(NormalPriority, function() {
                flushPassiveEffects();
                return null;
              });
            }
          }
          const subtreeHasEffects = (finishedWork.subtreeFlags & (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;
          const rootHasEffect = (finishedWork.flags & (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;
          if (subtreeHasEffects || rootHasEffect) {
            const prevTransition = ReactCurrentBatchConfig$3.transition;
            ReactCurrentBatchConfig$3.transition = null;
            const previousPriority = getCurrentUpdatePriority();
            setCurrentUpdatePriority(DiscreteEventPriority);
            const prevExecutionContext = executionContext;
            executionContext |= CommitContext;
            ReactCurrentOwner$2.current = null;
            const shouldFireAfterActiveInstanceBlur2 = commitBeforeMutationEffects(root2, finishedWork);
            {
              recordCommitTime();
            }
            commitMutationEffects(root2, finishedWork, lanes);
            resetAfterCommit(root2.containerInfo);
            root2.current = finishedWork;
            {
              markLayoutEffectsStarted(lanes);
            }
            commitLayoutEffects(finishedWork, root2, lanes);
            {
              markLayoutEffectsStopped();
            }
            requestPaint();
            executionContext = prevExecutionContext;
            setCurrentUpdatePriority(previousPriority);
            ReactCurrentBatchConfig$3.transition = prevTransition;
          } else {
            root2.current = finishedWork;
            {
              recordCommitTime();
            }
          }
          const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
          if (rootDoesHavePassiveEffects) {
            rootDoesHavePassiveEffects = false;
            rootWithPendingPassiveEffects = root2;
            pendingPassiveEffectsLanes = lanes;
          } else {
            {
              nestedPassiveUpdateCount = 0;
              rootWithPassiveNestedUpdates = null;
            }
          }
          remainingLanes = root2.pendingLanes;
          if (remainingLanes === NoLanes) {
            legacyErrorBoundariesThatAlreadyFailed = null;
          }
          {
            if (!rootDidHavePassiveEffects) {
              commitDoubleInvokeEffectsInDEV(root2.current, false);
            }
          }
          onCommitRoot(finishedWork.stateNode, renderPriorityLevel);
          {
            if (isDevToolsPresent) {
              root2.memoizedUpdaters.clear();
            }
          }
          {
            onCommitRoot$1();
          }
          ensureRootIsScheduled(root2, now());
          if (recoverableErrors !== null) {
            const onRecoverableError = root2.onRecoverableError;
            for (let i = 0; i < recoverableErrors.length; i++) {
              const recoverableError = recoverableErrors[i];
              const componentStack = recoverableError.stack;
              const digest = recoverableError.digest;
              onRecoverableError(recoverableError.value, {
                componentStack,
                digest
              });
            }
          }
          if (hasUncaughtError) {
            hasUncaughtError = false;
            const error$1 = firstUncaughtError;
            firstUncaughtError = null;
            throw error$1;
          }
          if (includesSomeLane(pendingPassiveEffectsLanes, SyncLane) && root2.tag !== LegacyRoot) {
            flushPassiveEffects();
          }
          remainingLanes = root2.pendingLanes;
          if (includesSomeLane(remainingLanes, SyncLane)) {
            {
              markNestedUpdateScheduled();
            }
            if (root2 === rootWithNestedUpdates) {
              nestedUpdateCount++;
            } else {
              nestedUpdateCount = 0;
              rootWithNestedUpdates = root2;
            }
          } else {
            nestedUpdateCount = 0;
          }
          flushSyncCallbacks();
          {
            markCommitStopped();
          }
          return null;
        }
        function flushPassiveEffects() {
          if (rootWithPendingPassiveEffects !== null) {
            const renderPriority = lanesToEventPriority(pendingPassiveEffectsLanes);
            const priority = lowerEventPriority(DefaultEventPriority, renderPriority);
            const prevTransition = ReactCurrentBatchConfig$3.transition;
            const previousPriority = getCurrentUpdatePriority();
            try {
              ReactCurrentBatchConfig$3.transition = null;
              setCurrentUpdatePriority(priority);
              return flushPassiveEffectsImpl();
            } finally {
              setCurrentUpdatePriority(previousPriority);
              ReactCurrentBatchConfig$3.transition = prevTransition;
            }
          }
          return false;
        }
        function enqueuePendingPassiveProfilerEffect(fiber) {
          {
            pendingPassiveProfilerEffects.push(fiber);
            if (!rootDoesHavePassiveEffects) {
              rootDoesHavePassiveEffects = true;
              scheduleCallback$1(NormalPriority, function() {
                flushPassiveEffects();
                return null;
              });
            }
          }
        }
        function flushPassiveEffectsImpl() {
          if (rootWithPendingPassiveEffects === null) {
            return false;
          }
          const transitions = pendingPassiveTransitions;
          pendingPassiveTransitions = null;
          const root2 = rootWithPendingPassiveEffects;
          const lanes = pendingPassiveEffectsLanes;
          rootWithPendingPassiveEffects = null;
          pendingPassiveEffectsLanes = NoLanes;
          if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
            throw new Error("Cannot flush passive effects while already rendering.");
          }
          {
            isFlushingPassiveEffects = true;
            didScheduleUpdateDuringPassiveEffects = false;
          }
          {
            markPassiveEffectsStarted(lanes);
          }
          const prevExecutionContext = executionContext;
          executionContext |= CommitContext;
          commitPassiveUnmountEffects(root2.current);
          commitPassiveMountEffects(root2, root2.current, lanes, transitions);
          {
            const profilerEffects = pendingPassiveProfilerEffects;
            pendingPassiveProfilerEffects = [];
            for (let i = 0; i < profilerEffects.length; i++) {
              const _fiber = profilerEffects[i];
              commitPassiveEffectDurations(root2, _fiber);
            }
          }
          {
            markPassiveEffectsStopped();
          }
          {
            commitDoubleInvokeEffectsInDEV(root2.current, true);
          }
          executionContext = prevExecutionContext;
          flushSyncCallbacks();
          {
            if (didScheduleUpdateDuringPassiveEffects) {
              if (root2 === rootWithPassiveNestedUpdates) {
                nestedPassiveUpdateCount++;
              } else {
                nestedPassiveUpdateCount = 0;
                rootWithPassiveNestedUpdates = root2;
              }
            } else {
              nestedPassiveUpdateCount = 0;
            }
            isFlushingPassiveEffects = false;
            didScheduleUpdateDuringPassiveEffects = false;
          }
          onPostCommitRoot(root2);
          {
            const stateNode = root2.current.stateNode;
            stateNode.effectDuration = 0;
            stateNode.passiveEffectDuration = 0;
          }
          return true;
        }
        function isAlreadyFailedLegacyErrorBoundary(instance) {
          return legacyErrorBoundariesThatAlreadyFailed !== null && legacyErrorBoundariesThatAlreadyFailed.has(instance);
        }
        function markLegacyErrorBoundaryAsFailed(instance) {
          if (legacyErrorBoundariesThatAlreadyFailed === null) {
            legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([instance]);
          } else {
            legacyErrorBoundariesThatAlreadyFailed.add(instance);
          }
        }
        function prepareToThrowUncaughtError(error2) {
          if (!hasUncaughtError) {
            hasUncaughtError = true;
            firstUncaughtError = error2;
          }
        }
        var onUncaughtError = prepareToThrowUncaughtError;
        function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error2) {
          const errorInfo = createCapturedValueAtFiber(error2, sourceFiber);
          const update = createRootErrorUpdate(rootFiber, errorInfo, SyncLane);
          const root2 = enqueueUpdate(rootFiber, update, SyncLane);
          const eventTime = requestEventTime();
          if (root2 !== null) {
            markRootUpdated(root2, SyncLane, eventTime);
            ensureRootIsScheduled(root2, eventTime);
          }
        }
        function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error$1) {
          {
            reportUncaughtErrorInDEV(error$1);
            setIsRunningInsertionEffect(false);
          }
          if (sourceFiber.tag === HostRoot) {
            captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error$1);
            return;
          }
          let fiber = null;
          {
            fiber = nearestMountedAncestor;
          }
          while (fiber !== null) {
            if (fiber.tag === HostRoot) {
              captureCommitPhaseErrorOnRoot(fiber, sourceFiber, error$1);
              return;
            } else if (fiber.tag === ClassComponent) {
              const ctor = fiber.type;
              const instance = fiber.stateNode;
              if (typeof ctor.getDerivedStateFromError === "function" || typeof instance.componentDidCatch === "function" && !isAlreadyFailedLegacyErrorBoundary(instance)) {
                const errorInfo = createCapturedValueAtFiber(error$1, sourceFiber);
                const update = createClassErrorUpdate(fiber, errorInfo, SyncLane);
                const root2 = enqueueUpdate(fiber, update, SyncLane);
                const eventTime = requestEventTime();
                if (root2 !== null) {
                  markRootUpdated(root2, SyncLane, eventTime);
                  ensureRootIsScheduled(root2, eventTime);
                }
                return;
              }
            }
            fiber = fiber.return;
          }
          {
            error("Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Likely causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.\n\nError message:\n\n%s", error$1);
          }
        }
        function pingSuspendedRoot(root2, wakeable, pingedLanes) {
          const pingCache = root2.pingCache;
          if (pingCache !== null) {
            pingCache.delete(wakeable);
          }
          const eventTime = requestEventTime();
          markRootPinged(root2, pingedLanes);
          warnIfSuspenseResolutionNotWrappedWithActDEV(root2);
          if (workInProgressRoot === root2 && isSubsetOfLanes(workInProgressRootRenderLanes, pingedLanes)) {
            if (workInProgressRootExitStatus === RootSuspendedWithDelay || workInProgressRootExitStatus === RootSuspended && includesOnlyRetries(workInProgressRootRenderLanes) && now() - globalMostRecentFallbackTime < FALLBACK_THROTTLE_MS) {
              prepareFreshStack(root2, NoLanes);
            } else {
              workInProgressRootPingedLanes = mergeLanes(workInProgressRootPingedLanes, pingedLanes);
            }
          }
          ensureRootIsScheduled(root2, eventTime);
        }
        function retryTimedOutBoundary(boundaryFiber, retryLane) {
          if (retryLane === NoLane) {
            retryLane = requestRetryLane(boundaryFiber);
          }
          const eventTime = requestEventTime();
          const root2 = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
          if (root2 !== null) {
            markRootUpdated(root2, retryLane, eventTime);
            ensureRootIsScheduled(root2, eventTime);
          }
        }
        function retryDehydratedSuspenseBoundary(boundaryFiber) {
          const suspenseState = boundaryFiber.memoizedState;
          let retryLane = NoLane;
          if (suspenseState !== null) {
            retryLane = suspenseState.retryLane;
          }
          retryTimedOutBoundary(boundaryFiber, retryLane);
        }
        function resolveRetryWakeable(boundaryFiber, wakeable) {
          let retryLane = NoLane;
          let retryCache;
          switch (boundaryFiber.tag) {
            case SuspenseComponent:
              retryCache = boundaryFiber.stateNode;
              var suspenseState = boundaryFiber.memoizedState;
              if (suspenseState !== null) {
                retryLane = suspenseState.retryLane;
              }
              break;
            case SuspenseListComponent:
              retryCache = boundaryFiber.stateNode;
              break;
            default:
              throw new Error("Pinged unknown suspense boundary type. This is probably a bug in React.");
          }
          if (retryCache !== null) {
            retryCache.delete(wakeable);
          }
          retryTimedOutBoundary(boundaryFiber, retryLane);
        }
        function jnd(timeElapsed) {
          return timeElapsed < 120 ? 120 : timeElapsed < 480 ? 480 : timeElapsed < 1080 ? 1080 : timeElapsed < 1920 ? 1920 : timeElapsed < 3e3 ? 3e3 : timeElapsed < 4320 ? 4320 : ceil(timeElapsed / 1960) * 1960;
        }
        function checkForNestedUpdates() {
          if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
            nestedUpdateCount = 0;
            rootWithNestedUpdates = null;
            throw new Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
          }
          {
            if (nestedPassiveUpdateCount > NESTED_PASSIVE_UPDATE_LIMIT) {
              nestedPassiveUpdateCount = 0;
              rootWithPassiveNestedUpdates = null;
              error("Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.");
            }
          }
        }
        function flushRenderPhaseStrictModeWarningsInDEV() {
          {
            ReactStrictModeWarnings.flushLegacyContextWarning();
            {
              ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings();
            }
          }
        }
        function commitDoubleInvokeEffectsInDEV(fiber, hasPassiveEffects) {
          {
            setCurrentFiber(fiber);
            invokeEffectsInDev(fiber, MountLayoutDev, invokeLayoutEffectUnmountInDEV);
            if (hasPassiveEffects) {
              invokeEffectsInDev(fiber, MountPassiveDev, invokePassiveEffectUnmountInDEV);
            }
            invokeEffectsInDev(fiber, MountLayoutDev, invokeLayoutEffectMountInDEV);
            if (hasPassiveEffects) {
              invokeEffectsInDev(fiber, MountPassiveDev, invokePassiveEffectMountInDEV);
            }
            resetCurrentFiber();
          }
        }
        function invokeEffectsInDev(firstChild, fiberFlags, invokeEffectFn) {
          {
            let current2 = firstChild;
            let subtreeRoot = null;
            while (current2 !== null) {
              const primarySubtreeFlag = current2.subtreeFlags & fiberFlags;
              if (current2 !== subtreeRoot && current2.child !== null && primarySubtreeFlag !== NoFlags) {
                current2 = current2.child;
              } else {
                if ((current2.flags & fiberFlags) !== NoFlags) {
                  invokeEffectFn(current2);
                }
                if (current2.sibling !== null) {
                  current2 = current2.sibling;
                } else {
                  current2 = subtreeRoot = current2.return;
                }
              }
            }
          }
        }
        let didWarnStateUpdateForNotYetMountedComponent = null;
        function warnAboutUpdateOnNotYetMountedFiberInDEV(fiber) {
          {
            if ((executionContext & RenderContext) !== NoContext) {
              return;
            }
            if (!(fiber.mode & ConcurrentMode)) {
              return;
            }
            const tag = fiber.tag;
            if (tag !== IndeterminateComponent && tag !== HostRoot && tag !== ClassComponent && tag !== FunctionComponent && tag !== ForwardRef && tag !== MemoComponent && tag !== SimpleMemoComponent) {
              return;
            }
            const componentName = getComponentNameFromFiber(fiber) || "ReactComponent";
            if (didWarnStateUpdateForNotYetMountedComponent !== null) {
              if (didWarnStateUpdateForNotYetMountedComponent.has(componentName)) {
                return;
              }
              didWarnStateUpdateForNotYetMountedComponent.add(componentName);
            } else {
              didWarnStateUpdateForNotYetMountedComponent = /* @__PURE__ */ new Set([componentName]);
            }
            const previousFiber = current;
            try {
              setCurrentFiber(fiber);
              error("Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously later calls tries to update the component. Move this work to useEffect instead.");
            } finally {
              if (previousFiber) {
                setCurrentFiber(fiber);
              } else {
                resetCurrentFiber();
              }
            }
          }
        }
        let beginWork$1;
        {
          const dummyFiber = null;
          beginWork$1 = function(current2, unitOfWork, lanes) {
            const originalWorkInProgressCopy = assignFiberPropertiesInDEV(dummyFiber, unitOfWork);
            try {
              return beginWork(current2, unitOfWork, lanes);
            } catch (originalError) {
              if (didSuspendOrErrorWhileHydratingDEV() || originalError !== null && typeof originalError === "object" && typeof originalError.then === "function") {
                throw originalError;
              }
              resetContextDependencies();
              resetHooksAfterThrow();
              unwindInterruptedWork(current2, unitOfWork);
              assignFiberPropertiesInDEV(unitOfWork, originalWorkInProgressCopy);
              if (unitOfWork.mode & ProfileMode) {
                startProfilerTimer(unitOfWork);
              }
              invokeGuardedCallback(null, beginWork, null, current2, unitOfWork, lanes);
              if (hasCaughtError()) {
                const replayError = clearCaughtError();
                if (typeof replayError === "object" && replayError !== null && replayError._suppressLogging && typeof originalError === "object" && originalError !== null && !originalError._suppressLogging) {
                  originalError._suppressLogging = true;
                }
              }
              throw originalError;
            }
          };
        }
        let didWarnAboutUpdateInRender = false;
        let didWarnAboutUpdateInRenderForAnotherComponent;
        {
          didWarnAboutUpdateInRenderForAnotherComponent = /* @__PURE__ */ new Set();
        }
        function warnAboutRenderPhaseUpdatesInDEV(fiber) {
          {
            if (isRendering && !getIsUpdatingOpaqueValueInRenderPhaseInDEV()) {
              switch (fiber.tag) {
                case FunctionComponent:
                case ForwardRef:
                case SimpleMemoComponent: {
                  const renderingComponentName = workInProgress && getComponentNameFromFiber(workInProgress) || "Unknown";
                  const dedupeKey = renderingComponentName;
                  if (!didWarnAboutUpdateInRenderForAnotherComponent.has(dedupeKey)) {
                    didWarnAboutUpdateInRenderForAnotherComponent.add(dedupeKey);
                    const setStateComponentName = getComponentNameFromFiber(fiber) || "Unknown";
                    error("Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render", setStateComponentName, renderingComponentName, renderingComponentName);
                  }
                  break;
                }
                case ClassComponent: {
                  if (!didWarnAboutUpdateInRender) {
                    error("Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.");
                    didWarnAboutUpdateInRender = true;
                  }
                  break;
                }
              }
            }
          }
        }
        function restorePendingUpdaters(root2, lanes) {
          {
            if (isDevToolsPresent) {
              const memoizedUpdaters = root2.memoizedUpdaters;
              memoizedUpdaters.forEach(function(schedulingFiber) {
                addFiberToLanesMap(root2, schedulingFiber, lanes);
              });
            }
          }
        }
        var fakeActCallbackNode = {};
        function scheduleCallback$1(priorityLevel, callback) {
          {
            const actQueue = ReactCurrentActQueue$1.current;
            if (actQueue !== null) {
              actQueue.push(callback);
              return fakeActCallbackNode;
            } else {
              return scheduleCallback(priorityLevel, callback);
            }
          }
        }
        function cancelCallback$1(callbackNode) {
          if (callbackNode === fakeActCallbackNode) {
            return;
          }
          return cancelCallback(callbackNode);
        }
        function shouldForceFlushFallbacksInDEV() {
          return ReactCurrentActQueue$1.current !== null;
        }
        function warnIfUpdatesNotWrappedWithActDEV(fiber) {
          {
            if (fiber.mode & ConcurrentMode) {
              if (!isConcurrentActEnvironment()) {
                return;
              }
            } else {
              if (!isLegacyActEnvironment()) {
                return;
              }
              if (executionContext !== NoContext) {
                return;
              }
              if (fiber.tag !== FunctionComponent && fiber.tag !== ForwardRef && fiber.tag !== SimpleMemoComponent) {
                return;
              }
            }
            if (ReactCurrentActQueue$1.current === null) {
              const previousFiber = current;
              try {
                setCurrentFiber(fiber);
                error("An update to %s inside a test was not wrapped in act(...).\n\nWhen testing, code that causes React state updates should be wrapped into act(...):\n\nact(() => {\n  /* fire events that update state */\n});\n/* assert on the output */\n\nThis ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act", getComponentNameFromFiber(fiber));
              } finally {
                if (previousFiber) {
                  setCurrentFiber(fiber);
                } else {
                  resetCurrentFiber();
                }
              }
            }
          }
        }
        function warnIfSuspenseResolutionNotWrappedWithActDEV(root2) {
          {
            if (root2.tag !== LegacyRoot && isConcurrentActEnvironment() && ReactCurrentActQueue$1.current === null) {
              error("A suspended resource finished loading inside a test, but the event was not wrapped in act(...).\n\nWhen testing, code that resolves suspended data should be wrapped into act(...):\n\nact(() => {\n  /* finish loading suspended data */\n});\n/* assert on the output */\n\nThis ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act");
            }
          }
        }
        function setIsRunningInsertionEffect(isRunning) {
          {
            isRunningInsertionEffect = isRunning;
          }
        }
        let resolveFamily = null;
        let failedBoundaries = null;
        const setRefreshHandler = function(handler) {
          {
            resolveFamily = handler;
          }
        };
        function resolveFunctionForHotReloading(type) {
          {
            if (resolveFamily === null) {
              return type;
            }
            const family = resolveFamily(type);
            if (family === void 0) {
              return type;
            }
            return family.current;
          }
        }
        function resolveClassForHotReloading(type) {
          return resolveFunctionForHotReloading(type);
        }
        function resolveForwardRefForHotReloading(type) {
          {
            if (resolveFamily === null) {
              return type;
            }
            const family = resolveFamily(type);
            if (family === void 0) {
              if (type !== null && type !== void 0 && typeof type.render === "function") {
                const currentRender = resolveFunctionForHotReloading(type.render);
                if (type.render !== currentRender) {
                  const syntheticType = {
                    $$typeof: REACT_FORWARD_REF_TYPE,
                    render: currentRender
                  };
                  if (type.displayName !== void 0) {
                    syntheticType.displayName = type.displayName;
                  }
                  return syntheticType;
                }
              }
              return type;
            }
            return family.current;
          }
        }
        function isCompatibleFamilyForHotReloading(fiber, element) {
          {
            if (resolveFamily === null) {
              return false;
            }
            const prevType = fiber.elementType;
            const nextType = element.type;
            let needsCompareFamilies = false;
            const $$typeofNextType = typeof nextType === "object" && nextType !== null ? nextType.$$typeof : null;
            switch (fiber.tag) {
              case ClassComponent: {
                if (typeof nextType === "function") {
                  needsCompareFamilies = true;
                }
                break;
              }
              case FunctionComponent: {
                if (typeof nextType === "function") {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }
                break;
              }
              case ForwardRef: {
                if ($$typeofNextType === REACT_FORWARD_REF_TYPE) {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }
                break;
              }
              case MemoComponent:
              case SimpleMemoComponent: {
                if ($$typeofNextType === REACT_MEMO_TYPE) {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }
                break;
              }
              default:
                return false;
            }
            if (needsCompareFamilies) {
              const prevFamily = resolveFamily(prevType);
              if (prevFamily !== void 0 && prevFamily === resolveFamily(nextType)) {
                return true;
              }
            }
            return false;
          }
        }
        function markFailedErrorBoundaryForHotReloading(fiber) {
          {
            if (resolveFamily === null) {
              return;
            }
            if (typeof WeakSet !== "function") {
              return;
            }
            if (failedBoundaries === null) {
              failedBoundaries = /* @__PURE__ */ new WeakSet();
            }
            failedBoundaries.add(fiber);
          }
        }
        const scheduleRefresh = function(root2, update) {
          {
            if (resolveFamily === null) {
              return;
            }
            const staleFamilies = update.staleFamilies, updatedFamilies = update.updatedFamilies;
            flushPassiveEffects();
            flushSync(function() {
              scheduleFibersWithFamiliesRecursively(root2.current, updatedFamilies, staleFamilies);
            });
          }
        };
        const scheduleRoot = function(root2, element) {
          {
            if (root2.context !== emptyContextObject) {
              return;
            }
            flushPassiveEffects();
            flushSync(function() {
              updateContainer(element, root2, null, null);
            });
          }
        };
        function scheduleFibersWithFamiliesRecursively(fiber, updatedFamilies, staleFamilies) {
          {
            const alternate = fiber.alternate, child = fiber.child, sibling = fiber.sibling, tag = fiber.tag, type = fiber.type;
            let candidateType = null;
            switch (tag) {
              case FunctionComponent:
              case SimpleMemoComponent:
              case ClassComponent:
                candidateType = type;
                break;
              case ForwardRef:
                candidateType = type.render;
                break;
            }
            if (resolveFamily === null) {
              throw new Error("Expected resolveFamily to be set during hot reload.");
            }
            let needsRender = false;
            let needsRemount = false;
            if (candidateType !== null) {
              const family = resolveFamily(candidateType);
              if (family !== void 0) {
                if (staleFamilies.has(family)) {
                  needsRemount = true;
                } else if (updatedFamilies.has(family)) {
                  if (tag === ClassComponent) {
                    needsRemount = true;
                  } else {
                    needsRender = true;
                  }
                }
              }
            }
            if (failedBoundaries !== null) {
              if (failedBoundaries.has(fiber) || alternate !== null && failedBoundaries.has(alternate)) {
                needsRemount = true;
              }
            }
            if (needsRemount) {
              fiber._debugNeedsRemount = true;
            }
            if (needsRemount || needsRender) {
              const _root = enqueueConcurrentRenderForLane(fiber, SyncLane);
              if (_root !== null) {
                scheduleUpdateOnFiber(_root, fiber, SyncLane, NoTimestamp);
              }
            }
            if (child !== null && !needsRemount) {
              scheduleFibersWithFamiliesRecursively(child, updatedFamilies, staleFamilies);
            }
            if (sibling !== null) {
              scheduleFibersWithFamiliesRecursively(sibling, updatedFamilies, staleFamilies);
            }
          }
        }
        const findHostInstancesForRefresh = function(root2, families) {
          {
            const hostInstances = /* @__PURE__ */ new Set();
            const types = new Set(families.map(function(family) {
              return family.current;
            }));
            findHostInstancesForMatchingFibersRecursively(root2.current, types, hostInstances);
            return hostInstances;
          }
        };
        function findHostInstancesForMatchingFibersRecursively(fiber, types, hostInstances) {
          {
            const child = fiber.child, sibling = fiber.sibling, tag = fiber.tag, type = fiber.type;
            let candidateType = null;
            switch (tag) {
              case FunctionComponent:
              case SimpleMemoComponent:
              case ClassComponent:
                candidateType = type;
                break;
              case ForwardRef:
                candidateType = type.render;
                break;
            }
            let didMatch = false;
            if (candidateType !== null) {
              if (types.has(candidateType)) {
                didMatch = true;
              }
            }
            if (didMatch) {
              findHostInstancesForFiberShallowly(fiber, hostInstances);
            } else {
              if (child !== null) {
                findHostInstancesForMatchingFibersRecursively(child, types, hostInstances);
              }
            }
            if (sibling !== null) {
              findHostInstancesForMatchingFibersRecursively(sibling, types, hostInstances);
            }
          }
        }
        function findHostInstancesForFiberShallowly(fiber, hostInstances) {
          {
            const foundHostInstances = findChildHostInstancesForFiberShallowly(fiber, hostInstances);
            if (foundHostInstances) {
              return;
            }
            let node = fiber;
            while (true) {
              switch (node.tag) {
                case HostComponent:
                  hostInstances.add(node.stateNode);
                  return;
                case HostPortal:
                  hostInstances.add(node.stateNode.containerInfo);
                  return;
                case HostRoot:
                  hostInstances.add(node.stateNode.containerInfo);
                  return;
              }
              if (node.return === null) {
                throw new Error("Expected to reach root first.");
              }
              node = node.return;
            }
          }
        }
        function findChildHostInstancesForFiberShallowly(fiber, hostInstances) {
          {
            let node = fiber;
            let foundHostInstances = false;
            while (true) {
              if (node.tag === HostComponent) {
                foundHostInstances = true;
                hostInstances.add(node.stateNode);
              } else if (node.child !== null) {
                node.child.return = node;
                node = node.child;
                continue;
              }
              if (node === fiber) {
                return foundHostInstances;
              }
              while (node.sibling === null) {
                if (node.return === null || node.return === fiber) {
                  return foundHostInstances;
                }
                node = node.return;
              }
              node.sibling.return = node.return;
              node = node.sibling;
            }
          }
          return false;
        }
        let hasBadMapPolyfill;
        {
          hasBadMapPolyfill = false;
          try {
            const nonExtensibleObject = Object.preventExtensions({});
            /* @__PURE__ */ new Map([[nonExtensibleObject, null]]);
            /* @__PURE__ */ new Set([nonExtensibleObject]);
          } catch (e) {
            hasBadMapPolyfill = true;
          }
        }
        function FiberNode(tag, pendingProps, key, mode) {
          this.tag = tag;
          this.key = key;
          this.elementType = null;
          this.type = null;
          this.stateNode = null;
          this.return = null;
          this.child = null;
          this.sibling = null;
          this.index = 0;
          this.ref = null;
          this.pendingProps = pendingProps;
          this.memoizedProps = null;
          this.updateQueue = null;
          this.memoizedState = null;
          this.dependencies = null;
          this.mode = mode;
          this.flags = NoFlags;
          this.subtreeFlags = NoFlags;
          this.deletions = null;
          this.lanes = NoLanes;
          this.childLanes = NoLanes;
          this.alternate = null;
          {
            this.actualDuration = Number.NaN;
            this.actualStartTime = Number.NaN;
            this.selfBaseDuration = Number.NaN;
            this.treeBaseDuration = Number.NaN;
            this.actualDuration = 0;
            this.actualStartTime = -1;
            this.selfBaseDuration = 0;
            this.treeBaseDuration = 0;
          }
          {
            this._debugSource = null;
            this._debugOwner = null;
            this._debugNeedsRemount = false;
            this._debugHookTypes = null;
            if (!hasBadMapPolyfill && typeof Object.preventExtensions === "function") {
              Object.preventExtensions(this);
            }
          }
        }
        const createFiber = function(tag, pendingProps, key, mode) {
          return new FiberNode(tag, pendingProps, key, mode);
        };
        function shouldConstruct$1(Component) {
          const prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function isSimpleFunctionComponent(type) {
          return typeof type === "function" && !shouldConstruct$1(type) && type.defaultProps === void 0;
        }
        function resolveLazyComponentTag(Component) {
          if (typeof Component === "function") {
            return shouldConstruct$1(Component) ? ClassComponent : FunctionComponent;
          } else if (Component !== void 0 && Component !== null) {
            const $$typeof = Component.$$typeof;
            if ($$typeof === REACT_FORWARD_REF_TYPE) {
              return ForwardRef;
            }
            if ($$typeof === REACT_MEMO_TYPE) {
              return MemoComponent;
            }
          }
          return IndeterminateComponent;
        }
        function createWorkInProgress(current2, pendingProps) {
          let workInProgress2 = current2.alternate;
          if (workInProgress2 === null) {
            workInProgress2 = createFiber(current2.tag, pendingProps, current2.key, current2.mode);
            workInProgress2.elementType = current2.elementType;
            workInProgress2.type = current2.type;
            workInProgress2.stateNode = current2.stateNode;
            {
              workInProgress2._debugSource = current2._debugSource;
              workInProgress2._debugOwner = current2._debugOwner;
              workInProgress2._debugHookTypes = current2._debugHookTypes;
            }
            workInProgress2.alternate = current2;
            current2.alternate = workInProgress2;
          } else {
            workInProgress2.pendingProps = pendingProps;
            workInProgress2.type = current2.type;
            workInProgress2.flags = NoFlags;
            workInProgress2.subtreeFlags = NoFlags;
            workInProgress2.deletions = null;
            {
              workInProgress2.actualDuration = 0;
              workInProgress2.actualStartTime = -1;
            }
          }
          workInProgress2.flags = current2.flags & StaticMask;
          workInProgress2.childLanes = current2.childLanes;
          workInProgress2.lanes = current2.lanes;
          workInProgress2.child = current2.child;
          workInProgress2.memoizedProps = current2.memoizedProps;
          workInProgress2.memoizedState = current2.memoizedState;
          workInProgress2.updateQueue = current2.updateQueue;
          const currentDependencies = current2.dependencies;
          workInProgress2.dependencies = currentDependencies === null ? null : {
            lanes: currentDependencies.lanes,
            firstContext: currentDependencies.firstContext
          };
          workInProgress2.sibling = current2.sibling;
          workInProgress2.index = current2.index;
          workInProgress2.ref = current2.ref;
          {
            workInProgress2.selfBaseDuration = current2.selfBaseDuration;
            workInProgress2.treeBaseDuration = current2.treeBaseDuration;
          }
          {
            workInProgress2._debugNeedsRemount = current2._debugNeedsRemount;
            switch (workInProgress2.tag) {
              case IndeterminateComponent:
              case FunctionComponent:
              case SimpleMemoComponent:
                workInProgress2.type = resolveFunctionForHotReloading(current2.type);
                break;
              case ClassComponent:
                workInProgress2.type = resolveClassForHotReloading(current2.type);
                break;
              case ForwardRef:
                workInProgress2.type = resolveForwardRefForHotReloading(current2.type);
                break;
            }
          }
          return workInProgress2;
        }
        function resetWorkInProgress(workInProgress2, renderLanes2) {
          workInProgress2.flags &= StaticMask | Placement;
          const current2 = workInProgress2.alternate;
          if (current2 === null) {
            workInProgress2.childLanes = NoLanes;
            workInProgress2.lanes = renderLanes2;
            workInProgress2.child = null;
            workInProgress2.subtreeFlags = NoFlags;
            workInProgress2.memoizedProps = null;
            workInProgress2.memoizedState = null;
            workInProgress2.updateQueue = null;
            workInProgress2.dependencies = null;
            workInProgress2.stateNode = null;
            {
              workInProgress2.selfBaseDuration = 0;
              workInProgress2.treeBaseDuration = 0;
            }
          } else {
            workInProgress2.childLanes = current2.childLanes;
            workInProgress2.lanes = current2.lanes;
            workInProgress2.child = current2.child;
            workInProgress2.subtreeFlags = NoFlags;
            workInProgress2.deletions = null;
            workInProgress2.memoizedProps = current2.memoizedProps;
            workInProgress2.memoizedState = current2.memoizedState;
            workInProgress2.updateQueue = current2.updateQueue;
            workInProgress2.type = current2.type;
            const currentDependencies = current2.dependencies;
            workInProgress2.dependencies = currentDependencies === null ? null : {
              lanes: currentDependencies.lanes,
              firstContext: currentDependencies.firstContext
            };
            {
              workInProgress2.selfBaseDuration = current2.selfBaseDuration;
              workInProgress2.treeBaseDuration = current2.treeBaseDuration;
            }
          }
          return workInProgress2;
        }
        function createHostRootFiber(tag, isStrictMode, concurrentUpdatesByDefaultOverride) {
          let mode;
          if (tag === ConcurrentRoot) {
            mode = ConcurrentMode;
            if (isStrictMode === true) {
              mode |= StrictLegacyMode;
              {
                mode |= StrictEffectsMode;
              }
            }
          } else {
            mode = NoMode;
          }
          if (isDevToolsPresent) {
            mode |= ProfileMode;
          }
          return createFiber(HostRoot, null, null, mode);
        }
        function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
          let fiberTag = IndeterminateComponent;
          let resolvedType = type;
          if (typeof type === "function") {
            if (shouldConstruct$1(type)) {
              fiberTag = ClassComponent;
              {
                resolvedType = resolveClassForHotReloading(resolvedType);
              }
            } else {
              {
                resolvedType = resolveFunctionForHotReloading(resolvedType);
              }
            }
          } else if (typeof type === "string") {
            fiberTag = HostComponent;
          } else {
            getTag: switch (type) {
              case REACT_FRAGMENT_TYPE:
                return createFiberFromFragment(pendingProps.children, mode, lanes, key);
              case REACT_STRICT_MODE_TYPE:
                fiberTag = Mode;
                mode |= StrictLegacyMode;
                if ((mode & ConcurrentMode) !== NoMode) {
                  mode |= StrictEffectsMode;
                }
                break;
              case REACT_PROFILER_TYPE:
                return createFiberFromProfiler(pendingProps, mode, lanes, key);
              case REACT_SUSPENSE_TYPE:
                return createFiberFromSuspense(pendingProps, mode, lanes, key);
              case REACT_SUSPENSE_LIST_TYPE:
                return createFiberFromSuspenseList(pendingProps, mode, lanes, key);
              case REACT_OFFSCREEN_TYPE:
                return createFiberFromOffscreen(pendingProps, mode, lanes, key);
              case REACT_LEGACY_HIDDEN_TYPE:
              case REACT_SCOPE_TYPE:
              case REACT_CACHE_TYPE:
              case REACT_TRACING_MARKER_TYPE:
              case REACT_DEBUG_TRACING_MODE_TYPE:
              default: {
                if (typeof type === "object" && type !== null) {
                  switch (type.$$typeof) {
                    case REACT_PROVIDER_TYPE:
                      fiberTag = ContextProvider;
                      break getTag;
                    case REACT_CONTEXT_TYPE:
                      fiberTag = ContextConsumer;
                      break getTag;
                    case REACT_FORWARD_REF_TYPE:
                      fiberTag = ForwardRef;
                      {
                        resolvedType = resolveForwardRefForHotReloading(resolvedType);
                      }
                      break getTag;
                    case REACT_MEMO_TYPE:
                      fiberTag = MemoComponent;
                      break getTag;
                    case REACT_LAZY_TYPE:
                      fiberTag = LazyComponent;
                      resolvedType = null;
                      break getTag;
                  }
                }
                let info = "";
                {
                  if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
                    info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
                  }
                  const ownerName = owner ? getComponentNameFromFiber(owner) : null;
                  if (ownerName) {
                    info += "\n\nCheck the render method of `" + ownerName + "`.";
                  }
                }
                throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (type == null ? type : typeof type) + "." + info));
              }
            }
          }
          const fiber = createFiber(fiberTag, pendingProps, key, mode);
          fiber.elementType = type;
          fiber.type = resolvedType;
          fiber.lanes = lanes;
          {
            fiber._debugOwner = owner;
          }
          return fiber;
        }
        function createFiberFromElement(element, mode, lanes) {
          let owner = null;
          {
            owner = element._owner;
          }
          const type = element.type;
          const key = element.key;
          const pendingProps = element.props;
          const fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes);
          {
            fiber._debugSource = element._source;
            fiber._debugOwner = element._owner;
          }
          return fiber;
        }
        function createFiberFromFragment(elements, mode, lanes, key) {
          const fiber = createFiber(Fragment, elements, key, mode);
          fiber.lanes = lanes;
          return fiber;
        }
        function createFiberFromProfiler(pendingProps, mode, lanes, key) {
          {
            if (typeof pendingProps.id !== "string") {
              error('Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.', typeof pendingProps.id);
            }
          }
          const fiber = createFiber(Profiler, pendingProps, key, mode | ProfileMode);
          fiber.elementType = REACT_PROFILER_TYPE;
          fiber.lanes = lanes;
          {
            fiber.stateNode = {
              effectDuration: 0,
              passiveEffectDuration: 0
            };
          }
          return fiber;
        }
        function createFiberFromSuspense(pendingProps, mode, lanes, key) {
          const fiber = createFiber(SuspenseComponent, pendingProps, key, mode);
          fiber.elementType = REACT_SUSPENSE_TYPE;
          fiber.lanes = lanes;
          return fiber;
        }
        function createFiberFromSuspenseList(pendingProps, mode, lanes, key) {
          const fiber = createFiber(SuspenseListComponent, pendingProps, key, mode);
          fiber.elementType = REACT_SUSPENSE_LIST_TYPE;
          fiber.lanes = lanes;
          return fiber;
        }
        function createFiberFromOffscreen(pendingProps, mode, lanes, key) {
          const fiber = createFiber(OffscreenComponent, pendingProps, key, mode);
          fiber.elementType = REACT_OFFSCREEN_TYPE;
          fiber.lanes = lanes;
          const primaryChildInstance = {
            isHidden: false
          };
          fiber.stateNode = primaryChildInstance;
          return fiber;
        }
        function createFiberFromText(content, mode, lanes) {
          const fiber = createFiber(HostText, content, null, mode);
          fiber.lanes = lanes;
          return fiber;
        }
        function createFiberFromHostInstanceForDeletion() {
          const fiber = createFiber(HostComponent, null, null, NoMode);
          fiber.elementType = "DELETED";
          return fiber;
        }
        function createFiberFromDehydratedFragment(dehydratedNode) {
          const fiber = createFiber(DehydratedFragment, null, null, NoMode);
          fiber.stateNode = dehydratedNode;
          return fiber;
        }
        function createFiberFromPortal(portal, mode, lanes) {
          const pendingProps = portal.children !== null ? portal.children : [];
          const fiber = createFiber(HostPortal, pendingProps, portal.key, mode);
          fiber.lanes = lanes;
          fiber.stateNode = {
            containerInfo: portal.containerInfo,
            pendingChildren: null,
            // Used by persistent updates
            implementation: portal.implementation
          };
          return fiber;
        }
        function assignFiberPropertiesInDEV(target, source) {
          if (target === null) {
            target = createFiber(IndeterminateComponent, null, null, NoMode);
          }
          target.tag = source.tag;
          target.key = source.key;
          target.elementType = source.elementType;
          target.type = source.type;
          target.stateNode = source.stateNode;
          target.return = source.return;
          target.child = source.child;
          target.sibling = source.sibling;
          target.index = source.index;
          target.ref = source.ref;
          target.pendingProps = source.pendingProps;
          target.memoizedProps = source.memoizedProps;
          target.updateQueue = source.updateQueue;
          target.memoizedState = source.memoizedState;
          target.dependencies = source.dependencies;
          target.mode = source.mode;
          target.flags = source.flags;
          target.subtreeFlags = source.subtreeFlags;
          target.deletions = source.deletions;
          target.lanes = source.lanes;
          target.childLanes = source.childLanes;
          target.alternate = source.alternate;
          {
            target.actualDuration = source.actualDuration;
            target.actualStartTime = source.actualStartTime;
            target.selfBaseDuration = source.selfBaseDuration;
            target.treeBaseDuration = source.treeBaseDuration;
          }
          target._debugSource = source._debugSource;
          target._debugOwner = source._debugOwner;
          target._debugNeedsRemount = source._debugNeedsRemount;
          target._debugHookTypes = source._debugHookTypes;
          return target;
        }
        function FiberRootNode(containerInfo, tag, hydrate2, identifierPrefix, onRecoverableError) {
          this.tag = tag;
          this.containerInfo = containerInfo;
          this.pendingChildren = null;
          this.current = null;
          this.pingCache = null;
          this.finishedWork = null;
          this.timeoutHandle = noTimeout;
          this.context = null;
          this.pendingContext = null;
          this.callbackNode = null;
          this.callbackPriority = NoLane;
          this.eventTimes = createLaneMap(NoLanes);
          this.expirationTimes = createLaneMap(NoTimestamp);
          this.pendingLanes = NoLanes;
          this.suspendedLanes = NoLanes;
          this.pingedLanes = NoLanes;
          this.expiredLanes = NoLanes;
          this.mutableReadLanes = NoLanes;
          this.finishedLanes = NoLanes;
          this.entangledLanes = NoLanes;
          this.entanglements = createLaneMap(NoLanes);
          this.identifierPrefix = identifierPrefix;
          this.onRecoverableError = onRecoverableError;
          {
            this.mutableSourceEagerHydrationData = null;
          }
          {
            this.effectDuration = 0;
            this.passiveEffectDuration = 0;
          }
          {
            this.memoizedUpdaters = /* @__PURE__ */ new Set();
            const pendingUpdatersLaneMap = this.pendingUpdatersLaneMap = [];
            for (let _i = 0; _i < TotalLanes; _i++) {
              pendingUpdatersLaneMap.push(/* @__PURE__ */ new Set());
            }
          }
          {
            switch (tag) {
              case ConcurrentRoot:
                this._debugRootType = hydrate2 ? "hydrateRoot()" : "createRoot()";
                break;
              case LegacyRoot:
                this._debugRootType = hydrate2 ? "hydrate()" : "render()";
                break;
            }
          }
        }
        function createFiberRoot(containerInfo, tag, hydrate2, initialChildren, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError, transitionCallbacks) {
          const root2 = new FiberRootNode(containerInfo, tag, hydrate2, identifierPrefix, onRecoverableError);
          const uninitializedFiber = createHostRootFiber(tag, isStrictMode);
          root2.current = uninitializedFiber;
          uninitializedFiber.stateNode = root2;
          {
            const _initialState = {
              element: initialChildren,
              isDehydrated: hydrate2,
              cache: null,
              // not enabled yet
              transitions: null,
              pendingSuspenseBoundaries: null
            };
            uninitializedFiber.memoizedState = _initialState;
          }
          initializeUpdateQueue(uninitializedFiber);
          return root2;
        }
        const ReactVersion = "18.3.1";
        function createPortal(children, containerInfo, implementation) {
          const key = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
          {
            checkKeyStringCoercion(key);
          }
          return {
            // This tag allow us to uniquely identify this as a React Portal
            $$typeof: REACT_PORTAL_TYPE,
            key: key == null ? null : "" + key,
            children,
            containerInfo,
            implementation
          };
        }
        let didWarnAboutNestedUpdates;
        let didWarnAboutFindNodeInStrictMode;
        {
          didWarnAboutNestedUpdates = false;
          didWarnAboutFindNodeInStrictMode = {};
        }
        function getContextForSubtree(parentComponent) {
          if (!parentComponent) {
            return emptyContextObject;
          }
          const fiber = get(parentComponent);
          const parentContext = findCurrentUnmaskedContext(fiber);
          if (fiber.tag === ClassComponent) {
            const Component = fiber.type;
            if (isContextProvider(Component)) {
              return processChildContext(fiber, Component, parentContext);
            }
          }
          return parentContext;
        }
        function findHostInstanceWithWarning(component, methodName) {
          {
            const fiber = get(component);
            if (fiber === void 0) {
              if (typeof component.render === "function") {
                throw new Error("Unable to find node on an unmounted component.");
              } else {
                const keys = Object.keys(component).join(",");
                throw new Error("Argument appears to not be a ReactComponent. Keys: " + keys);
              }
            }
            const hostFiber = findCurrentHostFiber(fiber);
            if (hostFiber === null) {
              return null;
            }
            if (hostFiber.mode & StrictLegacyMode) {
              const componentName = getComponentNameFromFiber(fiber) || "Component";
              if (!didWarnAboutFindNodeInStrictMode[componentName]) {
                didWarnAboutFindNodeInStrictMode[componentName] = true;
                const previousFiber = current;
                try {
                  setCurrentFiber(hostFiber);
                  if (fiber.mode & StrictLegacyMode) {
                    error("%s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", methodName, methodName, componentName);
                  } else {
                    error("%s is deprecated in StrictMode. %s was passed an instance of %s which renders StrictMode children. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", methodName, methodName, componentName);
                  }
                } finally {
                  if (previousFiber) {
                    setCurrentFiber(previousFiber);
                  } else {
                    resetCurrentFiber();
                  }
                }
              }
            }
            return hostFiber.stateNode;
          }
        }
        function createContainer(containerInfo, tag, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError, transitionCallbacks) {
          const hydrate2 = false;
          const initialChildren = null;
          return createFiberRoot(containerInfo, tag, hydrate2, initialChildren, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError);
        }
        function createHydrationContainer(initialChildren, callback, containerInfo, tag, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError, transitionCallbacks) {
          const hydrate2 = true;
          const root2 = createFiberRoot(containerInfo, tag, hydrate2, initialChildren, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError);
          root2.context = getContextForSubtree(null);
          const current2 = root2.current;
          const eventTime = requestEventTime();
          const lane = requestUpdateLane(current2);
          const update = createUpdate(eventTime, lane);
          update.callback = callback !== void 0 && callback !== null ? callback : null;
          enqueueUpdate(current2, update, lane);
          scheduleInitialHydrationOnRoot(root2, lane, eventTime);
          return root2;
        }
        function updateContainer(element, container, parentComponent, callback) {
          {
            onScheduleRoot(container, element);
          }
          const current$1 = container.current;
          const eventTime = requestEventTime();
          const lane = requestUpdateLane(current$1);
          {
            markRenderScheduled(lane);
          }
          const context = getContextForSubtree(parentComponent);
          if (container.context === null) {
            container.context = context;
          } else {
            container.pendingContext = context;
          }
          {
            if (isRendering && current !== null && !didWarnAboutNestedUpdates) {
              didWarnAboutNestedUpdates = true;
              error("Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.\n\nCheck the render method of %s.", getComponentNameFromFiber(current) || "Unknown");
            }
          }
          const update = createUpdate(eventTime, lane);
          update.payload = {
            element
          };
          callback = callback === void 0 ? null : callback;
          if (callback !== null) {
            {
              if (typeof callback !== "function") {
                error("render(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callback);
              }
            }
            update.callback = callback;
          }
          const root2 = enqueueUpdate(current$1, update, lane);
          if (root2 !== null) {
            scheduleUpdateOnFiber(root2, current$1, lane, eventTime);
            entangleTransitions(root2, current$1, lane);
          }
          return lane;
        }
        function getPublicRootInstance(container) {
          const containerFiber = container.current;
          if (!containerFiber.child) {
            return null;
          }
          switch (containerFiber.child.tag) {
            case HostComponent:
              return getPublicInstance(containerFiber.child.stateNode);
            default:
              return containerFiber.child.stateNode;
          }
        }
        function attemptSynchronousHydration$1(fiber) {
          switch (fiber.tag) {
            case HostRoot: {
              const root2 = fiber.stateNode;
              if (isRootDehydrated(root2)) {
                const lanes = getHighestPriorityPendingLanes(root2);
                flushRoot(root2, lanes);
              }
              break;
            }
            case SuspenseComponent: {
              flushSync(function() {
                const root3 = enqueueConcurrentRenderForLane(fiber, SyncLane);
                if (root3 !== null) {
                  const eventTime = requestEventTime();
                  scheduleUpdateOnFiber(root3, fiber, SyncLane, eventTime);
                }
              });
              const retryLane = SyncLane;
              markRetryLaneIfNotHydrated(fiber, retryLane);
              break;
            }
          }
        }
        function markRetryLaneImpl(fiber, retryLane) {
          const suspenseState = fiber.memoizedState;
          if (suspenseState !== null && suspenseState.dehydrated !== null) {
            suspenseState.retryLane = higherPriorityLane(suspenseState.retryLane, retryLane);
          }
        }
        function markRetryLaneIfNotHydrated(fiber, retryLane) {
          markRetryLaneImpl(fiber, retryLane);
          const alternate = fiber.alternate;
          if (alternate) {
            markRetryLaneImpl(alternate, retryLane);
          }
        }
        function attemptContinuousHydration$1(fiber) {
          if (fiber.tag !== SuspenseComponent) {
            return;
          }
          const lane = SelectiveHydrationLane;
          const root2 = enqueueConcurrentRenderForLane(fiber, lane);
          if (root2 !== null) {
            const eventTime = requestEventTime();
            scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
          }
          markRetryLaneIfNotHydrated(fiber, lane);
        }
        function attemptHydrationAtCurrentPriority$1(fiber) {
          if (fiber.tag !== SuspenseComponent) {
            return;
          }
          const lane = requestUpdateLane(fiber);
          const root2 = enqueueConcurrentRenderForLane(fiber, lane);
          if (root2 !== null) {
            const eventTime = requestEventTime();
            scheduleUpdateOnFiber(root2, fiber, lane, eventTime);
          }
          markRetryLaneIfNotHydrated(fiber, lane);
        }
        function findHostInstanceWithNoPortals(fiber) {
          const hostFiber = findCurrentHostFiberWithNoPortals(fiber);
          if (hostFiber === null) {
            return null;
          }
          return hostFiber.stateNode;
        }
        let shouldErrorImpl = function(fiber) {
          return null;
        };
        function shouldError(fiber) {
          return shouldErrorImpl(fiber);
        }
        let shouldSuspendImpl = function(fiber) {
          return false;
        };
        function shouldSuspend(fiber) {
          return shouldSuspendImpl(fiber);
        }
        let overrideHookState = null;
        let overrideHookStateDeletePath = null;
        let overrideHookStateRenamePath = null;
        let overrideProps = null;
        let overridePropsDeletePath = null;
        let overridePropsRenamePath = null;
        let scheduleUpdate = null;
        let setErrorHandler = null;
        let setSuspenseHandler = null;
        {
          const copyWithDeleteImpl = function(obj, path, index2) {
            const key = path[index2];
            const updated = isArray(obj) ? obj.slice() : assign({}, obj);
            if (index2 + 1 === path.length) {
              if (isArray(updated)) {
                updated.splice(key, 1);
              } else {
                delete updated[key];
              }
              return updated;
            }
            updated[key] = copyWithDeleteImpl(obj[key], path, index2 + 1);
            return updated;
          };
          const copyWithDelete = function(obj, path) {
            return copyWithDeleteImpl(obj, path, 0);
          };
          const copyWithRenameImpl = function(obj, oldPath, newPath, index2) {
            const oldKey = oldPath[index2];
            const updated = isArray(obj) ? obj.slice() : assign({}, obj);
            if (index2 + 1 === oldPath.length) {
              const newKey = newPath[index2];
              updated[newKey] = updated[oldKey];
              if (isArray(updated)) {
                updated.splice(oldKey, 1);
              } else {
                delete updated[oldKey];
              }
            } else {
              updated[oldKey] = copyWithRenameImpl(
                // $FlowFixMe number or string is fine here
                obj[oldKey],
                oldPath,
                newPath,
                index2 + 1
              );
            }
            return updated;
          };
          const copyWithRename = function(obj, oldPath, newPath) {
            if (oldPath.length !== newPath.length) {
              warn("copyWithRename() expects paths of the same length");
              return;
            } else {
              for (let i = 0; i < newPath.length - 1; i++) {
                if (oldPath[i] !== newPath[i]) {
                  warn("copyWithRename() expects paths to be the same except for the deepest key");
                  return;
                }
              }
            }
            return copyWithRenameImpl(obj, oldPath, newPath, 0);
          };
          const copyWithSetImpl = function(obj, path, index2, value) {
            if (index2 >= path.length) {
              return value;
            }
            const key = path[index2];
            const updated = isArray(obj) ? obj.slice() : assign({}, obj);
            updated[key] = copyWithSetImpl(obj[key], path, index2 + 1, value);
            return updated;
          };
          const copyWithSet = function(obj, path, value) {
            return copyWithSetImpl(obj, path, 0, value);
          };
          const findHook = function(fiber, id) {
            let currentHook2 = fiber.memoizedState;
            while (currentHook2 !== null && id > 0) {
              currentHook2 = currentHook2.next;
              id--;
            }
            return currentHook2;
          };
          overrideHookState = function(fiber, id, path, value) {
            const hook = findHook(fiber, id);
            if (hook !== null) {
              const newState = copyWithSet(hook.memoizedState, path, value);
              hook.memoizedState = newState;
              hook.baseState = newState;
              fiber.memoizedProps = assign({}, fiber.memoizedProps);
              const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
              if (root2 !== null) {
                scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
              }
            }
          };
          overrideHookStateDeletePath = function(fiber, id, path) {
            const hook = findHook(fiber, id);
            if (hook !== null) {
              const newState = copyWithDelete(hook.memoizedState, path);
              hook.memoizedState = newState;
              hook.baseState = newState;
              fiber.memoizedProps = assign({}, fiber.memoizedProps);
              const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
              if (root2 !== null) {
                scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
              }
            }
          };
          overrideHookStateRenamePath = function(fiber, id, oldPath, newPath) {
            const hook = findHook(fiber, id);
            if (hook !== null) {
              const newState = copyWithRename(hook.memoizedState, oldPath, newPath);
              hook.memoizedState = newState;
              hook.baseState = newState;
              fiber.memoizedProps = assign({}, fiber.memoizedProps);
              const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
              if (root2 !== null) {
                scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
              }
            }
          };
          overrideProps = function(fiber, path, value) {
            fiber.pendingProps = copyWithSet(fiber.memoizedProps, path, value);
            if (fiber.alternate) {
              fiber.alternate.pendingProps = fiber.pendingProps;
            }
            const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
            }
          };
          overridePropsDeletePath = function(fiber, path) {
            fiber.pendingProps = copyWithDelete(fiber.memoizedProps, path);
            if (fiber.alternate) {
              fiber.alternate.pendingProps = fiber.pendingProps;
            }
            const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
            }
          };
          overridePropsRenamePath = function(fiber, oldPath, newPath) {
            fiber.pendingProps = copyWithRename(fiber.memoizedProps, oldPath, newPath);
            if (fiber.alternate) {
              fiber.alternate.pendingProps = fiber.pendingProps;
            }
            const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
            }
          };
          scheduleUpdate = function(fiber) {
            const root2 = enqueueConcurrentRenderForLane(fiber, SyncLane);
            if (root2 !== null) {
              scheduleUpdateOnFiber(root2, fiber, SyncLane, NoTimestamp);
            }
          };
          setErrorHandler = function(newShouldErrorImpl) {
            shouldErrorImpl = newShouldErrorImpl;
          };
          setSuspenseHandler = function(newShouldSuspendImpl) {
            shouldSuspendImpl = newShouldSuspendImpl;
          };
        }
        function findHostInstanceByFiber(fiber) {
          const hostFiber = findCurrentHostFiber(fiber);
          if (hostFiber === null) {
            return null;
          }
          return hostFiber.stateNode;
        }
        function emptyFindFiberByHostInstance(instance) {
          return null;
        }
        function getCurrentFiberForDevTools() {
          return current;
        }
        function injectIntoDevTools(devToolsConfig) {
          const findFiberByHostInstance = devToolsConfig.findFiberByHostInstance;
          const ReactCurrentDispatcher2 = ReactSharedInternals.ReactCurrentDispatcher;
          return injectInternals({
            bundleType: devToolsConfig.bundleType,
            version: devToolsConfig.version,
            rendererPackageName: devToolsConfig.rendererPackageName,
            rendererConfig: devToolsConfig.rendererConfig,
            overrideHookState,
            overrideHookStateDeletePath,
            overrideHookStateRenamePath,
            overrideProps,
            overridePropsDeletePath,
            overridePropsRenamePath,
            setErrorHandler,
            setSuspenseHandler,
            scheduleUpdate,
            currentDispatcherRef: ReactCurrentDispatcher2,
            findHostInstanceByFiber,
            findFiberByHostInstance: findFiberByHostInstance || emptyFindFiberByHostInstance,
            // React Refresh
            findHostInstancesForRefresh,
            scheduleRefresh,
            scheduleRoot,
            setRefreshHandler,
            // Enables DevTools to append owner stacks to error messages in DEV mode.
            getCurrentFiber: getCurrentFiberForDevTools,
            // Enables DevTools to detect reconciler version rather than renderer version
            // which may not match for third party renderers.
            reconcilerVersion: ReactVersion
          });
        }
        const defaultOnRecoverableError = typeof reportError === "function" ? (
          // In modern browsers, reportError will dispatch an error event,
          // emulating an uncaught JavaScript error.
          reportError
        ) : function(error2) {
          console["error"](error2);
        };
        function ReactDOMRoot(internalRoot) {
          this._internalRoot = internalRoot;
        }
        ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
          const root2 = this._internalRoot;
          if (root2 === null) {
            throw new Error("Cannot update an unmounted root.");
          }
          {
            if (typeof arguments[1] === "function") {
              error("render(...): does not support the second callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().");
            } else if (isValidContainer(arguments[1])) {
              error("You passed a container to the second argument of root.render(...). You don't need to pass it again since you already passed it to create the root.");
            } else if (typeof arguments[1] !== "undefined") {
              error("You passed a second argument to root.render(...) but it only accepts one argument.");
            }
            const container = root2.containerInfo;
            if (container.nodeType !== COMMENT_NODE) {
              const hostInstance = findHostInstanceWithNoPortals(root2.current);
              if (hostInstance) {
                if (hostInstance.parentNode !== container) {
                  error("render(...): It looks like the React-rendered content of the root container was removed without using React. This is not supported and will cause errors. Instead, call root.unmount() to empty a root's container.");
                }
              }
            }
          }
          updateContainer(children, root2, null, null);
        };
        ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
          {
            if (typeof arguments[0] === "function") {
              error("unmount(...): does not support a callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().");
            }
          }
          const root2 = this._internalRoot;
          if (root2 !== null) {
            this._internalRoot = null;
            const container = root2.containerInfo;
            {
              if (isAlreadyRendering()) {
                error("Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition.");
              }
            }
            flushSync(function() {
              updateContainer(null, root2, null, null);
            });
            unmarkContainerAsRoot(container);
          }
        };
        function createRoot(container, options2) {
          if (!isValidContainer(container)) {
            throw new Error("createRoot(...): Target container is not a DOM element.");
          }
          warnIfReactDOMContainerInDEV(container);
          let isStrictMode = false;
          const concurrentUpdatesByDefaultOverride = false;
          let identifierPrefix = "";
          let onRecoverableError = defaultOnRecoverableError;
          let transitionCallbacks = null;
          if (options2 !== null && options2 !== void 0) {
            {
              if (options2.hydrate) {
                warn("hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead.");
              } else {
                if (typeof options2 === "object" && options2 !== null && options2.$$typeof === REACT_ELEMENT_TYPE) {
                  error("You passed a JSX element to createRoot. You probably meant to call root.render instead. Example usage:\n\n  let root = createRoot(domContainer);\n  root.render(<App />);");
                }
              }
            }
            if (options2.unstable_strictMode === true) {
              isStrictMode = true;
            }
            if (options2.identifierPrefix !== void 0) {
              identifierPrefix = options2.identifierPrefix;
            }
            if (options2.onRecoverableError !== void 0) {
              onRecoverableError = options2.onRecoverableError;
            }
            if (options2.transitionCallbacks !== void 0) {
              transitionCallbacks = options2.transitionCallbacks;
            }
          }
          const root2 = createContainer(container, ConcurrentRoot, null, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError);
          markContainerAsRoot(root2.current, container);
          const rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container;
          listenToAllSupportedEvents(rootContainerElement);
          return new ReactDOMRoot(root2);
        }
        function ReactDOMHydrationRoot(internalRoot) {
          this._internalRoot = internalRoot;
        }
        function scheduleHydration(target) {
          if (target) {
            queueExplicitHydrationTarget(target);
          }
        }
        ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = scheduleHydration;
        function hydrateRoot(container, initialChildren, options2) {
          if (!isValidContainer(container)) {
            throw new Error("hydrateRoot(...): Target container is not a DOM element.");
          }
          warnIfReactDOMContainerInDEV(container);
          {
            if (initialChildren === void 0) {
              error("Must provide initial children as second argument to hydrateRoot. Example usage: hydrateRoot(domContainer, <App />)");
            }
          }
          const hydrationCallbacks = options2 != null ? options2 : null;
          const mutableSources = options2 != null && options2.hydratedSources || null;
          let isStrictMode = false;
          const concurrentUpdatesByDefaultOverride = false;
          let identifierPrefix = "";
          let onRecoverableError = defaultOnRecoverableError;
          if (options2 !== null && options2 !== void 0) {
            if (options2.unstable_strictMode === true) {
              isStrictMode = true;
            }
            if (options2.identifierPrefix !== void 0) {
              identifierPrefix = options2.identifierPrefix;
            }
            if (options2.onRecoverableError !== void 0) {
              onRecoverableError = options2.onRecoverableError;
            }
          }
          const root2 = createHydrationContainer(initialChildren, null, container, ConcurrentRoot, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError);
          markContainerAsRoot(root2.current, container);
          listenToAllSupportedEvents(container);
          if (mutableSources) {
            for (let i = 0; i < mutableSources.length; i++) {
              const mutableSource = mutableSources[i];
              registerMutableSourceForHydration(root2, mutableSource);
            }
          }
          return new ReactDOMHydrationRoot(root2);
        }
        function isValidContainer(node) {
          return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || !disableCommentsAsDOMContainers));
        }
        function isValidContainerLegacy(node) {
          return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || node.nodeType === COMMENT_NODE && node.nodeValue === " react-mount-point-unstable "));
        }
        function warnIfReactDOMContainerInDEV(container) {
          {
            if (container.nodeType === ELEMENT_NODE && container.tagName && container.tagName.toUpperCase() === "BODY") {
              error("createRoot(): Creating roots directly with document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try using a container element created for your app.");
            }
            if (isContainerMarkedAsRoot(container)) {
              if (container._reactRootContainer) {
                error("You are calling ReactDOMClient.createRoot() on a container that was previously passed to ReactDOM.render(). This is not supported.");
              } else {
                error("You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it.");
              }
            }
          }
        }
        const ReactCurrentOwner$3 = ReactSharedInternals.ReactCurrentOwner;
        let topLevelUpdateWarnings;
        {
          topLevelUpdateWarnings = function(container) {
            if (container._reactRootContainer && container.nodeType !== COMMENT_NODE) {
              const hostInstance = findHostInstanceWithNoPortals(container._reactRootContainer.current);
              if (hostInstance) {
                if (hostInstance.parentNode !== container) {
                  error("render(...): It looks like the React-rendered content of this container was removed without using React. This is not supported and will cause errors. Instead, call ReactDOM.unmountComponentAtNode to empty a container.");
                }
              }
            }
            const isRootRenderedBySomeReact = !!container._reactRootContainer;
            const rootEl = getReactRootElementInContainer(container);
            const hasNonRootReactChild = !!(rootEl && getInstanceFromNode(rootEl));
            if (hasNonRootReactChild && !isRootRenderedBySomeReact) {
              error("render(...): Replacing React-rendered children with a new root component. If you intended to update the children of this node, you should instead have the existing children update their state and render the new components instead of calling ReactDOM.render.");
            }
            if (container.nodeType === ELEMENT_NODE && container.tagName && container.tagName.toUpperCase() === "BODY") {
              error("render(): Rendering components directly into document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try rendering into a container element created for your app.");
            }
          };
        }
        function getReactRootElementInContainer(container) {
          if (!container) {
            return null;
          }
          if (container.nodeType === DOCUMENT_NODE) {
            return container.documentElement;
          } else {
            return container.firstChild;
          }
        }
        function noopOnRecoverableError() {
        }
        function legacyCreateRootFromDOMContainer(container, initialChildren, parentComponent, callback, isHydrationContainer) {
          if (isHydrationContainer) {
            if (typeof callback === "function") {
              const originalCallback = callback;
              callback = function() {
                const instance = getPublicRootInstance(root2);
                originalCallback.call(instance);
              };
            }
            var root2 = createHydrationContainer(
              initialChildren,
              callback,
              container,
              LegacyRoot,
              null,
              // hydrationCallbacks
              false,
              // isStrictMode
              false,
              // concurrentUpdatesByDefaultOverride,
              "",
              // identifierPrefix
              noopOnRecoverableError
            );
            container._reactRootContainer = root2;
            markContainerAsRoot(root2.current, container);
            const rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container;
            listenToAllSupportedEvents(rootContainerElement);
            flushSync();
            return root2;
          } else {
            let rootSibling;
            while (rootSibling = container.lastChild) {
              container.removeChild(rootSibling);
            }
            if (typeof callback === "function") {
              const _originalCallback = callback;
              callback = function() {
                const instance = getPublicRootInstance(_root);
                _originalCallback.call(instance);
              };
            }
            var _root = createContainer(
              container,
              LegacyRoot,
              null,
              // hydrationCallbacks
              false,
              // isStrictMode
              false,
              // concurrentUpdatesByDefaultOverride,
              "",
              // identifierPrefix
              noopOnRecoverableError
            );
            container._reactRootContainer = _root;
            markContainerAsRoot(_root.current, container);
            const _rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container;
            listenToAllSupportedEvents(_rootContainerElement);
            flushSync(function() {
              updateContainer(initialChildren, _root, parentComponent, callback);
            });
            return _root;
          }
        }
        function warnOnInvalidCallback$1(callback, callerName) {
          {
            if (callback !== null && typeof callback !== "function") {
              error("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callerName, callback);
            }
          }
        }
        function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
          {
            topLevelUpdateWarnings(container);
            warnOnInvalidCallback$1(callback === void 0 ? null : callback, "render");
          }
          const maybeRoot = container._reactRootContainer;
          let root2;
          if (!maybeRoot) {
            root2 = legacyCreateRootFromDOMContainer(container, children, parentComponent, callback, forceHydrate);
          } else {
            root2 = maybeRoot;
            if (typeof callback === "function") {
              const originalCallback = callback;
              callback = function() {
                const instance = getPublicRootInstance(root2);
                originalCallback.call(instance);
              };
            }
            updateContainer(children, root2, parentComponent, callback);
          }
          return getPublicRootInstance(root2);
        }
        let didWarnAboutFindDOMNode = false;
        function findDOMNode(componentOrElement) {
          {
            if (!didWarnAboutFindDOMNode) {
              didWarnAboutFindDOMNode = true;
              error("findDOMNode is deprecated and will be removed in the next major release. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node");
            }
            const owner = ReactCurrentOwner$3.current;
            if (owner !== null && owner.stateNode !== null) {
              const warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;
              if (!warnedAboutRefsInRender) {
                error("%s is accessing findDOMNode inside its render(). render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", getComponentNameFromType(owner.type) || "A component");
              }
              owner.stateNode._warnedAboutRefsInRender = true;
            }
          }
          if (componentOrElement == null) {
            return null;
          }
          if (componentOrElement.nodeType === ELEMENT_NODE) {
            return componentOrElement;
          }
          {
            return findHostInstanceWithWarning(componentOrElement, "findDOMNode");
          }
        }
        function hydrate(element, container, callback) {
          {
            error("ReactDOM.hydrate is no longer supported in React 18. Use hydrateRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot");
          }
          if (!isValidContainerLegacy(container)) {
            throw new Error("Target container is not a DOM element.");
          }
          {
            const isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === void 0;
            if (isModernRoot) {
              error("You are calling ReactDOM.hydrate() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call hydrateRoot(container, element)?");
            }
          }
          return legacyRenderSubtreeIntoContainer(null, element, container, true, callback);
        }
        function render(element, container, callback) {
          {
            error("ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot");
          }
          if (!isValidContainerLegacy(container)) {
            throw new Error("Target container is not a DOM element.");
          }
          {
            const isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === void 0;
            if (isModernRoot) {
              error("You are calling ReactDOM.render() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.render(element)?");
            }
          }
          return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
        }
        function unstable_renderSubtreeIntoContainer(parentComponent, element, containerNode, callback) {
          {
            error("ReactDOM.unstable_renderSubtreeIntoContainer() is no longer supported in React 18. Consider using a portal instead. Until you switch to the createRoot API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot");
          }
          if (!isValidContainerLegacy(containerNode)) {
            throw new Error("Target container is not a DOM element.");
          }
          if (parentComponent == null || !has(parentComponent)) {
            throw new Error("parentComponent must be a valid React Component");
          }
          return legacyRenderSubtreeIntoContainer(parentComponent, element, containerNode, false, callback);
        }
        let didWarnAboutUnmountComponentAtNode = false;
        function unmountComponentAtNode(container) {
          {
            if (!didWarnAboutUnmountComponentAtNode) {
              didWarnAboutUnmountComponentAtNode = true;
              error("unmountComponentAtNode is deprecated and will be removed in the next major release. Switch to the createRoot API. Learn more: https://reactjs.org/link/switch-to-createroot");
            }
          }
          if (!isValidContainerLegacy(container)) {
            throw new Error("unmountComponentAtNode(...): Target container is not a DOM element.");
          }
          {
            const isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === void 0;
            if (isModernRoot) {
              error("You are calling ReactDOM.unmountComponentAtNode() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?");
            }
          }
          if (container._reactRootContainer) {
            {
              const rootEl = getReactRootElementInContainer(container);
              const renderedByDifferentReact = rootEl && !getInstanceFromNode(rootEl);
              if (renderedByDifferentReact) {
                error("unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.");
              }
            }
            flushSync(function() {
              legacyRenderSubtreeIntoContainer(null, null, container, false, function() {
                container._reactRootContainer = null;
                unmarkContainerAsRoot(container);
              });
            });
            return true;
          } else {
            {
              const _rootEl = getReactRootElementInContainer(container);
              const hasNonRootReactChild = !!(_rootEl && getInstanceFromNode(_rootEl));
              const isContainerReactRoot = container.nodeType === ELEMENT_NODE && isValidContainerLegacy(container.parentNode) && !!container.parentNode._reactRootContainer;
              if (hasNonRootReactChild) {
                error("unmountComponentAtNode(): The node you're attempting to unmount was rendered by React and is not a top-level container. %s", isContainerReactRoot ? "You may have accidentally passed in a React root node instead of its container." : "Instead, have the parent component update its state and rerender in order to remove this component.");
              }
            }
            return false;
          }
        }
        setAttemptSynchronousHydration(attemptSynchronousHydration$1);
        setAttemptContinuousHydration(attemptContinuousHydration$1);
        setAttemptHydrationAtCurrentPriority(attemptHydrationAtCurrentPriority$1);
        setGetCurrentUpdatePriority(getCurrentUpdatePriority);
        setAttemptHydrationAtPriority(runWithPriority);
        {
          if (typeof Map !== "function" || // $FlowIssue Flow incorrectly thinks Map has no prototype
          Map.prototype == null || typeof Map.prototype.forEach !== "function" || typeof Set !== "function" || // $FlowIssue Flow incorrectly thinks Set has no prototype
          Set.prototype == null || typeof Set.prototype.clear !== "function" || typeof Set.prototype.forEach !== "function") {
            error("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills");
          }
        }
        setRestoreImplementation(restoreControlledState$3);
        setBatchingImplementation(batchedUpdates$1, discreteUpdates, flushSync);
        function createPortal$1(children, container) {
          const key = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
          if (!isValidContainer(container)) {
            throw new Error("Target container is not a DOM element.");
          }
          return createPortal(children, container, null, key);
        }
        function renderSubtreeIntoContainer(parentComponent, element, containerNode, callback) {
          return unstable_renderSubtreeIntoContainer(parentComponent, element, containerNode, callback);
        }
        const Internals = {
          usingClientEntryPoint: false,
          // Keep in sync with ReactTestUtils.js.
          // This is an array for better minification.
          Events: [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates$1]
        };
        function createRoot$1(container, options2) {
          {
            if (!Internals.usingClientEntryPoint && true) {
              error('You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".');
            }
          }
          return createRoot(container, options2);
        }
        function hydrateRoot$1(container, initialChildren, options2) {
          {
            if (!Internals.usingClientEntryPoint && true) {
              error('You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".');
            }
          }
          return hydrateRoot(container, initialChildren, options2);
        }
        function flushSync$1(fn) {
          {
            if (isAlreadyRendering()) {
              error("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.");
            }
          }
          return flushSync(fn);
        }
        const foundDevTools = injectIntoDevTools({
          findFiberByHostInstance: getClosestInstanceFromNode,
          bundleType: 1,
          version: ReactVersion,
          rendererPackageName: "react-dom"
        });
        {
          if (!foundDevTools && canUseDOM && window.top === window.self) {
            if (navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge") === -1 || navigator.userAgent.indexOf("Firefox") > -1) {
              const protocol = window.location.protocol;
              if (/^(https?|file):$/.test(protocol)) {
                console.info("%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools" + (protocol === "file:" ? "\nYou might need to use a local HTTP server (instead of file://): https://reactjs.org/link/react-devtools-faq" : ""), "font-weight:bold");
              }
            }
          }
        }
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Internals;
        exports.createPortal = createPortal$1;
        exports.createRoot = createRoot$1;
        exports.findDOMNode = findDOMNode;
        exports.flushSync = flushSync$1;
        exports.hydrate = hydrate;
        exports.hydrateRoot = hydrateRoot$1;
        exports.render = render;
        exports.unmountComponentAtNode = unmountComponentAtNode;
        exports.unstable_batchedUpdates = batchedUpdates$1;
        exports.unstable_renderSubtreeIntoContainer = renderSubtreeIntoContainer;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react-dom/index.js
const require_react_dom = __commonJS({
  "node_modules/react-dom/index.js"(exports, module) {
    if (false) {
      checkDCE();
      module.exports = null;
    } else {
      module.exports = require_react_dom_development();
    }
  }
});

export {
  require_react_dom
};
/*! Bundled license information:

scheduler/cjs/scheduler.development.js:
  (**
   * @license React
   * scheduler.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.development.js:
  (**
   * @license React
   * react-dom.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
  (**
   * Checks if an event is supported in the current execution environment.
   *
   * NOTE: This will not work correctly for non-generic events such as `change`,
   * `reset`, `load`, `error`, and `select`.
   *
   * Borrows from Modernizr.
   *
   * @param {string} eventNameSuffix Event name, e.g. "click".
   * @return {boolean} True if the event is supported.
   * @internal
   * @license Modernizr 3.0.0pre (Custom Build) | MIT
   *)
*/
//# sourceMappingURL=chunk-WRD5HZVH.js.map
