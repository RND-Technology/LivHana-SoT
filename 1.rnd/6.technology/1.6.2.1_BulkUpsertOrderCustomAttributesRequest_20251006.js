"use strict";
exports.__esModule = true;
exports.bulkUpsertOrderCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bulkUpsertOrderCustomAttributesRequestUpsertCustomAttribute_1 = require("./bulkUpsertOrderCustomAttributesRequestUpsertCustomAttribute");
exports.bulkUpsertOrderCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkUpsertOrderCustomAttributesRequestUpsertCustomAttribute_1.bulkUpsertOrderCustomAttributesRequestUpsertCustomAttributeSchema;
        })),
    ]
});
//# sourceMappingURL=bulkUpsertOrderCustomAttributesRequest.js.map