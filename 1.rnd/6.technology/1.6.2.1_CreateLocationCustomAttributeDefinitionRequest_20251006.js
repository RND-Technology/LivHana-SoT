"use strict";
exports.__esModule = true;
exports.createLocationCustomAttributeDefinitionRequestSchema = void 0;
const schema_1 = require("../schema");
const customAttributeDefinition_1 = require("./customAttributeDefinition");
exports.createLocationCustomAttributeDefinitionRequestSchema = (0, schema_1.object)({
    customAttributeDefinition: [
        'custom_attribute_definition',
        (0, schema_1.lazy)(function () { return customAttributeDefinition_1.customAttributeDefinitionSchema; }),
    ],
    idempotencyKey: ['idempotency_key', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=createLocationCustomAttributeDefinitionRequest.js.map