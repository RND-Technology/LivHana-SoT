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
const crInput_exports = {};
__export(crInput_exports, {
  RawKeyboardImpl: () => RawKeyboardImpl,
  RawMouseImpl: () => RawMouseImpl,
  RawTouchscreenImpl: () => RawTouchscreenImpl
});
module.exports = __toCommonJS(crInput_exports);
const import_utils = require("../../utils");
const input = __toESM(require("../input"));
const import_macEditingCommands = require("../macEditingCommands");
const import_crProtocolHelper = require("./crProtocolHelper");
class RawKeyboardImpl {
  constructor(_client, _isMac, _dragManger) {
    this._client = _client;
    this._isMac = _isMac;
    this._dragManger = _dragManger;
  }
  _commandsForCode(code, modifiers) {
    if (!this._isMac)
      return [];
    const parts = [];
    for (const modifier of ["Shift", "Control", "Alt", "Meta"]) {
      if (modifiers.has(modifier))
        parts.push(modifier);
    }
    parts.push(code);
    const shortcut = parts.join("+");
    let commands = import_macEditingCommands.macEditingCommands[shortcut] || [];
    if ((0, import_utils.isString)(commands))
      commands = [commands];
    commands = commands.filter((x) => !x.startsWith("insert"));
    return commands.map((c) => c.substring(0, c.length - 1));
  }
  async keydown(progress, modifiers, keyName, description, autoRepeat) {
    const { code, key, location, text } = description;
    if (code === "Escape" && await progress.race(this._dragManger.cancelDrag()))
      return;
    const commands = this._commandsForCode(code, modifiers);
    await progress.race(this._client.send("Input.dispatchKeyEvent", {
      type: text ? "keyDown" : "rawKeyDown",
      modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
      windowsVirtualKeyCode: description.keyCodeWithoutLocation,
      code,
      commands,
      key,
      text,
      unmodifiedText: text,
      autoRepeat,
      location,
      isKeypad: location === input.keypadLocation
    }));
  }
  async keyup(progress, modifiers, keyName, description) {
    const { code, key, location } = description;
    await progress.race(this._client.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
      key,
      windowsVirtualKeyCode: description.keyCodeWithoutLocation,
      code,
      location
    }));
  }
  async sendText(progress, text) {
    await progress.race(this._client.send("Input.insertText", { text }));
  }
}
class RawMouseImpl {
  constructor(page, client, dragManager) {
    this._page = page;
    this._client = client;
    this._dragManager = dragManager;
  }
  async move(progress, x, y, button, buttons, modifiers, forClick) {
    const actualMove = async () => {
      await progress.race(this._client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        button,
        buttons: (0, import_crProtocolHelper.toButtonsMask)(buttons),
        x,
        y,
        modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
        force: buttons.size > 0 ? 0.5 : 0
      }));
    };
    if (forClick) {
      await actualMove();
      return;
    }
    await this._dragManager.interceptDragCausedByMove(progress, x, y, button, buttons, modifiers, actualMove);
  }
  async down(progress, x, y, button, buttons, modifiers, clickCount) {
    if (this._dragManager.isDragging())
      return;
    await progress.race(this._client.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      button,
      buttons: (0, import_crProtocolHelper.toButtonsMask)(buttons),
      x,
      y,
      modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
      clickCount,
      force: buttons.size > 0 ? 0.5 : 0
    }));
  }
  async up(progress, x, y, button, buttons, modifiers, clickCount) {
    if (this._dragManager.isDragging()) {
      await this._dragManager.drop(progress, x, y, modifiers);
      return;
    }
    await progress.race(this._client.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      button,
      buttons: (0, import_crProtocolHelper.toButtonsMask)(buttons),
      x,
      y,
      modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
      clickCount
    }));
  }
  async wheel(progress, x, y, buttons, modifiers, deltaX, deltaY) {
    await progress.race(this._client.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x,
      y,
      modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
      deltaX,
      deltaY
    }));
  }
}
class RawTouchscreenImpl {
  constructor(client) {
    this._client = client;
  }
  async tap(progress, x, y, modifiers) {
    await progress.race(Promise.all([
      this._client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
        touchPoints: [{
          x,
          y
        }]
      }),
      this._client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        modifiers: (0, import_crProtocolHelper.toModifiersMask)(modifiers),
        touchPoints: []
      })
    ]));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RawKeyboardImpl,
  RawMouseImpl,
  RawTouchscreenImpl
});
