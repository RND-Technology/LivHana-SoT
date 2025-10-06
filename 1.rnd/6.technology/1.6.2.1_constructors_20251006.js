"use strict";

exports.__esModule = true;
exports.universal = exports.tag = exports.string = exports.selector = exports.root = exports.pseudo = exports.nesting = exports.id = exports.comment = exports.combinator = exports.className = exports.attribute = void 0;
const _attribute = _interopRequireDefault(require("./attribute"));
const _className = _interopRequireDefault(require("./className"));
const _combinator = _interopRequireDefault(require("./combinator"));
const _comment = _interopRequireDefault(require("./comment"));
const _id = _interopRequireDefault(require("./id"));
const _nesting = _interopRequireDefault(require("./nesting"));
const _pseudo = _interopRequireDefault(require("./pseudo"));
const _root = _interopRequireDefault(require("./root"));
const _selector = _interopRequireDefault(require("./selector"));
const _string = _interopRequireDefault(require("./string"));
const _tag = _interopRequireDefault(require("./tag"));
const _universal = _interopRequireDefault(require("./universal"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
const attribute = function attribute(opts) {
  return new _attribute["default"](opts);
};
exports.attribute = attribute;
const className = function className(opts) {
  return new _className["default"](opts);
};
exports.className = className;
const combinator = function combinator(opts) {
  return new _combinator["default"](opts);
};
exports.combinator = combinator;
const comment = function comment(opts) {
  return new _comment["default"](opts);
};
exports.comment = comment;
const id = function id(opts) {
  return new _id["default"](opts);
};
exports.id = id;
const nesting = function nesting(opts) {
  return new _nesting["default"](opts);
};
exports.nesting = nesting;
const pseudo = function pseudo(opts) {
  return new _pseudo["default"](opts);
};
exports.pseudo = pseudo;
const root = function root(opts) {
  return new _root["default"](opts);
};
exports.root = root;
const selector = function selector(opts) {
  return new _selector["default"](opts);
};
exports.selector = selector;
const string = function string(opts) {
  return new _string["default"](opts);
};
exports.string = string;
const tag = function tag(opts) {
  return new _tag["default"](opts);
};
exports.tag = tag;
const universal = function universal(opts) {
  return new _universal["default"](opts);
};
exports.universal = universal;