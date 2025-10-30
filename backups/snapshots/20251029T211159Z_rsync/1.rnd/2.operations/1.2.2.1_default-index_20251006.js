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

// src/scripts/default-index.ts
const default_index_exports = {};
__export(default_index_exports, {
  Prisma: () => Prisma,
  PrismaClient: () => PrismaClient,
  default: () => default_index_default
});
module.exports = __toCommonJS(default_index_exports);

// ../../node_modules/.pnpm/@prisma+engines-version@5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2/node_modules/@prisma/engines-version/package.json
const prisma = {
  enginesVersion: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
};

// package.json
const version = "5.22.0";

// src/runtime/utils/clientVersion.ts
const clientVersion = version;

// src/scripts/default-index.ts
var PrismaClient = class {
  constructor() {
    throw new Error('@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.');
  }
};
function defineExtension(ext) {
  if (typeof ext === "function") {
    return ext;
  }
  return (client) => client.$extends(ext);
}
function getExtensionContext(that) {
  return that;
}
var Prisma = {
  defineExtension,
  getExtensionContext,
  prismaVersion: { client: clientVersion, engine: prisma.enginesVersion }
};
var default_index_default = { Prisma };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Prisma,
  PrismaClient
});
