"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceErrorBar = exports.removeErrorBar = exports.errorBarReducer = exports.addErrorBar = void 0;
const _toolkit = require("@reduxjs/toolkit");
/**
 * ErrorBars have lot more settings but all the others are scoped to the component itself.
 * Only some of them required to be reported to the global store because XAxis and YAxis need to know
 * if the error bar is contributing to extending the axis domain.
 */

const initialState = {};
const errorBarSlice = (0, _toolkit.createSlice)({
  name: 'errorBars',
  initialState,
  reducers: {
    addErrorBar: (state, action) => {
      const {
        itemId,
        errorBar
      } = action.payload;
      if (!state[itemId]) {
        state[itemId] = [];
      }
      state[itemId].push(errorBar);
    },
    replaceErrorBar: (state, action) => {
      const {
        itemId,
        prev,
        next
      } = action.payload;
      if (state[itemId]) {
        state[itemId] = state[itemId].map(e => e.dataKey === prev.dataKey && e.direction === prev.direction ? next : e);
      }
    },
    removeErrorBar: (state, action) => {
      const {
        itemId,
        errorBar
      } = action.payload;
      if (state[itemId]) {
        state[itemId] = state[itemId].filter(e => e.dataKey !== errorBar.dataKey || e.direction !== errorBar.direction);
      }
    }
  }
});
const {
  addErrorBar,
  replaceErrorBar,
  removeErrorBar
} = errorBarSlice.actions;
exports.removeErrorBar = removeErrorBar;
exports.replaceErrorBar = replaceErrorBar;
exports.addErrorBar = addErrorBar;
const errorBarReducer = exports.errorBarReducer = errorBarSlice.reducer;