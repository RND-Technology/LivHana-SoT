"use strict";
exports.__esModule = true;
exports.loyaltyProgramSchema = void 0;
const schema_1 = require("../schema");
const loyaltyProgramAccrualRule_1 = require("./loyaltyProgramAccrualRule");
const loyaltyProgramExpirationPolicy_1 = require("./loyaltyProgramExpirationPolicy");
const loyaltyProgramRewardTier_1 = require("./loyaltyProgramRewardTier");
const loyaltyProgramTerminology_1 = require("./loyaltyProgramTerminology");
exports.loyaltyProgramSchema = (0, schema_1.object)({
    id: ['id', (0, schema_1.optional)((0, schema_1.string)())],
    status: ['status', (0, schema_1.optional)((0, schema_1.string)())],
    rewardTiers: [
        'reward_tiers',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyProgramRewardTier_1.loyaltyProgramRewardTierSchema; })))),
    ],
    expirationPolicy: [
        'expiration_policy',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyProgramExpirationPolicy_1.loyaltyProgramExpirationPolicySchema; })),
    ],
    terminology: [
        'terminology',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyProgramTerminology_1.loyaltyProgramTerminologySchema; })),
    ],
    locationIds: ['location_ids', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.string)())))],
    createdAt: ['created_at', (0, schema_1.optional)((0, schema_1.string)())],
    updatedAt: ['updated_at', (0, schema_1.optional)((0, schema_1.string)())],
    accrualRules: [
        'accrual_rules',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyProgramAccrualRule_1.loyaltyProgramAccrualRuleSchema; })))),
    ]
});
//# sourceMappingURL=loyaltyProgram.js.map