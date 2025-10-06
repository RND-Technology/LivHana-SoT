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
const bundle_exports = {};
__export(bundle_exports, {
  CallToolRequestSchema: () => CallToolRequestSchema,
  Client: () => Client,
  ListRootsRequestSchema: () => ListRootsRequestSchema,
  ListToolsRequestSchema: () => ListToolsRequestSchema,
  PingRequestSchema: () => PingRequestSchema,
  SSEServerTransport: () => SSEServerTransport,
  Server: () => Server,
  StdioServerTransport: () => StdioServerTransport,
  StreamableHTTPServerTransport: () => StreamableHTTPServerTransport,
  z: () => z,
  zodToJsonSchema: () => zodToJsonSchema
});
module.exports = __toCommonJS(bundle_exports);
const bundle = require("./mcpBundleImpl");
const zodToJsonSchema = require("./mcpBundleImpl").zodToJsonSchema;
const Client = bundle.Client;
const Server = bundle.Server;
const SSEServerTransport = bundle.SSEServerTransport;
const StdioServerTransport = bundle.StdioServerTransport;
const StreamableHTTPServerTransport = bundle.StreamableHTTPServerTransport;
const CallToolRequestSchema = bundle.CallToolRequestSchema;
const ListRootsRequestSchema = bundle.ListRootsRequestSchema;
const ListToolsRequestSchema = bundle.ListToolsRequestSchema;
const PingRequestSchema = bundle.PingRequestSchema;
const z = bundle.z;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CallToolRequestSchema,
  Client,
  ListRootsRequestSchema,
  ListToolsRequestSchema,
  PingRequestSchema,
  SSEServerTransport,
  Server,
  StdioServerTransport,
  StreamableHTTPServerTransport,
  z,
  zodToJsonSchema
});
