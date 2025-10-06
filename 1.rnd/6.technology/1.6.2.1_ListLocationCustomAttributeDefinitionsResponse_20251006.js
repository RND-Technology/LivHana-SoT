"use strict";
exports.__esModule = true;
exports.listLocationCustomAttributeDefinitionsResponseSchema = void 0;
const schema_1 = require("../schema");
const customAttributeDefinition_1 = require("./customAttributeDefinition");
const error_1 = require("./error");
exports.listLocationCustomAttributeDefinitionsResponseSchema = (0, schema_1.object)({
    customAttributeDefinitions: [
        'custom_attribute_definitions',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return customAttributeDefinition_1.customAttributeDefinitionSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listLocationCustomAttributeDefinitionsResponse.js.map