import { passThroughInterceptor } from '@apimatic/core-interfaces';

/** None authentication provider */
const noneAuthenticationProvider = function () {
  return passThroughInterceptor;
};
export { noneAuthenticationProvider };