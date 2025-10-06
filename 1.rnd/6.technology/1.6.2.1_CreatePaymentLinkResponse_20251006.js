"use strict";
exports.__esModule = true;
exports.createPaymentLinkResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const paymentLink_1 = require("./paymentLink");
const paymentLinkRelatedResources_1 = require("./paymentLinkRelatedResources");
exports.createPaymentLinkResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    paymentLink: ['payment_link', (0, schema_1.optional)((0, schema_1.lazy)(function () { return paymentLink_1.paymentLinkSchema; }))],
    relatedResources: [
        'related_resources',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return paymentLinkRelatedResources_1.paymentLinkRelatedResourcesSchema; })),
    ]
});
//# sourceMappingURL=createPaymentLinkResponse.js.map