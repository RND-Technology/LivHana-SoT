"use strict";
exports.__esModule = true;
exports.giftCardActivitySchema = void 0;
const schema_1 = require("../schema");
const giftCardActivityActivate_1 = require("./giftCardActivityActivate");
const giftCardActivityAdjustDecrement_1 = require("./giftCardActivityAdjustDecrement");
const giftCardActivityAdjustIncrement_1 = require("./giftCardActivityAdjustIncrement");
const giftCardActivityBlock_1 = require("./giftCardActivityBlock");
const giftCardActivityClearBalance_1 = require("./giftCardActivityClearBalance");
const giftCardActivityDeactivate_1 = require("./giftCardActivityDeactivate");
const giftCardActivityImport_1 = require("./giftCardActivityImport");
const giftCardActivityImportReversal_1 = require("./giftCardActivityImportReversal");
const giftCardActivityLoad_1 = require("./giftCardActivityLoad");
const giftCardActivityRedeem_1 = require("./giftCardActivityRedeem");
const giftCardActivityRefund_1 = require("./giftCardActivityRefund");
const giftCardActivityTransferBalanceFrom_1 = require("./giftCardActivityTransferBalanceFrom");
const giftCardActivityTransferBalanceTo_1 = require("./giftCardActivityTransferBalanceTo");
const giftCardActivityUnblock_1 = require("./giftCardActivityUnblock");
const giftCardActivityUnlinkedActivityRefund_1 = require("./giftCardActivityUnlinkedActivityRefund");
const money_1 = require("./money");
exports.giftCardActivitySchema = (0, schema_1.object)({
    id: ['id', (0, schema_1.optional)((0, schema_1.string)())],
    type: ['type', (0, schema_1.string)()],
    locationId: ['location_id', (0, schema_1.string)()],
    createdAt: ['created_at', (0, schema_1.optional)((0, schema_1.string)())],
    giftCardId: ['gift_card_id', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    giftCardGan: ['gift_card_gan', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    giftCardBalanceMoney: [
        'gift_card_balance_money',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return money_1.moneySchema; })),
    ],
    loadActivityDetails: [
        'load_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityLoad_1.giftCardActivityLoadSchema; })),
    ],
    activateActivityDetails: [
        'activate_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityActivate_1.giftCardActivityActivateSchema; })),
    ],
    redeemActivityDetails: [
        'redeem_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityRedeem_1.giftCardActivityRedeemSchema; })),
    ],
    clearBalanceActivityDetails: [
        'clear_balance_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityClearBalance_1.giftCardActivityClearBalanceSchema; })),
    ],
    deactivateActivityDetails: [
        'deactivate_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityDeactivate_1.giftCardActivityDeactivateSchema; })),
    ],
    adjustIncrementActivityDetails: [
        'adjust_increment_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityAdjustIncrement_1.giftCardActivityAdjustIncrementSchema; })),
    ],
    adjustDecrementActivityDetails: [
        'adjust_decrement_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityAdjustDecrement_1.giftCardActivityAdjustDecrementSchema; })),
    ],
    refundActivityDetails: [
        'refund_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityRefund_1.giftCardActivityRefundSchema; })),
    ],
    unlinkedActivityRefundActivityDetails: [
        'unlinked_activity_refund_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityUnlinkedActivityRefund_1.giftCardActivityUnlinkedActivityRefundSchema; })),
    ],
    importActivityDetails: [
        'import_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityImport_1.giftCardActivityImportSchema; })),
    ],
    blockActivityDetails: [
        'block_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityBlock_1.giftCardActivityBlockSchema; })),
    ],
    unblockActivityDetails: [
        'unblock_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityUnblock_1.giftCardActivityUnblockSchema; })),
    ],
    importReversalActivityDetails: [
        'import_reversal_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityImportReversal_1.giftCardActivityImportReversalSchema; })),
    ],
    transferBalanceToActivityDetails: [
        'transfer_balance_to_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityTransferBalanceTo_1.giftCardActivityTransferBalanceToSchema; })),
    ],
    transferBalanceFromActivityDetails: [
        'transfer_balance_from_activity_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCardActivityTransferBalanceFrom_1.giftCardActivityTransferBalanceFromSchema; })),
    ]
});
//# sourceMappingURL=giftCardActivity.js.map