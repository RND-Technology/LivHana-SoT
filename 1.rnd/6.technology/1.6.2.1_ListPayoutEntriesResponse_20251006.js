"use strict";
exports.__esModule = true;
exports.listPayoutEntriesResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const payoutEntry_1 = require("./payoutEntry");
exports.listPayoutEntriesResponseSchema = (0, schema_1.object)({
    payoutEntries: [
        'payout_entries',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return payoutEntry_1.payoutEntrySchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listPayoutEntriesResponse.js.map