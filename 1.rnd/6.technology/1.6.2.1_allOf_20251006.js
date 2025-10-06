'use strict';
module.exports = function generate_allOf(it, $keyword, $ruleType) {
  let out = ' ';
  const $schema = it.schema[$keyword];
  const $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  const $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  const $breakOnError = !it.opts.allErrors;
  const $it = it.util.copy(it);
  let $closingBraces = '';
  $it.level++;
  const $nextValid = 'valid' + $it.level;
  let $currentBaseId = $it.baseId,
    $allSchemasEmpty = true;
  const arr1 = $schema;
  if (arr1) {
    let $sch, $i = -1,
      l1 = arr1.length - 1;
    while ($i < l1) {
      $sch = arr1[$i += 1];
      if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
        $allSchemasEmpty = false;
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
        if ($breakOnError) {
          out += ' if (' + ($nextValid) + ') { ';
          $closingBraces += '}';
        }
      }
    }
  }
  if ($breakOnError) {
    if ($allSchemasEmpty) {
      out += ' if (true) { ';
    } else {
      out += ' ' + ($closingBraces.slice(0, -1)) + ' ';
    }
  }
  return out;
}
