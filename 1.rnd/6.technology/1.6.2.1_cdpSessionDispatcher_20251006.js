"use strict";
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
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
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
const cdpSessionDispatcher_exports = {};
__export(cdpSessionDispatcher_exports, {
  CDPSessionDispatcher: () => CDPSessionDispatcher
});
module.exports = __toCommonJS(cdpSessionDispatcher_exports);
const import_dispatcher = require("./dispatcher");
const import_crConnection = require("../chromium/crConnection");
class CDPSessionDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, cdpSession) {
    super(scope, cdpSession, "CDPSession", {});
    this._type_CDPSession = true;
    this.addObjectListener(import_crConnection.CDPSession.Events.Event, ({ method, params }) => this._dispatchEvent("event", { method, params }));
    this.addObjectListener(import_crConnection.CDPSession.Events.Closed, () => this._dispose());
  }
  async send(params, progress) {
    return { result: await progress.race(this._object.send(params.method, params.params)) };
  }
  async detach(_, progress) {
    progress.metadata.potentiallyClosesScope = true;
    await this._object.detach();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CDPSessionDispatcher
});
