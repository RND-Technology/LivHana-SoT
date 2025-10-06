"use strict";
exports.__esModule = true;
exports.loyaltyEventFilterSchema = void 0;
const schema_1 = require("../schema");
const loyaltyEventDateTimeFilter_1 = require("./loyaltyEventDateTimeFilter");
const loyaltyEventLocationFilter_1 = require("./loyaltyEventLocationFilter");
const loyaltyEventLoyaltyAccountFilter_1 = require("./loyaltyEventLoyaltyAccountFilter");
const loyaltyEventOrderFilter_1 = require("./loyaltyEventOrderFilter");
const loyaltyEventTypeFilter_1 = require("./loyaltyEventTypeFilter");
exports.loyaltyEventFilterSchema = (0, schema_1.object)({
    loyaltyAccountFilter: [
        'loyalty_account_filter',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventLoyaltyAccountFilter_1.loyaltyEventLoyaltyAccountFilterSchema; })),
    ],
    typeFilter: [
        'type_filter',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventTypeFilter_1.loyaltyEventTypeFilterSchema; })),
    ],
    dateTimeFilter: [
        'date_time_filter',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventDateTimeFilter_1.loyaltyEventDateTimeFilterSchema; })),
    ],
    locationFilter: [
        'location_filter',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventLocationFilter_1.loyaltyEventLocationFilterSchema; })),
    ],
    orderFilter: [
        'order_filter',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventOrderFilter_1.loyaltyEventOrderFilterSchema; })),
    ]
});
//# sourceMappingURL=loyaltyEventFilter.js.map