"use strict";
exports.__esModule = true;
exports.catalogObjectSchema = void 0;
const schema_1 = require("../schema");
const catalogAvailabilityPeriod_1 = require("./catalogAvailabilityPeriod");
const catalogCategory_1 = require("./catalogCategory");
const catalogCustomAttributeDefinition_1 = require("./catalogCustomAttributeDefinition");
const catalogCustomAttributeValue_1 = require("./catalogCustomAttributeValue");
const catalogDiscount_1 = require("./catalogDiscount");
const catalogImage_1 = require("./catalogImage");
const catalogItem_1 = require("./catalogItem");
const catalogItemOption_1 = require("./catalogItemOption");
const catalogItemOptionValue_1 = require("./catalogItemOptionValue");
const catalogItemVariation_1 = require("./catalogItemVariation");
const catalogMeasurementUnit_1 = require("./catalogMeasurementUnit");
const catalogModifier_1 = require("./catalogModifier");
const catalogModifierList_1 = require("./catalogModifierList");
const catalogPricingRule_1 = require("./catalogPricingRule");
const catalogProductSet_1 = require("./catalogProductSet");
const catalogQuickAmountsSettings_1 = require("./catalogQuickAmountsSettings");
const catalogSubscriptionPlan_1 = require("./catalogSubscriptionPlan");
const catalogSubscriptionPlanVariation_1 = require("./catalogSubscriptionPlanVariation");
const catalogTax_1 = require("./catalogTax");
const catalogTimePeriod_1 = require("./catalogTimePeriod");
const catalogV1Id_1 = require("./catalogV1Id");
exports.catalogObjectSchema = (0, schema_1.object)({
    type: ['type', (0, schema_1.string)()],
    id: ['id', (0, schema_1.string)()],
    updatedAt: ['updated_at', (0, schema_1.optional)((0, schema_1.string)())],
    version: ['version', (0, schema_1.optional)((0, schema_1.bigint)())],
    isDeleted: ['is_deleted', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.boolean)()))],
    customAttributeValues: [
        'custom_attribute_values',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.dict)((0, schema_1.lazy)(function () { return catalogCustomAttributeValue_1.catalogCustomAttributeValueSchema; })))),
    ],
    catalogV1Ids: [
        'catalog_v1_ids',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return catalogV1Id_1.catalogV1IdSchema; })))),
    ],
    presentAtAllLocations: [
        'present_at_all_locations',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.boolean)())),
    ],
    presentAtLocationIds: [
        'present_at_location_ids',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.string)()))),
    ],
    absentAtLocationIds: [
        'absent_at_location_ids',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.string)()))),
    ],
    itemData: ['item_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogItem_1.catalogItemSchema; }))],
    categoryData: ['category_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogCategory_1.catalogCategorySchema; }))],
    itemVariationData: [
        'item_variation_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogItemVariation_1.catalogItemVariationSchema; })),
    ],
    taxData: ['tax_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogTax_1.catalogTaxSchema; }))],
    discountData: ['discount_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogDiscount_1.catalogDiscountSchema; }))],
    modifierListData: [
        'modifier_list_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogModifierList_1.catalogModifierListSchema; })),
    ],
    modifierData: ['modifier_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogModifier_1.catalogModifierSchema; }))],
    timePeriodData: [
        'time_period_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogTimePeriod_1.catalogTimePeriodSchema; })),
    ],
    productSetData: [
        'product_set_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogProductSet_1.catalogProductSetSchema; })),
    ],
    pricingRuleData: [
        'pricing_rule_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogPricingRule_1.catalogPricingRuleSchema; })),
    ],
    imageData: ['image_data', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogImage_1.catalogImageSchema; }))],
    measurementUnitData: [
        'measurement_unit_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogMeasurementUnit_1.catalogMeasurementUnitSchema; })),
    ],
    subscriptionPlanData: [
        'subscription_plan_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogSubscriptionPlan_1.catalogSubscriptionPlanSchema; })),
    ],
    itemOptionData: [
        'item_option_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogItemOption_1.catalogItemOptionSchema; })),
    ],
    itemOptionValueData: [
        'item_option_value_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogItemOptionValue_1.catalogItemOptionValueSchema; })),
    ],
    customAttributeDefinitionData: [
        'custom_attribute_definition_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogCustomAttributeDefinition_1.catalogCustomAttributeDefinitionSchema; })),
    ],
    quickAmountsSettingsData: [
        'quick_amounts_settings_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogQuickAmountsSettings_1.catalogQuickAmountsSettingsSchema; })),
    ],
    subscriptionPlanVariationData: [
        'subscription_plan_variation_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogSubscriptionPlanVariation_1.catalogSubscriptionPlanVariationSchema; })),
    ],
    availabilityPeriodData: [
        'availability_period_data',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogAvailabilityPeriod_1.catalogAvailabilityPeriodSchema; })),
    ]
});
//# sourceMappingURL=catalogObject.js.map