import _createForOfIteratorHelperLoose from '@babel/runtime/helpers/esm/createForOfIteratorHelperLoose';
import _extends from '@babel/runtime/helpers/esm/extends';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import nodePath from 'path';
import { SourceMapGenerator } from 'source-map';
import convert from 'convert-source-map';
import findRoot from 'find-root';
import memoize from '@emotion/memoize';
import hashString from '@emotion/hash';
import escapeRegexp from 'escape-string-regexp';
import { serializeStyles } from '@emotion/serialize';
import { compile } from 'stylis';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import { createMacro } from 'babel-plugin-macros';

/*
type LabelFormatOptions = {
  name: string,
  path: string
}
*/

const invalidClassNameCharacters = /[!"#$%&'()*+,./:;<=>?@[\]^`|}~{]/g;

const sanitizeLabelPart = function sanitizeLabelPart(labelPart
/*: string */
) {
  return labelPart.trim().replace(invalidClassNameCharacters, '-');
};

function getLabel(identifierName
/* ?: string */
, labelFormat
/* ?: string | (LabelFormatOptions => string) */
, filename
/*: string */
) {
  if (!identifierName) return null;
  const sanitizedName = sanitizeLabelPart(identifierName);

  if (!labelFormat) {
    return sanitizedName;
  }

  if (typeof labelFormat === 'function') {
    return labelFormat({
      name: sanitizedName,
      path: filename
    });
  }

  const parsedPath = nodePath.parse(filename);
  const localDirname = nodePath.basename(parsedPath.dir);
  let localFilename = parsedPath.name;

  if (localFilename === 'index') {
    localFilename = localDirname;
  }

  return labelFormat.replace(/\[local\]/gi, sanitizedName).replace(/\[filename\]/gi, sanitizeLabelPart(localFilename)).replace(/\[dirname\]/gi, sanitizeLabelPart(localDirname));
}

function getLabelFromPath(path, state, t) {
  return getLabel(getIdentifierName(path, t), state.opts.labelFormat, state.file.opts.filename);
}

const getObjPropertyLikeName = function getObjPropertyLikeName(path, t) {
  if (!t.isObjectProperty(path) && !t.isObjectMethod(path) || path.node.computed) {
    return null;
  }

  if (t.isIdentifier(path.node.key)) {
    return path.node.key.name;
  }

  if (t.isStringLiteral(path.node.key)) {
    return path.node.key.value.replace(/\s+/g, '-');
  }

  return null;
};

function getDeclaratorName(path, t) {
  const parent = path.findParent(function (p) {
    return p.isVariableDeclarator() || p.isAssignmentExpression() || p.isFunctionDeclaration() || p.isFunctionExpression() || p.isArrowFunctionExpression() || p.isObjectProperty() || p.isObjectMethod();
  });

  if (!parent) {
    return '';
  } // we probably have a css call assigned to a variable
  // so we'll just return the variable name


  if (parent.isVariableDeclarator()) {
    if (t.isIdentifier(parent.node.id)) {
      return parent.node.id.name;
    }

    return '';
  }

  if (parent.isAssignmentExpression()) {
    const left = parent.node.left;

    if (t.isIdentifier(left)) {
      return left.name;
    }

    if (t.isMemberExpression(left)) {
      let memberExpression = left;
      let name = '';

      while (true) {
        if (!t.isIdentifier(memberExpression.property)) {
          return '';
        }

        name = "" + memberExpression.property.name + (name ? "-" + name : '');

        if (t.isIdentifier(memberExpression.object)) {
          return memberExpression.object.name + "-" + name;
        }

        if (!t.isMemberExpression(memberExpression.object)) {
          return '';
        }

        memberExpression = memberExpression.object;
      }
    }

    return '';
  } // we probably have an inline css prop usage


  if (parent.isFunctionDeclaration()) {
    return parent.node.id.name || '';
  }

  if (parent.isFunctionExpression()) {
    if (parent.node.id) {
      return parent.node.id.name || '';
    }

    return getDeclaratorName(parent, t);
  }

  if (parent.isArrowFunctionExpression()) {
    return getDeclaratorName(parent, t);
  } // we could also have an object property


  const objPropertyLikeName = getObjPropertyLikeName(parent, t);

  if (objPropertyLikeName) {
    return objPropertyLikeName;
  }

  const variableDeclarator = parent.findParent(function (p) {
    return p.isVariableDeclarator();
  });

  if (!variableDeclarator || !variableDeclarator.get('id').isIdentifier()) {
    return '';
  }

  return variableDeclarator.node.id.name;
}

function getIdentifierName(path, t) {
  const objPropertyLikeName = getObjPropertyLikeName(path.parentPath, t);

  if (objPropertyLikeName) {
    return objPropertyLikeName;
  }

  const classOrClassPropertyParent = path.findParent(function (p) {
    return t.isClassProperty(p) || t.isClass(p);
  });

  if (classOrClassPropertyParent) {
    if (t.isClassProperty(classOrClassPropertyParent) && classOrClassPropertyParent.node.computed === false && t.isIdentifier(classOrClassPropertyParent.node.key)) {
      return classOrClassPropertyParent.node.key.name;
    }

    if (t.isClass(classOrClassPropertyParent) && classOrClassPropertyParent.node.id) {
      return t.isIdentifier(classOrClassPropertyParent.node.id) ? classOrClassPropertyParent.node.id.name : '';
    }
  }

  const declaratorName = getDeclaratorName(path, t); // if the name starts with _ it was probably generated by babel so we should ignore it

  if (declaratorName.charAt(0) === '_') {
    return '';
  }

  return declaratorName;
}

function getGeneratorOpts(file) {
  return file.opts.generatorOpts ? file.opts.generatorOpts : file.opts;
}

function makeSourceMapGenerator(file) {
  const generatorOpts = getGeneratorOpts(file);
  const filename = generatorOpts.sourceFileName;
  const generator = new SourceMapGenerator({
    file: filename,
    sourceRoot: generatorOpts.sourceRoot
  });
  generator.setSourceContent(filename, file.code);
  return generator;
}
function getSourceMap(offset
/*: {
line: number,
column: number
} */
, state)
/*: string */
{
  const generator = makeSourceMapGenerator(state.file);
  const generatorOpts = getGeneratorOpts(state.file);

  if (generatorOpts.sourceFileName && generatorOpts.sourceFileName !== 'unknown') {
    generator.addMapping({
      generated: {
        line: 1,
        column: 0
      },
      source: generatorOpts.sourceFileName,
      original: offset
    });
    return convert.fromObject(generator).toComment({
      multiline: true
    });
  }

  return '';
}

const hashArray = function hashArray(arr
/*: Array<string> */
) {
  return hashString(arr.join(''));
};

const unsafeRequire = require;
const getPackageRootPath = memoize(function (filename) {
  return findRoot(filename);
});
const separator = new RegExp(escapeRegexp(nodePath.sep), 'g');

const normalizePath = function normalizePath(path) {
  return nodePath.normalize(path).replace(separator, '/');
};

function getTargetClassName(state, t) {
  if (state.emotionTargetClassNameCount === undefined) {
    state.emotionTargetClassNameCount = 0;
  }

  const hasFilepath = state.file.opts.filename && state.file.opts.filename !== 'unknown';
  const filename = hasFilepath ? state.file.opts.filename : ''; // normalize the file path to ignore folder structure
  // outside the current node project and arch-specific delimiters

  let moduleName = '';
  let rootPath = filename;

  try {
    rootPath = getPackageRootPath(filename);
    moduleName = unsafeRequire(rootPath + '/package.json').name;
  } catch (err) {}

  const finalPath = filename === rootPath ? 'root' : filename.slice(rootPath.length);
  const positionInFile = state.emotionTargetClassNameCount++;
  const stuffToHash = [moduleName];

  if (finalPath) {
    stuffToHash.push(normalizePath(finalPath));
  } else {
    stuffToHash.push(state.file.code);
  }

  const stableClassName = "e" + hashArray(stuffToHash) + positionInFile;
  return stableClassName;
}

// it's meant to simplify the most common cases so i don't want to make it especially complex
// also, this will be unnecessary when prepack is ready

function simplifyObject(node, t
/*: Object */
) {
  let finalString = '';

  for (let i = 0; i < node.properties.length; i++) {
    var _ref;

    const property = node.properties[i];

    if (!t.isObjectProperty(property) || property.computed || !t.isIdentifier(property.key) && !t.isStringLiteral(property.key) || !t.isStringLiteral(property.value) && !t.isNumericLiteral(property.value) && !t.isObjectExpression(property.value)) {
      return node;
    }

    const key = property.key.name || property.key.value;

    if (key === 'styles') {
      return node;
    }

    if (t.isObjectExpression(property.value)) {
      const simplifiedChild = simplifyObject(property.value, t);

      if (!t.isStringLiteral(simplifiedChild)) {
        return node;
      }

      finalString += key + "{" + simplifiedChild.value + "}";
      continue;
    }

    const value = property.value.value;
    finalString += serializeStyles([(_ref = {}, _ref[key] = value, _ref)]).styles;
  }

  return t.stringLiteral(finalString);
}

const haveSameLocation = function haveSameLocation(element1, element2) {
  return element1.line === element2.line && element1.column === element2.column;
};

const isAutoInsertedRule = function isAutoInsertedRule(element) {
  return element.type === 'rule' && element.parent && haveSameLocation(element, element.parent);
};

const toInputTree = function toInputTree(elements, tree) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const parent = element.parent,
        children = element.children;

    if (!parent) {
      tree.push(element);
    } else if (!isAutoInsertedRule(element)) {
      parent.children.push(element);
    }

    if (Array.isArray(children)) {
      element.children = [];
      toInputTree(children, tree);
    }
  }

  return tree;
};

const stringifyTree = function stringifyTree(elements) {
  return elements.map(function (element) {
    switch (element.type) {
      case 'import':
      case 'decl':
        return element.value;

      case 'comm':
        // When we encounter a standard multi-line CSS comment and it contains a '@'
        // character, we keep the comment. Some Stylis plugins, such as
        // the stylis-rtl via the cssjanus plugin, use this special comment syntax
        // to control behavior (such as: /* @noflip */). We can do this
        // with standard CSS comments because they will work with compression,
        // as opposed to non-standard single-line comments that will break compressed CSS.
        return element.props === '/' && element.value.includes('@') ? element.value : '';

      case 'rule':
        return element.value.replace(/&\f/g, '&') + "{" + stringifyTree(element.children) + "}";

      default:
        {
          return element.value + "{" + stringifyTree(element.children) + "}";
        }
    }
  }).join('');
};

const interleave = function interleave(strings
/*: Array<*> */
, interpolations
/*: Array<*> */
) {
  return interpolations.reduce(function (array, interp, i) {
    return array.concat([interp], strings[i + 1]);
  }, [strings[0]]);
};

function getDynamicMatches(str
/*: string */
) {
  const re = /xxx(\d+):xxx/gm;
  let match;
  const matches = [];

  while ((match = re.exec(str)) !== null) {
    if (match !== null) {
      matches.push({
        value: match[0],
        p1: parseInt(match[1], 10),
        index: match.index
      });
    }
  }

  return matches;
}

function replacePlaceholdersWithExpressions(str
/*: string */
, expressions
/*: Array<*> */
, t) {
  const matches = getDynamicMatches(str);

  if (matches.length === 0) {
    if (str === '') {
      return [];
    }

    return [t.stringLiteral(str)];
  }

  const strings = [];
  const finalExpressions = [];
  let cursor = 0;
  matches.forEach(function (_ref, i) {
    const value = _ref.value,
        p1 = _ref.p1,
        index = _ref.index;
    const preMatch = str.substring(cursor, index);
    cursor = cursor + preMatch.length + value.length;

    if (!preMatch && i === 0) {
      strings.push(t.stringLiteral(''));
    } else {
      strings.push(t.stringLiteral(preMatch));
    }

    finalExpressions.push(expressions[p1]);

    if (i === matches.length - 1) {
      strings.push(t.stringLiteral(str.substring(index + value.length)));
    }
  });
  return interleave(strings, finalExpressions).filter(function (node
  /*: { value: string } */
  ) {
    return node.value !== '';
  });
}

function createRawStringFromTemplateLiteral(quasi
/*: {
quasis: Array<{ value: { cooked: string } }>
} */
) {
  const strs = quasi.quasis.map(function (x) {
    return x.value.cooked;
  });
  const src = strs.reduce(function (arr, str, i) {
    arr.push(str);

    if (i !== strs.length - 1) {
      arr.push("xxx" + i + ":xxx");
    }

    return arr;
  }, []).join('').trim();
  return src;
}

function minify(path, t) {
  const quasi = path.node.quasi;
  const raw = createRawStringFromTemplateLiteral(quasi);
  const minified = stringifyTree(toInputTree(compile(raw), []));
  const expressions = replacePlaceholdersWithExpressions(minified, quasi.expressions || [], t);
  path.replaceWith(t.callExpression(path.node.tag, expressions));
}

// this only works correctly in modules, but we don't run on scripts anyway, so it's fine
// the difference is that in modules template objects are being cached per call site
function getTypeScriptMakeTemplateObjectPath(path) {
  if (path.node.arguments.length === 0) {
    return null;
  }

  const firstArgPath = path.get('arguments')[0];

  if (firstArgPath.isLogicalExpression() && firstArgPath.get('left').isIdentifier() && firstArgPath.get('right').isAssignmentExpression() && firstArgPath.get('right.right').isCallExpression() && firstArgPath.get('right.right.callee').isIdentifier() && firstArgPath.node.right.right.callee.name.includes('makeTemplateObject') && firstArgPath.node.right.right.arguments.length === 2) {
    return firstArgPath.get('right.right');
  }

  return null;
} // this is only used to prevent appending strings/expressions to arguments incorectly
// we could push them to found array expressions, as we do it for TS-transpile output ¯\_(ツ)_/¯
// it seems overly complicated though - mainly because we'd also have to check against existing stuff of a particular type (source maps & labels)
// considering Babel double-transpilation as a valid use case seems rather far-fetched

function isTaggedTemplateTranspiledByBabel(path) {
  if (path.node.arguments.length === 0) {
    return false;
  }

  const firstArgPath = path.get('arguments')[0];

  if (!firstArgPath.isCallExpression() || !firstArgPath.get('callee').isIdentifier()) {
    return false;
  }

  const calleeName = firstArgPath.node.callee.name;

  if (!calleeName.includes('templateObject')) {
    return false;
  }

  const bindingPath = path.scope.getBinding(calleeName).path;

  if (!bindingPath.isFunction()) {
    return false;
  }

  const functionBody = bindingPath.get('body.body');

  if (!functionBody[0].isVariableDeclaration()) {
    return false;
  }

  const declarationInit = functionBody[0].get('declarations')[0].get('init');

  if (!declarationInit.isCallExpression()) {
    return false;
  }

  const declarationInitArguments = declarationInit.get('arguments');

  if (declarationInitArguments.length === 0 || declarationInitArguments.length > 2 || declarationInitArguments.some(function (argPath) {
    return !argPath.isArrayExpression();
  })) {
    return false;
  }

  return true;
}

const appendStringReturningExpressionToArguments = function appendStringReturningExpressionToArguments(t, path, expression) {
  const lastIndex = path.node.arguments.length - 1;
  const last = path.node.arguments[lastIndex];

  if (t.isStringLiteral(last)) {
    if (typeof expression === 'string') {
      path.node.arguments[lastIndex].value += expression;
    } else {
      path.node.arguments[lastIndex] = t.binaryExpression('+', last, expression);
    }
  } else {
    const makeTemplateObjectCallPath = getTypeScriptMakeTemplateObjectPath(path);

    if (makeTemplateObjectCallPath) {
      makeTemplateObjectCallPath.get('arguments').forEach(function (argPath) {
        const elements = argPath.get('elements');
        const lastElement = elements[elements.length - 1];

        if (typeof expression === 'string') {
          lastElement.replaceWith(t.stringLiteral(lastElement.node.value + expression));
        } else {
          lastElement.replaceWith(t.binaryExpression('+', lastElement.node, t.cloneNode(expression)));
        }
      });
    } else if (!isTaggedTemplateTranspiledByBabel(path)) {
      if (typeof expression === 'string') {
        path.node.arguments.push(t.stringLiteral(expression));
      } else {
        path.node.arguments.push(expression);
      }
    }
  }
};
const joinStringLiterals = function joinStringLiterals(expressions
/*: Array<*> */
, t) {
  return expressions.reduce(function (finalExpressions, currentExpression, i) {
    if (!t.isStringLiteral(currentExpression)) {
      finalExpressions.push(currentExpression);
    } else if (t.isStringLiteral(finalExpressions[finalExpressions.length - 1])) {
      finalExpressions[finalExpressions.length - 1].value += currentExpression.value;
    } else {
      finalExpressions.push(currentExpression);
    }

    return finalExpressions;
  }, []);
};

function createNodeEnvConditional(t, production, development) {
  return t.conditionalExpression(t.binaryExpression('===', t.memberExpression(t.memberExpression(t.identifier('process'), t.identifier('env')), t.identifier('NODE_ENV')), t.stringLiteral('production')), production, development);
}

const CSS_OBJECT_STRINGIFIED_ERROR = "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
const transformExpressionWithStyles = function transformExpressionWithStyles(_ref
/*: {
babel,
state,
path,
shouldLabel: boolean,
sourceMap?: string
} */
) {
  let babel = _ref.babel,
      state = _ref.state,
      path = _ref.path,
      shouldLabel = _ref.shouldLabel,
      _ref$sourceMap = _ref.sourceMap,
      sourceMap = _ref$sourceMap === void 0 ? '' : _ref$sourceMap;
  const autoLabel = state.opts.autoLabel || 'dev-only';
  const t = babel.types;

  if (t.isTaggedTemplateExpression(path)) {
    if (!sourceMap && state.emotionSourceMap && path.node.quasi.loc !== undefined) {
      sourceMap = getSourceMap(path.node.quasi.loc.start, state);
    }

    minify(path, t);
  }

  if (t.isCallExpression(path)) {
    const canAppendStrings = path.node.arguments.every(function (arg) {
      return arg.type !== 'SpreadElement';
    });
    path.get('arguments').forEach(function (node) {
      if (t.isObjectExpression(node)) {
        node.replaceWith(simplifyObject(node.node, t));
      }
    });
    path.node.arguments = joinStringLiterals(path.node.arguments, t);

    if (!sourceMap && canAppendStrings && state.emotionSourceMap && path.node.loc !== undefined) {
      sourceMap = getSourceMap(path.node.loc.start, state);
    }

    const label = shouldLabel && autoLabel !== 'never' ? getLabelFromPath(path, state, t) : null;

    if (path.node.arguments.length === 1 && t.isStringLiteral(path.node.arguments[0])) {
      const cssString = path.node.arguments[0].value.replace(/;$/, '');
      let res = serializeStyles(["" + cssString + (label && autoLabel === 'always' ? ";label:" + label + ";" : '')]);
      const prodNode = t.objectExpression([t.objectProperty(t.identifier('name'), t.stringLiteral(res.name)), t.objectProperty(t.identifier('styles'), t.stringLiteral(res.styles))]);

      if (!state.emotionStringifiedCssId) {
        const uid = state.file.scope.generateUidIdentifier('__EMOTION_STRINGIFIED_CSS_ERROR__');
        state.emotionStringifiedCssId = uid;
        const cssObjectToString = t.functionDeclaration(uid, [], t.blockStatement([t.returnStatement(t.stringLiteral(CSS_OBJECT_STRINGIFIED_ERROR))]));
        cssObjectToString._compact = true;
        state.file.path.unshiftContainer('body', [cssObjectToString]);
      }

      if (label && autoLabel === 'dev-only') {
        res = serializeStyles([cssString + ";label:" + label + ";"]);
      }

      const devNode = t.objectExpression([t.objectProperty(t.identifier('name'), t.stringLiteral(res.name)), t.objectProperty(t.identifier('styles'), t.stringLiteral(res.styles + sourceMap)), t.objectProperty(t.identifier('toString'), t.cloneNode(state.emotionStringifiedCssId))].filter(Boolean));
      return createNodeEnvConditional(t, prodNode, devNode);
    }

    if (canAppendStrings && label) {
      const labelString = ";label:" + label + ";";

      switch (autoLabel) {
        case 'dev-only':
          {
            const labelConditional = createNodeEnvConditional(t, t.stringLiteral(''), t.stringLiteral(labelString));
            appendStringReturningExpressionToArguments(t, path, labelConditional);
            break;
          }

        case 'always':
          appendStringReturningExpressionToArguments(t, path, labelString);
          break;
      }
    }

    if (sourceMap) {
      const sourceMapConditional = createNodeEnvConditional(t, t.stringLiteral(''), t.stringLiteral(sourceMap));
      appendStringReturningExpressionToArguments(t, path, sourceMapConditional);
    }
  }
};

const getKnownProperties = function getKnownProperties(t, node) {
  return new Set(node.properties.filter(function (n) {
    return t.isObjectProperty(n) && !n.computed;
  }).map(function (n) {
    return t.isIdentifier(n.key) ? n.key.name : n.key.value;
  }));
};

const createObjectSpreadLike = function createObjectSpreadLike(t, file) {
  for (var _len = arguments.length, objs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    objs[_key - 2] = arguments[_key];
  }

  return t.callExpression(file.addHelper('extends'), [t.objectExpression([])].concat(objs));
};

const getStyledOptions = function getStyledOptions(t, path, state) {
  const autoLabel = state.opts.autoLabel || 'dev-only';
  const args = path.node.arguments;
  const optionsArgument = args.length >= 2 ? args[1] : null;
  const prodProperties = [];
  let devProperties = null;
  const knownProperties = optionsArgument && t.isObjectExpression(optionsArgument) ? getKnownProperties(t, optionsArgument) : new Set();

  if (!knownProperties.has('target')) {
    prodProperties.push(t.objectProperty(t.identifier('target'), t.stringLiteral(getTargetClassName(state))));
  }

  const label = autoLabel !== 'never' && !knownProperties.has('label') ? getLabelFromPath(path, state, t) : null;

  if (label) {
    const labelNode = t.objectProperty(t.identifier('label'), t.stringLiteral(label));

    switch (autoLabel) {
      case 'always':
        prodProperties.push(labelNode);
        break;

      case 'dev-only':
        devProperties = [labelNode];
        break;
    }
  }

  if (optionsArgument) {
    // for some reason `.withComponent` transformer gets requeued
    // so check if this has been already transpiled to avoid double wrapping
    if (t.isConditionalExpression(optionsArgument) && t.isBinaryExpression(optionsArgument.test) && t.buildMatchMemberExpression('process.env.NODE_ENV')(optionsArgument.test.left)) {
      return optionsArgument;
    }

    if (!t.isObjectExpression(optionsArgument)) {
      const prodNode = createObjectSpreadLike(t, state.file, t.objectExpression(prodProperties), optionsArgument);
      return devProperties ? createNodeEnvConditional(t, prodNode, t.cloneNode(createObjectSpreadLike(t, state.file, t.objectExpression(prodProperties.concat(devProperties)), optionsArgument))) : prodNode;
    }

    prodProperties.unshift.apply(prodProperties, optionsArgument.properties);
  }

  return devProperties ? createNodeEnvConditional(t, t.objectExpression(prodProperties), t.cloneNode(t.objectExpression(prodProperties.concat(devProperties)))) : t.objectExpression(prodProperties);
};

function addImport(state, importSource
/*: string */
, importedSpecifier
/*: string */
, nameHint
/* ?: string */
) {
  const cacheKey = ['import', importSource, importedSpecifier].join(':');

  if (state[cacheKey] === undefined) {
    let importIdentifier;

    if (importedSpecifier === 'default') {
      importIdentifier = addDefault(state.file.path, importSource, {
        nameHint: nameHint
      });
    } else {
      importIdentifier = addNamed(state.file.path, importedSpecifier, importSource, {
        nameHint: nameHint
      });
    }

    state[cacheKey] = importIdentifier.name;
  }

  return {
    type: 'Identifier',
    name: state[cacheKey]
  };
}

/*
type Transformer = Function
*/

function createTransformerMacro(transformers
/*: { [key: string]: Transformer | [Transformer, Object] } */
, _ref
/*: { importSource: string } */
) {
  const importSource = _ref.importSource;
  const macro = createMacro(function (_ref2) {
    let path = _ref2.path,
        source = _ref2.source,
        references = _ref2.references,
        state = _ref2.state,
        babel = _ref2.babel,
        isEmotionCall = _ref2.isEmotionCall;

    if (!path) {
      path = state.file.scope.path.get('body').find(function (p) {
        return p.isImportDeclaration() && p.node.source.value === source;
      });
    }

    if (/\/macro$/.test(source)) {
      path.get('source').replaceWith(babel.types.stringLiteral(source.replace(/\/macro$/, '')));
    }

    if (!isEmotionCall) {
      state.emotionSourceMap = true;
    }

    Object.keys(references).forEach(function (importSpecifierName) {
      if (transformers[importSpecifierName]) {
        references[importSpecifierName].reverse().forEach(function (reference) {
          let options;
          let transformer;

          if (Array.isArray(transformers[importSpecifierName])) {
            transformer = transformers[importSpecifierName][0];
            options = transformers[importSpecifierName][1];
          } else {
            transformer = transformers[importSpecifierName];
            options = {};
          }

          transformer({
            state: state,
            babel: babel,
            path: path,
            importSource: importSource,
            importSpecifierName: importSpecifierName,
            options: options,
            reference: reference
          });
        });
      }
    });
    return {
      keepImports: true
    };
  });
  macro.transformers = transformers;
  return macro;
}

const isAlreadyTranspiled = function isAlreadyTranspiled(path) {
  if (!path.isCallExpression()) {
    return false;
  }

  const firstArgPath = path.get('arguments.0');

  if (!firstArgPath) {
    return false;
  }

  if (!firstArgPath.isConditionalExpression()) {
    return false;
  }

  const alternatePath = firstArgPath.get('alternate');

  if (!alternatePath.isObjectExpression()) {
    return false;
  }

  const properties = new Set(alternatePath.get('properties').map(function (p) {
    return p.node.key.name;
  }));
  return ['name', 'styles'].every(function (p) {
    return properties.has(p);
  });
};

const createEmotionTransformer = function createEmotionTransformer(isPure
/*: boolean */
) {
  return function (_ref
  /*: Object */
  ) {
    const state = _ref.state,
        babel = _ref.babel;
        _ref.importSource;
        const reference = _ref.reference;
        _ref.importSpecifierName;
    const path = reference.parentPath;

    if (isAlreadyTranspiled(path)) {
      return;
    }

    if (isPure) {
      path.addComment('leading', '#__PURE__');
    }

    const node = transformExpressionWithStyles({
      babel: babel,
      state: state,
      path: path,
      shouldLabel: true
    });

    if (node) {
      path.node.arguments[0] = node;
    }
  };
};

const transformers$1 = {
  css: createEmotionTransformer(true),
  injectGlobal: createEmotionTransformer(false),
  keyframes: createEmotionTransformer(true)
};
const createEmotionMacro = function createEmotionMacro(importSource
/*: string */
) {
  return createTransformerMacro(transformers$1, {
    importSource: importSource
  });
};

const getReferencedSpecifier = function getReferencedSpecifier(path, specifierName) {
  const specifiers = path.get('specifiers');
  return specifierName === 'default' ? specifiers.find(function (p) {
    return p.isImportDefaultSpecifier();
  }) : specifiers.find(function (p) {
    return p.node.local.name === specifierName;
  });
};

const styledTransformer = function styledTransformer(_ref
/*: {
state: Object,
babel: Object,
path: any,
importSource: string,
importSpecifierName: string,
reference: Object,
options: { styledBaseImport?: [string, string], isWeb: boolean }
} */
) {
  const state = _ref.state,
      babel = _ref.babel,
      path = _ref.path,
      importSource = _ref.importSource,
      reference = _ref.reference,
      importSpecifierName = _ref.importSpecifierName,
      _ref$options = _ref.options,
      styledBaseImport = _ref$options.styledBaseImport,
      isWeb = _ref$options.isWeb;
  const t = babel.types;

  const getStyledIdentifier = function getStyledIdentifier() {
    if (!styledBaseImport || styledBaseImport[0] === importSource && styledBaseImport[1] === importSpecifierName) {
      return t.cloneNode(reference.node);
    }

    if (path.node) {
      const referencedSpecifier = getReferencedSpecifier(path, importSpecifierName);

      if (referencedSpecifier) {
        referencedSpecifier.remove();
      }

      if (!path.get('specifiers').length) {
        path.remove();
      }
    }

    const baseImportSource = styledBaseImport[0],
        baseSpecifierName = styledBaseImport[1];
    return addImport(state, baseImportSource, baseSpecifierName, 'styled');
  };

  let createStyledComponentPath = null;

  if (t.isMemberExpression(reference.parent) && reference.parent.computed === false) {
    if ( // checks if the first character is lowercase
    // becasue we don't want to transform the member expression if
    // it's in primitives/native
    reference.parent.property.name.charCodeAt(0) > 96) {
      reference.parentPath.replaceWith(t.callExpression(getStyledIdentifier(), [t.stringLiteral(reference.parent.property.name)]));
    } else {
      reference.replaceWith(getStyledIdentifier());
    }

    createStyledComponentPath = reference.parentPath;
  } else if (reference.parentPath && t.isCallExpression(reference.parentPath) && reference.parent.callee === reference.node) {
    reference.replaceWith(getStyledIdentifier());
    createStyledComponentPath = reference.parentPath;
  }

  if (!createStyledComponentPath) {
    return;
  }

  const styledCallLikeWithStylesPath = createStyledComponentPath.parentPath;
  const node = transformExpressionWithStyles({
    path: styledCallLikeWithStylesPath,
    state: state,
    babel: babel,
    shouldLabel: false
  });

  if (node && isWeb) {
    // we know the argument length will be 1 since that's the only time we will have a node since it will be static
    styledCallLikeWithStylesPath.node.arguments[0] = node;
  }

  styledCallLikeWithStylesPath.addComment('leading', '#__PURE__');

  if (isWeb) {
    createStyledComponentPath.node.arguments[1] = getStyledOptions(t, createStyledComponentPath, state);
  }
};
const createStyledMacro = function createStyledMacro(_ref2
/*: {
importSource: string,
originalImportSource?: string,
baseImportName?: string,
isWeb: boolean
} */
) {
  const importSource = _ref2.importSource,
      _ref2$originalImportS = _ref2.originalImportSource,
      originalImportSource = _ref2$originalImportS === void 0 ? importSource : _ref2$originalImportS,
      _ref2$baseImportName = _ref2.baseImportName,
      baseImportName = _ref2$baseImportName === void 0 ? 'default' : _ref2$baseImportName,
      isWeb = _ref2.isWeb;
  return createTransformerMacro({
    "default": [styledTransformer, {
      styledBaseImport: [importSource, baseImportName],
      isWeb: isWeb
    }]
  }, {
    importSource: originalImportSource
  });
};

const transformCssCallExpression = function transformCssCallExpression(_ref
/*: {
state: *,
babel: *,
path: *,
sourceMap?: string,
annotateAsPure?: boolean
} */
) {
  const state = _ref.state,
      babel = _ref.babel,
      path = _ref.path,
      sourceMap = _ref.sourceMap,
      _ref$annotateAsPure = _ref.annotateAsPure,
      annotateAsPure = _ref$annotateAsPure === void 0 ? true : _ref$annotateAsPure;
  const node = transformExpressionWithStyles({
    babel: babel,
    state: state,
    path: path,
    shouldLabel: true,
    sourceMap: sourceMap
  });

  if (node) {
    path.replaceWith(node);
    path.hoist();
  } else if (annotateAsPure && path.isCallExpression()) {
    path.addComment('leading', '#__PURE__');
  }
};
const transformCsslessArrayExpression = function transformCsslessArrayExpression(_ref2
/*: {
babel: *,
state: *,
path: *
} */
) {
  const state = _ref2.state,
      babel = _ref2.babel,
      path = _ref2.path;
  const t = babel.types;
  const expressionPath = path.get('value.expression');
  const sourceMap = state.emotionSourceMap && path.node.loc !== undefined ? getSourceMap(path.node.loc.start, state) : '';
  expressionPath.replaceWith(t.callExpression( // the name of this identifier doesn't really matter at all
  // it'll never appear in generated code
  t.identifier('___shouldNeverAppearCSS'), path.node.value.expression.elements));
  transformCssCallExpression({
    babel: babel,
    state: state,
    path: expressionPath,
    sourceMap: sourceMap,
    annotateAsPure: false
  });

  if (t.isCallExpression(expressionPath)) {
    expressionPath.replaceWith(t.arrayExpression(expressionPath.node.arguments));
  }
};
const transformCsslessObjectExpression = function transformCsslessObjectExpression(_ref3
/*: {
babel: *,
state: *,
path: *,
cssImport: { importSource: string, cssExport: string }
} */
) {
  const state = _ref3.state,
      babel = _ref3.babel,
      path = _ref3.path,
      cssImport = _ref3.cssImport;
  const t = babel.types;
  const expressionPath = path.get('value.expression');
  const sourceMap = state.emotionSourceMap && path.node.loc !== undefined ? getSourceMap(path.node.loc.start, state) : '';
  expressionPath.replaceWith(t.callExpression( // the name of this identifier doesn't really matter at all
  // it'll never appear in generated code
  t.identifier('___shouldNeverAppearCSS'), [path.node.value.expression]));
  transformCssCallExpression({
    babel: babel,
    state: state,
    path: expressionPath,
    sourceMap: sourceMap
  });

  if (t.isCallExpression(expressionPath)) {
    expressionPath.get('callee').replaceWith(addImport(state, cssImport.importSource, cssImport.cssExport, 'css'));
  }
};

const cssTransformer = function cssTransformer(_ref4
/*: {
state: any,
babel: any,
reference: any
} */
) {
  const state = _ref4.state,
      babel = _ref4.babel,
      reference = _ref4.reference;
  transformCssCallExpression({
    babel: babel,
    state: state,
    path: reference.parentPath
  });
};

const globalTransformer = function globalTransformer(_ref5
/*: {
state: any,
babel: any,
reference: any,
importSource: string,
options: { cssExport?: string }
} */
) {
  const state = _ref5.state,
      babel = _ref5.babel,
      reference = _ref5.reference,
      importSource = _ref5.importSource,
      options = _ref5.options;
  const t = babel.types;

  if (!t.isJSXIdentifier(reference.node) || !t.isJSXOpeningElement(reference.parentPath.node)) {
    return;
  }

  const stylesPropPath = reference.parentPath.get('attributes').find(function (p) {
    return t.isJSXAttribute(p.node) && p.node.name.name === 'styles';
  });

  if (!stylesPropPath) {
    return;
  }

  if (t.isJSXExpressionContainer(stylesPropPath.node.value)) {
    if (t.isArrayExpression(stylesPropPath.node.value.expression)) {
      transformCsslessArrayExpression({
        state: state,
        babel: babel,
        path: stylesPropPath
      });
    } else if (t.isObjectExpression(stylesPropPath.node.value.expression)) {
      transformCsslessObjectExpression({
        state: state,
        babel: babel,
        path: stylesPropPath,
        cssImport: options.cssExport !== undefined ? {
          importSource: importSource,
          cssExport: options.cssExport
        } : {
          importSource: '@emotion/react',
          cssExport: 'css'
        }
      });
    }
  }
};

const transformers = {
  // this is an empty function because this transformer is never called
  // we don't run any transforms on `jsx` directly
  // instead we use it as a hint to enable css prop optimization
  jsx: function jsx() {},
  css: cssTransformer,
  Global: globalTransformer
};
const coreMacro = createTransformerMacro(transformers, {
  importSource: '@emotion/react'
});

const _excluded = ["canonicalImport"];

const getCssExport = function getCssExport(reexported, importSource, mapping) {
  const cssExport = Object.keys(mapping).find(function (localExportName) {
    const _mapping$localExportN = mapping[localExportName].canonicalImport,
        packageName = _mapping$localExportN[0],
        exportName = _mapping$localExportN[1];
    return packageName === '@emotion/react' && exportName === 'css';
  });

  if (!cssExport) {
    throw new Error("You have specified that '" + importSource + "' re-exports '" + reexported + "' from '@emotion/react' but it doesn't also re-export 'css' from '@emotion/react', 'css' is necessary for certain optimisations, please re-export it from '" + importSource + "'");
  }

  return cssExport;
};

const webStyledMacro = createStyledMacro({
  importSource: '@emotion/styled/base',
  originalImportSource: '@emotion/styled',
  isWeb: true
});
const nativeStyledMacro = createStyledMacro({
  importSource: '@emotion/native',
  originalImportSource: '@emotion/native',
  isWeb: false
});
const primitivesStyledMacro = createStyledMacro({
  importSource: '@emotion/primitives',
  originalImportSource: '@emotion/primitives',
  isWeb: false
});
const vanillaEmotionMacro = createEmotionMacro('@emotion/css');
const transformersSource = {
  '@emotion/css': transformers$1,
  '@emotion/react': transformers,
  '@emotion/styled': {
    "default": [styledTransformer, {
      styledBaseImport: ['@emotion/styled/base', 'default'],
      isWeb: true
    }]
  },
  '@emotion/primitives': {
    "default": [styledTransformer, {
      isWeb: false
    }]
  },
  '@emotion/native': {
    "default": [styledTransformer, {
      isWeb: false
    }]
  }
};
const macros = {
  core: coreMacro,
  nativeStyled: nativeStyledMacro,
  primitivesStyled: primitivesStyledMacro,
  webStyled: webStyledMacro,
  vanillaEmotion: vanillaEmotionMacro
};
/*
export type BabelPath = any

export type EmotionBabelPluginPass = any
*/

const AUTO_LABEL_VALUES = ['dev-only', 'never', 'always'];
function index (babel, options) {
  if (options.autoLabel !== undefined && !AUTO_LABEL_VALUES.includes(options.autoLabel)) {
    throw new Error("The 'autoLabel' option must be undefined, or one of the following: " + AUTO_LABEL_VALUES.map(function (s) {
      return "\"" + s + "\"";
    }).join(', '));
  }

  const t = babel.types;
  return {
    name: '@emotion',
    // https://github.com/babel/babel/blob/0c97749e0fe8ad845b902e0b23a24b308b0bf05d/packages/babel-plugin-syntax-jsx/src/index.ts#L9-L18
    manipulateOptions: function manipulateOptions(opts, parserOpts) {
      const plugins = parserOpts.plugins;

      if (plugins.some(function (p) {
        const plugin = Array.isArray(p) ? p[0] : p;
        return plugin === 'typescript' || plugin === 'jsx';
      })) {
        return;
      }

      plugins.push('jsx');
    },
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        const macro = state.pluginMacros[path.node.source.value]; // most of this is from https://github.com/kentcdodds/babel-plugin-macros/blob/main/src/index.js

        if (macro === undefined) {
          return;
        }

        if (t.isImportNamespaceSpecifier(path.node.specifiers[0])) {
          return;
        }

        const imports = path.node.specifiers.map(function (s) {
          return {
            localName: s.local.name,
            importedName: s.type === 'ImportDefaultSpecifier' ? 'default' : s.imported.name
          };
        });
        let shouldExit = false;
        let hasReferences = false;
        const referencePathsByImportName = imports.reduce(function (byName, _ref) {
          const importedName = _ref.importedName,
              localName = _ref.localName;
          const binding = path.scope.getBinding(localName);

          if (!binding) {
            shouldExit = true;
            return byName;
          }

          byName[importedName] = binding.referencePaths;
          hasReferences = hasReferences || Boolean(byName[importedName].length);
          return byName;
        }, {});

        if (!hasReferences || shouldExit) {
          return;
        }
        /**
         * Other plugins that run before babel-plugin-macros might use path.replace, where a path is
         * put into its own replacement. Apparently babel does not update the scope after such
         * an operation. As a remedy, the whole scope is traversed again with an empty "Identifier"
         * visitor - this makes the problem go away.
         *
         * See: https://github.com/kentcdodds/import-all.macro/issues/7
         */


        state.file.scope.path.traverse({
          Identifier: function Identifier() {}
        });
        macro({
          path: path,
          references: referencePathsByImportName,
          state: state,
          babel: babel,
          isEmotionCall: true,
          isBabelMacrosCall: true
        });
      },
      Program: function Program(path, state) {
        const macros = {};
        const jsxReactImports
        /*: Array<{
        importSource: string,
        export: string,
        cssExport: string
        }> */
        = [{
          importSource: '@emotion/react',
          "export": 'jsx',
          cssExport: 'css'
        }];
        state.jsxReactImport = jsxReactImports[0];
        Object.keys(state.opts.importMap || {}).forEach(function (importSource) {
          const value = state.opts.importMap[importSource];
          const transformers = {};
          Object.keys(value).forEach(function (localExportName) {
            const _value$localExportNam = value[localExportName],
                canonicalImport = _value$localExportNam.canonicalImport,
                options = _objectWithoutPropertiesLoose(_value$localExportNam, _excluded);

            const packageName = canonicalImport[0],
                exportName = canonicalImport[1];

            if (packageName === '@emotion/react' && exportName === 'jsx') {
              jsxReactImports.push({
                importSource: importSource,
                "export": localExportName,
                cssExport: getCssExport('jsx', importSource, value)
              });
              return;
            }

            const packageTransformers = transformersSource[packageName];

            if (packageTransformers === undefined) {
              throw new Error("There is no transformer for the export '" + exportName + "' in '" + packageName + "'");
            }

            let extraOptions;

            if (packageName === '@emotion/react' && exportName === 'Global') {
              // this option is not supposed to be set in importMap
              extraOptions = {
                cssExport: getCssExport('Global', importSource, value)
              };
            } else if (packageName === '@emotion/styled' && exportName === 'default') {
              // this is supposed to override defaultOptions value
              // and let correct value to be set if coming in options
              extraOptions = {
                styledBaseImport: undefined
              };
            }

            const _ref2 = Array.isArray(packageTransformers[exportName]) ? packageTransformers[exportName] : [packageTransformers[exportName]],
                exportTransformer = _ref2[0],
                defaultOptions = _ref2[1];

            transformers[localExportName] = [exportTransformer, _extends({}, defaultOptions, extraOptions, options)];
          });
          macros[importSource] = createTransformerMacro(transformers, {
            importSource: importSource
          });
        });
        state.pluginMacros = _extends({
          '@emotion/styled': webStyledMacro,
          '@emotion/react': coreMacro,
          '@emotion/primitives': primitivesStyledMacro,
          '@emotion/native': nativeStyledMacro,
          '@emotion/css': vanillaEmotionMacro
        }, macros);

        const _loop = function _loop() {
          const node = _step.value;

          if (t.isImportDeclaration(node)) {
            const jsxReactImport = jsxReactImports.find(function (thing) {
              return node.source.value === thing.importSource && node.specifiers.some(function (x) {
                return t.isImportSpecifier(x) && x.imported.name === thing["export"];
              });
            });

            if (jsxReactImport) {
              state.jsxReactImport = jsxReactImport;
              return "break";
            }
          }
        };

        for (var _iterator = _createForOfIteratorHelperLoose(path.node.body), _step; !(_step = _iterator()).done;) {
          const _ret = _loop();

          if (_ret === "break") break;
        }

        if (state.opts.cssPropOptimization === false) {
          state.transformCssProp = false;
        } else {
          state.transformCssProp = true;
        }

        if (state.opts.sourceMap === false) {
          state.emotionSourceMap = false;
        } else {
          state.emotionSourceMap = true;
        }
      },
      JSXAttribute: function JSXAttribute(path, state) {
        if (path.node.name.name !== 'css' || !state.transformCssProp) {
          return;
        }

        if (t.isJSXExpressionContainer(path.node.value)) {
          if (t.isArrayExpression(path.node.value.expression)) {
            transformCsslessArrayExpression({
              state: state,
              babel: babel,
              path: path
            });
          } else if (t.isObjectExpression(path.node.value.expression)) {
            transformCsslessObjectExpression({
              state: state,
              babel: babel,
              path: path,
              cssImport: state.jsxReactImport
            });
          }
        }
      },
      CallExpression: {
        exit: function exit(path
        /*: BabelPath */
        , state
        /*: EmotionBabelPluginPass */
        ) {
          try {
            if (path.node.callee && path.node.callee.property && path.node.callee.property.name === 'withComponent') {
              switch (path.node.arguments.length) {
                case 1:
                case 2:
                  {
                    path.node.arguments[1] = getStyledOptions(t, path, state);
                  }
              }
            }
          } catch (e) {
            throw path.buildCodeFrameError(e);
          }
        }
      }
    }
  };
}

export { index as default, macros };
