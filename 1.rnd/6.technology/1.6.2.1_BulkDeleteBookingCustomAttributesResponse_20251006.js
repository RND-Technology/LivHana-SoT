"use strict";
exports.__esModule = true;
exports.bulkDeleteBookingCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const bookingCustomAttributeDeleteResponse_1 = require("./bookingCustomAttributeDeleteResponse");
const error_1 = require("./error");
exports.bulkDeleteBookingCustomAttributesResponseSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.optional)((0, schema_1.dict)((0, schema_1.lazy)(function () { return bookingCustomAttributeDeleteResponse_1.bookingCustomAttributeDeleteResponseSchema; }))),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=bulkDeleteBookingCustomAttributesResponse.js.map