"use strict";
exports.__esModule = true;
exports.customerFilterSchema = void 0;
const schema_1 = require("../schema");
const customerCreationSourceFilter_1 = require("./customerCreationSourceFilter");
const customerCustomAttributeFilters_1 = require("./customerCustomAttributeFilters");
const customerTextFilter_1 = require("./customerTextFilter");
const filterValue_1 = require("./filterValue");
const timeRange_1 = require("./timeRange");
exports.customerFilterSchema = (0, schema_1.object)({
    creationSource: [
        'creation_source',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerCreationSourceFilter_1.customerCreationSourceFilterSchema; })),
    ],
    createdAt: ['created_at', (0, schema_1.optional)((0, schema_1.lazy)(function () { return timeRange_1.timeRangeSchema; }))],
    updatedAt: ['updated_at', (0, schema_1.optional)((0, schema_1.lazy)(function () { return timeRange_1.timeRangeSchema; }))],
    emailAddress: [
        'email_address',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerTextFilter_1.customerTextFilterSchema; })),
    ],
    phoneNumber: ['phone_number', (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerTextFilter_1.customerTextFilterSchema; }))],
    referenceId: ['reference_id', (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerTextFilter_1.customerTextFilterSchema; }))],
    groupIds: ['group_ids', (0, schema_1.optional)((0, schema_1.lazy)(function () { return filterValue_1.filterValueSchema; }))],
    customAttribute: [
        'custom_attribute',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerCustomAttributeFilters_1.customerCustomAttributeFiltersSchema; })),
    ],
    segmentIds: ['segment_ids', (0, schema_1.optional)((0, schema_1.lazy)(function () { return filterValue_1.filterValueSchema; }))]
});
//# sourceMappingURL=customerFilter.js.map