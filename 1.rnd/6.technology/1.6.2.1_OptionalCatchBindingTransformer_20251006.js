"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const _types = require('../parser/tokenizer/types');

const _Transformer = require('./Transformer'); const _Transformer2 = _interopRequireDefault(_Transformer);

 class OptionalCatchBindingTransformer extends _Transformer2.default {
  constructor( tokens,  nameManager) {
    super();this.tokens = tokens;this.nameManager = nameManager;
  }

  process() {
    if (this.tokens.matches2(_types.TokenType._catch, _types.TokenType.braceL)) {
      this.tokens.copyToken();
      this.tokens.appendCode(` (${this.nameManager.claimFreeName("e")})`);
      return true;
    }
    return false;
  }
} exports.default = OptionalCatchBindingTransformer;
