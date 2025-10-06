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
const recorderRunner_exports = {};
__export(recorderRunner_exports, {
  performAction: () => performAction,
  toClickOptions: () => toClickOptions
});
module.exports = __toCommonJS(recorderRunner_exports);
const import_utils = require("../../utils");
const import_language = require("../codegen/language");
const import_recorderUtils = require("./recorderUtils");
const import_progress = require("../progress");
async function performAction(pageAliases, actionInContext) {
  const mainFrame = (0, import_recorderUtils.mainFrameForAction)(pageAliases, actionInContext);
  const controller = new import_progress.ProgressController();
  const kActionTimeout = 5e3;
  return await controller.run((progress) => performActionImpl(progress, mainFrame, actionInContext), kActionTimeout);
}
async function performActionImpl(progress, mainFrame, actionInContext) {
  const { action } = actionInContext;
  if (action.name === "navigate") {
    await mainFrame.goto(progress, action.url);
    return;
  }
  if (action.name === "openPage")
    throw Error("Not reached");
  if (action.name === "closePage") {
    await mainFrame._page.close();
    return;
  }
  const selector = (0, import_recorderUtils.buildFullSelector)(actionInContext.frame.framePath, action.selector);
  if (action.name === "click") {
    const options = toClickOptions(action);
    await mainFrame.click(progress, selector, { ...options, strict: true });
    return;
  }
  if (action.name === "press") {
    const modifiers = (0, import_language.toKeyboardModifiers)(action.modifiers);
    const shortcut = [...modifiers, action.key].join("+");
    await mainFrame.press(progress, selector, shortcut, { strict: true });
    return;
  }
  if (action.name === "fill") {
    await mainFrame.fill(progress, selector, action.text, { strict: true });
    return;
  }
  if (action.name === "setInputFiles") {
    await mainFrame.setInputFiles(progress, selector, { selector, payloads: [], strict: true });
    return;
  }
  if (action.name === "check") {
    await mainFrame.check(progress, selector, { strict: true });
    return;
  }
  if (action.name === "uncheck") {
    await mainFrame.uncheck(progress, selector, { strict: true });
    return;
  }
  if (action.name === "select") {
    const values = action.options.map((value) => ({ value }));
    await mainFrame.selectOption(progress, selector, [], values, { strict: true });
    return;
  }
  if (action.name === "assertChecked") {
    await mainFrame.expect(progress, selector, {
      selector,
      expression: "to.be.checked",
      expectedValue: { checked: action.checked },
      isNot: !action.checked
    });
    return;
  }
  if (action.name === "assertText") {
    await mainFrame.expect(progress, selector, {
      selector,
      expression: "to.have.text",
      expectedText: (0, import_utils.serializeExpectedTextValues)([action.text], { matchSubstring: true, normalizeWhiteSpace: true }),
      isNot: false
    });
    return;
  }
  if (action.name === "assertValue") {
    await mainFrame.expect(progress, selector, {
      selector,
      expression: "to.have.value",
      expectedValue: action.value,
      isNot: false
    });
    return;
  }
  if (action.name === "assertVisible") {
    await mainFrame.expect(progress, selector, {
      selector,
      expression: "to.be.visible",
      isNot: false
    });
    return;
  }
  throw new Error("Internal error: unexpected action " + action.name);
}
function toClickOptions(action) {
  const modifiers = (0, import_language.toKeyboardModifiers)(action.modifiers);
  const options = {};
  if (action.button !== "left")
    options.button = action.button;
  if (modifiers.length)
    options.modifiers = modifiers;
  if (action.clickCount > 1)
    options.clickCount = action.clickCount;
  if (action.position)
    options.position = action.position;
  return options;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  performAction,
  toClickOptions
});
