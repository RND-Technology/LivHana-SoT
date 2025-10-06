"use strict";
exports.__esModule = true;
exports.bulkDeleteBookingCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bookingCustomAttributeDeleteRequest_1 = require("./bookingCustomAttributeDeleteRequest");
exports.bulkDeleteBookingCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () { return bookingCustomAttributeDeleteRequest_1.bookingCustomAttributeDeleteRequestSchema; })),
    ]
});
//# sourceMappingURL=bulkDeleteBookingCustomAttributesRequest.js.map