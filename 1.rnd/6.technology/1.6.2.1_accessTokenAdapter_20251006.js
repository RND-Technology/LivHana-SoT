import { passThroughInterceptor } from '@apimatic/core-interfaces';
import { setHeader, AUTHORIZATION_HEADER } from '@apimatic/http-headers';
const accessTokenAuthenticationProvider = function (_a) {
  const accessToken = _a.accessToken;
  return function (requiresAuth) {
    if (!requiresAuth) {
      return passThroughInterceptor;
    }
    return function (request, options, next) {
      let _a;
      request.headers = (_a = request.headers) !== null && _a !== void 0 ? _a : {};
      setHeader(request.headers, AUTHORIZATION_HEADER, "Bearer ".concat(accessToken));
      return next(request, options);
    };
  };
};
export { accessTokenAuthenticationProvider };