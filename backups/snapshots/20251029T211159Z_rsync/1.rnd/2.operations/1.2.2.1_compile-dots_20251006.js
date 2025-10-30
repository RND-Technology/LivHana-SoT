//compile doT templates to js functions
'use strict';

const glob = require('glob')
  , fs = require('fs')
  , path = require('path')
  , doT = require('dot')
  , beautify = require('js-beautify').js_beautify;

const defsRootPath = process.argv[2] || path.join(__dirname, '../lib');

const defs = {};
const defFiles = glob.sync('./dot/**/*.def', { cwd: defsRootPath });
defFiles.forEach(function (f) {
  const name = path.basename(f, '.def');
  defs[name] = fs.readFileSync(path.join(defsRootPath, f));
});

const filesRootPath = process.argv[3] || path.join(__dirname, '../lib');
const files = glob.sync('./dot/**/*.jst', { cwd: filesRootPath });

const dotjsPath = path.join(filesRootPath, './dotjs');
try { fs.mkdirSync(dotjsPath); } catch(e) {}

console.log('\n\nCompiling:');

const FUNCTION_NAME = /function\s+anonymous\s*\(it[^)]*\)\s*{/;
const OUT_EMPTY_STRING = /out\s*\+=\s*'\s*';/g;
const ISTANBUL = /'(istanbul[^']+)';/g;
const ERROR_KEYWORD = /\$errorKeyword/g;
const ERROR_KEYWORD_OR = /\$errorKeyword\s+\|\|/g;
const VARS = [
  '$errs', '$valid', '$lvl', '$data', '$dataLvl',
  '$errorKeyword', '$closingBraces', '$schemaPath',
  '$validate'
];

files.forEach(function (f) {
  const keyword = path.basename(f, '.jst');
  const targetPath = path.join(dotjsPath, keyword + '.js');
  const template = fs.readFileSync(path.join(filesRootPath, f));
  let code = doT.compile(template, defs);
  code = code.toString()
             .replace(OUT_EMPTY_STRING, '')
             .replace(FUNCTION_NAME, 'function generate_' + keyword + '(it, $keyword, $ruleType) {')
             .replace(ISTANBUL, '/* $1 */');
  removeAlwaysFalsyInOr();
  VARS.forEach(removeUnusedVar);
  code = "'use strict';\nmodule.exports = " + code;
  code = beautify(code, { indent_size: 2 }) + '\n';
  fs.writeFileSync(targetPath, code);
  console.log('compiled', keyword);

  function removeUnusedVar(v) {
    v = v.replace(/\$/g, '\\$$');
    let regexp = new RegExp(v + '[^A-Za-z0-9_$]', 'g');
    const count = occurrences(regexp);
    if (count == 1) {
      regexp = new RegExp('var\\s+' + v + '\\s*=[^;]+;|var\\s+' + v + ';');
      code = code.replace(regexp, '');
    }
  }

  function removeAlwaysFalsyInOr() {
    const countUsed = occurrences(ERROR_KEYWORD);
    const countOr = occurrences(ERROR_KEYWORD_OR);
    if (countUsed == countOr + 1) code = code.replace(ERROR_KEYWORD_OR, '');
  }

  function occurrences(regexp) {
    return (code.match(regexp) || []).length;
  }
});
