"use strict";

exports.__esModule = true;
exports["default"] = void 0;
const _namespace = _interopRequireDefault(require("./namespace"));
const _types = require("./types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
const Universal = /*#__PURE__*/function (_Namespace) {
  _inheritsLoose(Universal, _Namespace);
  function Universal(opts) {
    let _this;
    _this = _Namespace.call(this, opts) || this;
    _this.type = _types.UNIVERSAL;
    _this.value = '*';
    return _this;
  }
  return Universal;
}(_namespace["default"]);
exports["default"] = Universal;
module.exports = exports.default;