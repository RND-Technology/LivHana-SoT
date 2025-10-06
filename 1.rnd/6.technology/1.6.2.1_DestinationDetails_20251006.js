"use strict";
exports.__esModule = true;
exports.destinationDetailsSchema = void 0;
const schema_1 = require("../schema");
const destinationDetailsCardRefundDetails_1 = require("./destinationDetailsCardRefundDetails");
const destinationDetailsCashRefundDetails_1 = require("./destinationDetailsCashRefundDetails");
const destinationDetailsExternalRefundDetails_1 = require("./destinationDetailsExternalRefundDetails");
exports.destinationDetailsSchema = (0, schema_1.object)({
    cardDetails: [
        'card_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return destinationDetailsCardRefundDetails_1.destinationDetailsCardRefundDetailsSchema; })),
    ],
    cashDetails: [
        'cash_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return destinationDetailsCashRefundDetails_1.destinationDetailsCashRefundDetailsSchema; })),
    ],
    externalDetails: [
        'external_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return destinationDetailsExternalRefundDetails_1.destinationDetailsExternalRefundDetailsSchema; })),
    ]
});
//# sourceMappingURL=destinationDetails.js.map