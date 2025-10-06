"use strict";
exports.__esModule = true;
exports.updateBookingRequestSchema = void 0;
const schema_1 = require("../schema");
const booking_1 = require("./booking");
exports.updateBookingRequestSchema = (0, schema_1.object)({
    idempotencyKey: ['idempotency_key', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    booking: ['booking', (0, schema_1.lazy)(function () { return booking_1.bookingSchema; })]
});
//# sourceMappingURL=updateBookingRequest.js.map