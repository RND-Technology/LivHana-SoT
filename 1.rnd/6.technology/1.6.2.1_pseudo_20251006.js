"use strict";

exports.__esModule = true;
exports["default"] = void 0;
const _container = _interopRequireDefault(require("./container"));
const _types = require("./types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
const Pseudo = /*#__PURE__*/function (_Container) {
  _inheritsLoose(Pseudo, _Container);
  function Pseudo(opts) {
    let _this;
    _this = _Container.call(this, opts) || this;
    _this.type = _types.PSEUDO;
    return _this;
  }
  const _proto = Pseudo.prototype;
  _proto.toString = function toString() {
    const params = this.length ? '(' + this.map(String).join(',') + ')' : '';
    return [this.rawSpaceBefore, this.stringifyProperty("value"), params, this.rawSpaceAfter].join('');
  };
  return Pseudo;
}(_container["default"]);
exports["default"] = Pseudo;
module.exports = exports.default;