import { __read } from 'tslib';
import JSONBig from '@apimatic/json-bigint';
const validHttpMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'LINK', 'UNLINK'];
/**
 * Converts an Express request into a normalized HttpRequest.
 *
 * Validates method, headers, and URL, and serializes the body.
 *
 * @param req - The Express request to convert.
 * @returns A standardized HttpRequest object.
 * @throws Error if the method, host, or URL is invalid.
 */
function convertExpressRequest(req) {
  let _a;
  const method = (_a = req.method) === null || _a === void 0 ? void 0 : _a.toUpperCase();
  if (!isHttpMethod(method)) {
    throw new Error("Unsupported HTTP method: ".concat(req.method));
  }
  const host = req.get('host');
  if (!host || host.trim() === '' || host === 'undefined') {
    throw new Error('Missing host header');
  }
  const url = "".concat(req.protocol, "://").concat(req.get('host')).concat(req.originalUrl);
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL: ".concat(url));
  }
  const headers = req.headers;
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
    throw new Error("Invalid headers: expected an object, got ".concat(typeof headers));
  }
  return {
    method: method,
    headers: Object.entries(headers).reduce(function (acc, _a) {
      const _b = __read(_a, 2),
        k = _b[0],
        v = _b[1];
      acc[k] = String(v);
      return acc;
    }, {}),
    url: url,
    body: toBodyContent(req.body)
  };
}
function isHttpMethod(method) {
  return validHttpMethods.includes(method);
}
function isValidUrl(url) {
  const protocolRegex = /^https?:\/\/[^/]+/;
  const match = protocolRegex.exec(url);
  return match !== null;
}
function toBodyContent(body) {
  if (body === undefined || body === null) {
    return {
      type: 'text',
      content: ''
    };
  }
  if (Buffer.isBuffer(body)) {
    return {
      type: 'text',
      content: body.toString('utf8')
    };
  }
  if (typeof body === 'string') {
    return {
      type: 'text',
      content: body
    };
  }
  if (typeof body === 'object') {
    if (Object.keys(body).length === 0) {
      return {
        type: 'text',
        content: ''
      };
    }
    return {
      type: 'text',
      content: JSONBig.stringify(body)
    };
  }
  return {
    type: 'text',
    content: String(body)
  };
}
export { convertExpressRequest };