"use strict";
exports.__esModule = true;
exports.bulkDeleteLocationCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bulkDeleteLocationCustomAttributesRequestLocationCustomAttributeDeleteRequest_1 = require("./bulkDeleteLocationCustomAttributesRequestLocationCustomAttributeDeleteRequest");
exports.bulkDeleteLocationCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkDeleteLocationCustomAttributesRequestLocationCustomAttributeDeleteRequest_1.bulkDeleteLocationCustomAttributesRequestLocationCustomAttributeDeleteRequestSchema;
        })),
    ]
});
//# sourceMappingURL=bulkDeleteLocationCustomAttributesRequest.js.map