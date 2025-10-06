"use strict";
exports.__esModule = true;
exports.updateBookingCustomAttributeDefinitionResponseSchema = void 0;
const schema_1 = require("../schema");
const customAttributeDefinition_1 = require("./customAttributeDefinition");
const error_1 = require("./error");
exports.updateBookingCustomAttributeDefinitionResponseSchema = (0, schema_1.object)({
    customAttributeDefinition: [
        'custom_attribute_definition',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return customAttributeDefinition_1.customAttributeDefinitionSchema; })),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=updateBookingCustomAttributeDefinitionResponse.js.map