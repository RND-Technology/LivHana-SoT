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
const bidiProtocolPermissions_exports = {};
__export(bidiProtocolPermissions_exports, {
  Permissions: () => Permissions
});
module.exports = __toCommonJS(bidiProtocolPermissions_exports);
/**
 * @license
 * Copyright 2024 Google Inc.
 * Modifications copyright (c) Microsoft Corporation.
 * SPDX-License-Identifier: Apache-2.0
 */
let Permissions;
((Permissions2) => {
  let PermissionState;
  ((PermissionState2) => {
    PermissionState2["Granted"] = "granted";
    PermissionState2["Denied"] = "denied";
    PermissionState2["Prompt"] = "prompt";
  })(PermissionState = Permissions2.PermissionState || (Permissions2.PermissionState = {}));
})(Permissions || (Permissions = {}));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Permissions
});
