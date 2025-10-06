"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeRadiusAxis = exports.removeAngleAxis = exports.polarAxisReducer = exports.addRadiusAxis = exports.addAngleAxis = void 0;
const _toolkit = require("@reduxjs/toolkit");
const _immer = require("immer");
const initialState = {
  radiusAxis: {},
  angleAxis: {}
};
const polarAxisSlice = (0, _toolkit.createSlice)({
  name: 'polarAxis',
  initialState,
  reducers: {
    addRadiusAxis(state, action) {
      state.radiusAxis[action.payload.id] = (0, _immer.castDraft)(action.payload);
    },
    removeRadiusAxis(state, action) {
      delete state.radiusAxis[action.payload.id];
    },
    addAngleAxis(state, action) {
      state.angleAxis[action.payload.id] = (0, _immer.castDraft)(action.payload);
    },
    removeAngleAxis(state, action) {
      delete state.angleAxis[action.payload.id];
    }
  }
});
const {
  addRadiusAxis,
  removeRadiusAxis,
  addAngleAxis,
  removeAngleAxis
} = polarAxisSlice.actions;
exports.removeAngleAxis = removeAngleAxis;
exports.addAngleAxis = addAngleAxis;
exports.removeRadiusAxis = removeRadiusAxis;
exports.addRadiusAxis = addRadiusAxis;
const polarAxisReducer = exports.polarAxisReducer = polarAxisSlice.reducer;