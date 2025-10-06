"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLegendSize = exports.setLegendSettings = exports.removeLegendPayload = exports.legendReducer = exports.addLegendPayload = void 0;
const _toolkit = require("@reduxjs/toolkit");
const _immer = require("immer");
/**
 * The properties inside this state update independently of each other and quite often.
 * When selecting, never select the whole state because you are going to get
 * unnecessary re-renders. Select only the properties you need.
 *
 * This is why this state type is not exported - don't use it directly.
 */

const initialState = {
  settings: {
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'middle',
    itemSorter: 'value'
  },
  size: {
    width: 0,
    height: 0
  },
  payload: []
};
const legendSlice = (0, _toolkit.createSlice)({
  name: 'legend',
  initialState,
  reducers: {
    setLegendSize(state, action) {
      state.size.width = action.payload.width;
      state.size.height = action.payload.height;
    },
    setLegendSettings(state, action) {
      state.settings.align = action.payload.align;
      state.settings.layout = action.payload.layout;
      state.settings.verticalAlign = action.payload.verticalAlign;
      state.settings.itemSorter = action.payload.itemSorter;
    },
    addLegendPayload(state, action) {
      state.payload.push((0, _immer.castDraft)(action.payload));
    },
    removeLegendPayload(state, action) {
      const index = (0, _toolkit.current)(state).payload.indexOf((0, _immer.castDraft)(action.payload));
      if (index > -1) {
        state.payload.splice(index, 1);
      }
    }
  }
});
const {
  setLegendSize,
  setLegendSettings,
  addLegendPayload,
  removeLegendPayload
} = legendSlice.actions;
exports.removeLegendPayload = removeLegendPayload;
exports.addLegendPayload = addLegendPayload;
exports.setLegendSettings = setLegendSettings;
exports.setLegendSize = setLegendSize;
const legendReducer = exports.legendReducer = legendSlice.reducer;