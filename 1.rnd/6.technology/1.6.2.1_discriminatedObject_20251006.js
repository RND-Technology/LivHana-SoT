import { __read } from 'tslib';
import { objectEntries } from '../utils.js';
function discriminatedObject(discriminatorMappedPropName, discriminatorPropName, discriminatorMap, defaultDiscriminator, xmlOptions) {
  const selectSchemaWithDisc = function (value, discriminatorProp, isAttr) {
    if (typeof value === 'object' && value !== null && (isAttr && xmlObjectHasAttribute(value, discriminatorProp) || !isAttr && discriminatorProp in value)) {
      const discriminatorValue = isAttr ? value.$[discriminatorProp] : value[discriminatorProp];
      if (typeof discriminatorValue === 'string' && discriminatorValue in discriminatorMap) {
        return discriminatorMap[discriminatorValue];
      }
    }
    return undefined;
  };
  const allSchemas = Object.values(discriminatorMap).reverse();
  const selectSchema = function (value, discriminatorProp, validater, isAttr) {
    const schema = selectSchemaWithDisc(value, discriminatorProp, isAttr);
    if (typeof schema !== 'undefined') {
      return schema;
    }
    // Try checking with discriminator matching
    for (const key in allSchemas) {
      if (validater(allSchemas[key]).length === 0) {
        return allSchemas[key];
      }
    }
    // Fallback to default schema
    return discriminatorMap[defaultDiscriminator];
  };
  const mapJsonSchema = function (value, ctxt) {
    return selectSchema(value, discriminatorPropName, function (schema) {
      return schema.validateBeforeMap(value, ctxt);
    });
  };
  const mapXmlSchema = function (value, ctxt) {
    let _a;
    return selectSchema(value, (_a = xmlOptions === null || xmlOptions === void 0 ? void 0 : xmlOptions.xmlName) !== null && _a !== void 0 ? _a : discriminatorPropName, function (schema) {
      return schema.validateBeforeMapXml(value, ctxt);
    }, xmlOptions === null || xmlOptions === void 0 ? void 0 : xmlOptions.isAttr);
  };
  const unmapSchema = function (value, ctxt) {
    return selectSchema(value, discriminatorMappedPropName, function (schema) {
      return schema.validateBeforeUnmap(value, ctxt);
    });
  };
  return {
    type: function () {
      return "DiscriminatedUnion<".concat(discriminatorPropName, ",[").concat(objectEntries(discriminatorMap).map(function (_a) {
        const _b = __read(_a, 2);
        _b[0];
        const v = _b[1];
        return v.type;
      }).join(','), "]>");
    },
    map: function (value, ctxt) {
      return mapJsonSchema(value, ctxt).map(value, ctxt);
    },
    unmap: function (value, ctxt) {
      return unmapSchema(value, ctxt).unmap(value, ctxt);
    },
    validateBeforeMap: function (value, ctxt) {
      return mapJsonSchema(value, ctxt).validateBeforeMap(value, ctxt);
    },
    validateBeforeUnmap: function (value, ctxt) {
      return unmapSchema(value, ctxt).validateBeforeUnmap(value, ctxt);
    },
    mapXml: function (value, ctxt) {
      return mapXmlSchema(value, ctxt).mapXml(value, ctxt);
    },
    unmapXml: function (value, ctxt) {
      return unmapSchema(value, ctxt).unmapXml(value, ctxt);
    },
    validateBeforeMapXml: function (value, ctxt) {
      return mapXmlSchema(value, ctxt).validateBeforeMapXml(value, ctxt);
    }
  };
}
function xmlObjectHasAttribute(value, prop) {
  return '$' in value && typeof value.$ === 'object' && prop in value.$;
}
export { discriminatedObject };