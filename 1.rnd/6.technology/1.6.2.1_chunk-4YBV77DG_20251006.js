"use strict";Object.defineProperty(exports, "__esModule", {value: true});

const _chunkSMXZPJEAjs = require('./chunk-SMXZPJEA.js');

// src/utils/node/index.ts
const _http = require('http');
const _stream = require('stream');
const _outvariant = require('outvariant');
const kRawRequestBodyStream = Symbol("kRawRequestBodyStream");
function getClientRequestBodyStream(request) {
  const rawRequest = _chunkSMXZPJEAjs.getRawRequest.call(void 0, request);
  _outvariant.invariant.call(void 0, 
    rawRequest instanceof _http.ClientRequest,
    `Failed to retrieve raw request body stream: request is not an instance of "http.ClientRequest". Note that you can only use the "getClientRequestBodyStream" function with the requests issued by "http.clientRequest".`
  );
  const requestBodyStream = Reflect.get(request, kRawRequestBodyStream);
  _outvariant.invariant.call(void 0, 
    requestBodyStream instanceof _stream.Readable,
    "Failed to retrieve raw request body stream: corrupted stream (%s)",
    typeof requestBodyStream
  );
  return requestBodyStream;
}
function setRawRequestBodyStream(request, stream) {
  Reflect.set(request, kRawRequestBodyStream, stream);
}




exports.getClientRequestBodyStream = getClientRequestBodyStream; exports.setRawRequestBodyStream = setRawRequestBodyStream;
//# sourceMappingURL=chunk-4YBV77DG.js.map