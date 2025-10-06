"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updatePolarOptions = exports.polarOptionsReducer = void 0;
const _toolkit = require("@reduxjs/toolkit");
const polarOptionsSlice = (0, _toolkit.createSlice)({
  name: 'polarOptions',
  initialState: null,
  reducers: {
    updatePolarOptions: (_state, action) => {
      return action.payload;
    }
  }
});
const {
  updatePolarOptions
} = polarOptionsSlice.actions;
exports.updatePolarOptions = updatePolarOptions;
const polarOptionsReducer = exports.polarOptionsReducer = polarOptionsSlice.reducer;