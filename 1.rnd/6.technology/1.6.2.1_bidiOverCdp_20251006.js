"use strict";
const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
const __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
const bidiOverCdp_exports = {};
__export(bidiOverCdp_exports, {
  connectBidiOverCdp: () => connectBidiOverCdp
});
module.exports = __toCommonJS(bidiOverCdp_exports);
const bidiMapper = __toESM(require("chromium-bidi/lib/cjs/bidiMapper/BidiMapper"));
const bidiCdpConnection = __toESM(require("chromium-bidi/lib/cjs/cdp/CdpConnection"));
const import_debugLogger = require("../utils/debugLogger");
const bidiServerLogger = (prefix, ...args) => {
  import_debugLogger.debugLogger.log(prefix, args);
};
async function connectBidiOverCdp(cdp) {
  let server = void 0;
  const bidiTransport = new BidiTransportImpl();
  const bidiConnection = new BidiConnection(bidiTransport, () => server?.close());
  const cdpTransportImpl = new CdpTransportImpl(cdp);
  const cdpConnection = new bidiCdpConnection.MapperCdpConnection(cdpTransportImpl, bidiServerLogger);
  cdp.onclose = () => bidiConnection.onclose?.();
  server = await bidiMapper.BidiServer.createAndStart(
    bidiTransport,
    cdpConnection,
    await cdpConnection.createBrowserSession(),
    /* selfTargetId= */
    "",
    void 0,
    bidiServerLogger
  );
  return bidiConnection;
}
class BidiTransportImpl {
  setOnMessage(handler) {
    this._handler = handler;
  }
  sendMessage(message) {
    return this._bidiConnection.onmessage?.(message);
  }
  close() {
    this._bidiConnection.onclose?.();
  }
}
class BidiConnection {
  constructor(bidiTransport, closeCallback) {
    this._bidiTransport = bidiTransport;
    this._bidiTransport._bidiConnection = this;
    this._closeCallback = closeCallback;
  }
  send(s) {
    this._bidiTransport._handler?.(s);
  }
  close() {
    this._closeCallback();
  }
}
class CdpTransportImpl {
  constructor(connection) {
    this._connection = connection;
    this._connection.onmessage = (message) => {
      this._handler?.(JSON.stringify(message));
    };
  }
  setOnMessage(handler) {
    this._handler = handler;
  }
  sendMessage(message) {
    return this._connection.send(JSON.parse(message));
  }
  close() {
    this._connection.close();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connectBidiOverCdp
});
