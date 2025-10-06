"use strict";
exports.__esModule = true;
exports.fulfillmentSchema = void 0;
const schema_1 = require("../schema");
const fulfillmentDeliveryDetails_1 = require("./fulfillmentDeliveryDetails");
const fulfillmentFulfillmentEntry_1 = require("./fulfillmentFulfillmentEntry");
const fulfillmentPickupDetails_1 = require("./fulfillmentPickupDetails");
const fulfillmentShipmentDetails_1 = require("./fulfillmentShipmentDetails");
exports.fulfillmentSchema = (0, schema_1.object)({
    uid: ['uid', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    type: ['type', (0, schema_1.optional)((0, schema_1.string)())],
    state: ['state', (0, schema_1.optional)((0, schema_1.string)())],
    lineItemApplication: ['line_item_application', (0, schema_1.optional)((0, schema_1.string)())],
    entries: [
        'entries',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return fulfillmentFulfillmentEntry_1.fulfillmentFulfillmentEntrySchema; }))),
    ],
    metadata: ['metadata', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.dict)((0, schema_1.string)())))],
    pickupDetails: [
        'pickup_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return fulfillmentPickupDetails_1.fulfillmentPickupDetailsSchema; })),
    ],
    shipmentDetails: [
        'shipment_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return fulfillmentShipmentDetails_1.fulfillmentShipmentDetailsSchema; })),
    ],
    deliveryDetails: [
        'delivery_details',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return fulfillmentDeliveryDetails_1.fulfillmentDeliveryDetailsSchema; })),
    ]
});
//# sourceMappingURL=fulfillment.js.map