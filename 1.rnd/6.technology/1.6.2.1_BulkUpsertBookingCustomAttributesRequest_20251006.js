"use strict";
exports.__esModule = true;
exports.bulkUpsertBookingCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bookingCustomAttributeUpsertRequest_1 = require("./bookingCustomAttributeUpsertRequest");
exports.bulkUpsertBookingCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () { return bookingCustomAttributeUpsertRequest_1.bookingCustomAttributeUpsertRequestSchema; })),
    ]
});
//# sourceMappingURL=bulkUpsertBookingCustomAttributesRequest.js.map