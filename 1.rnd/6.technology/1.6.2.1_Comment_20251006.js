'use strict';
module.exports = function generate_comment(it, $keyword, $ruleType) {
  let out = ' ';
  const $schema = it.schema[$keyword];
  const $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  const $breakOnError = !it.opts.allErrors;
  const $comment = it.util.toQuotedString($schema);
  if (it.opts.$comment === true) {
    out += ' console.log(' + ($comment) + ');';
  } else if (typeof it.opts.$comment == 'function') {
    out += ' self._opts.$comment(' + ($comment) + ', ' + (it.util.toQuotedString($errSchemaPath)) + ', validate.root.schema);';
  }
  return out;
}
