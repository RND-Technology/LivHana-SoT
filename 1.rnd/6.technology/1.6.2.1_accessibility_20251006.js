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
const accessibility_exports = {};
__export(accessibility_exports, {
  Accessibility: () => Accessibility
});
module.exports = __toCommonJS(accessibility_exports);
function axNodeFromProtocol(axNode) {
  const result = {
    ...axNode,
    value: axNode.valueNumber !== void 0 ? axNode.valueNumber : axNode.valueString,
    checked: axNode.checked === "checked" ? true : axNode.checked === "unchecked" ? false : axNode.checked,
    pressed: axNode.pressed === "pressed" ? true : axNode.pressed === "released" ? false : axNode.pressed,
    children: axNode.children ? axNode.children.map(axNodeFromProtocol) : void 0
  };
  delete result.valueNumber;
  delete result.valueString;
  return result;
}
class Accessibility {
  constructor(channel) {
    this._channel = channel;
  }
  async snapshot(options = {}) {
    const root = options.root ? options.root._elementChannel : void 0;
    const result = await this._channel.accessibilitySnapshot({ interestingOnly: options.interestingOnly, root });
    return result.rootAXNode ? axNodeFromProtocol(result.rootAXNode) : null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Accessibility
});
