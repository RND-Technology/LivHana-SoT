"use strict";
exports.__esModule = true;
exports.selectOptionsSchema = void 0;
const schema_1 = require("../schema");
const selectOption_1 = require("./selectOption");
exports.selectOptionsSchema = (0, schema_1.object)({
    title: ['title', (0, schema_1.string)()],
    body: ['body', (0, schema_1.string)()],
    options: ['options', (0, schema_1.array)((0, schema_1.lazy)(function () { return selectOption_1.selectOptionSchema; }))],
    selectedOption: ['selected_option', (0, schema_1.optional)((0, schema_1.lazy)(function () { return selectOption_1.selectOptionSchema; }))]
});
//# sourceMappingURL=selectOptions.js.map