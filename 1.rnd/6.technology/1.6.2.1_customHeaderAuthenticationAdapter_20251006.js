import { passThroughInterceptor } from '@apimatic/core-interfaces';
import { mergeHeaders } from '@apimatic/http-headers';
const customHeaderAuthenticationProvider = function (customHeaderParams) {
  return function (requiresAuth) {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }
    return function (request, options, next) {
      let _a;
      request.headers = (_a = request.headers) !== null && _a !== void 0 ? _a : {};
      mergeHeaders(request.headers, customHeaderParams);
      return next(request, options);
    };
  };
};
export { customHeaderAuthenticationProvider };