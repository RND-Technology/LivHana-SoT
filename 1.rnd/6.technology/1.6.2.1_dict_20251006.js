import { __spreadArray, __read } from 'tslib';
import { objectEntries } from '../utils.js';

/**
 * Create a dictionary schema.
 *
 * This can be used to map/unmap a type like Record<string, something>.
 */
function dict(itemSchema) {
  const validate = function (validateFn, value, ctxt) {
    if (typeof value !== 'object' || value === null) {
      return ctxt.fail();
    }
    const valueObject = value;
    return ctxt.flatmapChildren(objectEntries(valueObject), itemSchema, function (v, childCtxt) {
      return itemSchema[validateFn](v[1], childCtxt);
    });
  };
  return {
    type: function () {
      return "Record<string,".concat(itemSchema.type(), ">");
    },
    validateBeforeMap: function () {
      const args = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return validate.apply(void 0, __spreadArray(['validateBeforeMap'], __read(args), false));
    },
    validateBeforeUnmap: function () {
      const args = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return validate.apply(void 0, __spreadArray(['validateBeforeUnmap'], __read(args), false));
    },
    map: function (value, ctxt) {
      const output = {};
      for (const key in value) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propValue = value[key];
          output[key] = itemSchema.map(propValue, ctxt.createChild(key, propValue, itemSchema));
        }
      }
      return output;
    },
    unmap: function (value, ctxt) {
      const output = {};
      for (const key in value) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propValue = value[key];
          output[key] = itemSchema.unmap(propValue, ctxt.createChild(key, propValue, itemSchema));
        }
      }
      return output;
    },
    validateBeforeMapXml: function () {
      const args = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return validate.apply(void 0, __spreadArray(['validateBeforeMapXml'], __read(args), false));
    },
    mapXml: function (value, ctxt) {
      const output = {};
      for (const key in value) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propValue = value[key];
          output[key] = itemSchema.mapXml(propValue, ctxt.createChild(key, propValue, itemSchema));
        }
      }
      return output;
    },
    unmapXml: function (value, ctxt) {
      const output = {};
      for (const key in value) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propValue = value[key];
          output[key] = itemSchema.unmapXml(propValue, ctxt.createChild(key, propValue, itemSchema));
        }
      }
      return output;
    }
  };
}
export { dict };