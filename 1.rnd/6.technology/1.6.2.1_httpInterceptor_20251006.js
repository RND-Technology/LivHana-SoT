/** Pass-through HTTP interceptor. */
function passThroughInterceptor(request, requestOptions, next) {
  return next(request, requestOptions);
}
/**
 * Combine multiple HTTP interceptors into one.
 */
function combineHttpInterceptors(interceptors) {
  return function (firstRequest, firstOptions, next) {
    const _loop_1 = function (index) {
      const current = interceptors[index];
      const last = next;
      next = function (request, options) {
        return current(request, options, last);
      };
    };
    for (let index = interceptors.length - 1; index >= 0; index--) {
      _loop_1(index);
    }
    return next(firstRequest, firstOptions);
  };
}
export { combineHttpInterceptors, passThroughInterceptor };