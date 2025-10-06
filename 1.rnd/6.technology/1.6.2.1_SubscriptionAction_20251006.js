"use strict";
exports.__esModule = true;
exports.subscriptionActionSchema = void 0;
const schema_1 = require("../schema");
const phase_1 = require("./phase");
exports.subscriptionActionSchema = (0, schema_1.object)({
    id: ['id', (0, schema_1.optional)((0, schema_1.string)())],
    type: ['type', (0, schema_1.optional)((0, schema_1.string)())],
    effectiveDate: ['effective_date', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    monthlyBillingAnchorDate: [
        'monthly_billing_anchor_date',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.number)())),
    ],
    phases: ['phases', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return phase_1.phaseSchema; }))))],
    newPlanVariationId: ['new_plan_variation_id', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))]
});
//# sourceMappingURL=subscriptionAction.js.map