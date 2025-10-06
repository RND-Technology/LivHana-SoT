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
const crServiceWorker_exports = {};
__export(crServiceWorker_exports, {
  CRServiceWorker: () => CRServiceWorker
});
module.exports = __toCommonJS(crServiceWorker_exports);
const import_page = require("../page");
const import_crExecutionContext = require("./crExecutionContext");
const import_crNetworkManager = require("./crNetworkManager");
const import_browserContext = require("../browserContext");
const network = __toESM(require("../network"));
class CRServiceWorker extends import_page.Worker {
  constructor(browserContext, session, url) {
    super(browserContext, url);
    this._session = session;
    this.browserContext = browserContext;
    if (process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS)
      this._networkManager = new import_crNetworkManager.CRNetworkManager(null, this);
    session.once("Runtime.executionContextCreated", (event) => {
      this.createExecutionContext(new import_crExecutionContext.CRExecutionContext(session, event.context));
    });
    if (this._networkManager && this._isNetworkInspectionEnabled()) {
      this.updateRequestInterception();
      this.updateExtraHTTPHeaders();
      this.updateHttpCredentials();
      this.updateOffline();
      this._networkManager.addSession(
        session,
        void 0,
        true
        /* isMain */
      ).catch(() => {
      });
    }
    session.send("Runtime.enable", {}).catch((e) => {
    });
    session.send("Runtime.runIfWaitingForDebugger").catch((e) => {
    });
    session.on("Inspector.targetReloadedAfterCrash", () => {
      session._sendMayFail("Runtime.runIfWaitingForDebugger", {});
    });
  }
  didClose() {
    this._networkManager?.removeSession(this._session);
    this._session.dispose();
    super.didClose();
  }
  async updateOffline() {
    if (!this._isNetworkInspectionEnabled())
      return;
    await this._networkManager?.setOffline(!!this.browserContext._options.offline).catch(() => {
    });
  }
  async updateHttpCredentials() {
    if (!this._isNetworkInspectionEnabled())
      return;
    await this._networkManager?.authenticate(this.browserContext._options.httpCredentials || null).catch(() => {
    });
  }
  async updateExtraHTTPHeaders() {
    if (!this._isNetworkInspectionEnabled())
      return;
    await this._networkManager?.setExtraHTTPHeaders(this.browserContext._options.extraHTTPHeaders || []).catch(() => {
    });
  }
  async updateRequestInterception() {
    if (!this._isNetworkInspectionEnabled())
      return;
    await this._networkManager?.setRequestInterception(this.needsRequestInterception()).catch(() => {
    });
  }
  needsRequestInterception() {
    return this._isNetworkInspectionEnabled() && this.browserContext.requestInterceptors.length > 0;
  }
  reportRequestFinished(request, response) {
    this.browserContext.emit(import_browserContext.BrowserContext.Events.RequestFinished, { request, response });
  }
  requestFailed(request, _canceled) {
    this.browserContext.emit(import_browserContext.BrowserContext.Events.RequestFailed, request);
  }
  requestReceivedResponse(response) {
    this.browserContext.emit(import_browserContext.BrowserContext.Events.Response, response);
  }
  requestStarted(request, route) {
    this.browserContext.emit(import_browserContext.BrowserContext.Events.Request, request);
    if (route)
      new network.Route(request, route).handle(this.browserContext.requestInterceptors);
  }
  _isNetworkInspectionEnabled() {
    return this.browserContext._options.serviceWorkers !== "block";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CRServiceWorker
});
