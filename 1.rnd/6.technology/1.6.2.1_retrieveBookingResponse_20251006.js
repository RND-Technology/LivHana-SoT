"use strict";
exports.__esModule = true;
exports.retrieveBookingResponseSchema = void 0;
const schema_1 = require("../schema");
const booking_1 = require("./booking");
const error_1 = require("./error");
exports.retrieveBookingResponseSchema = (0, schema_1.object)({
    booking: ['booking', (0, schema_1.optional)((0, schema_1.lazy)(function () { return booking_1.bookingSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=retrieveBookingResponse.js.map