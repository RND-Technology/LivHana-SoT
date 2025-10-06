"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeLine = exports.removeDot = exports.removeArea = exports.referenceElementsSlice = exports.referenceElementsReducer = exports.addLine = exports.addDot = exports.addArea = void 0;
const _toolkit = require("@reduxjs/toolkit");
const initialState = {
  dots: [],
  areas: [],
  lines: []
};
const referenceElementsSlice = exports.referenceElementsSlice = (0, _toolkit.createSlice)({
  name: 'referenceElements',
  initialState,
  reducers: {
    addDot: (state, action) => {
      state.dots.push(action.payload);
    },
    removeDot: (state, action) => {
      const index = (0, _toolkit.current)(state).dots.findIndex(dot => dot === action.payload);
      if (index !== -1) {
        state.dots.splice(index, 1);
      }
    },
    addArea: (state, action) => {
      state.areas.push(action.payload);
    },
    removeArea: (state, action) => {
      const index = (0, _toolkit.current)(state).areas.findIndex(area => area === action.payload);
      if (index !== -1) {
        state.areas.splice(index, 1);
      }
    },
    addLine: (state, action) => {
      state.lines.push(action.payload);
    },
    removeLine: (state, action) => {
      const index = (0, _toolkit.current)(state).lines.findIndex(line => line === action.payload);
      if (index !== -1) {
        state.lines.splice(index, 1);
      }
    }
  }
});
const {
  addDot,
  removeDot,
  addArea,
  removeArea,
  addLine,
  removeLine
} = referenceElementsSlice.actions;
exports.removeLine = removeLine;
exports.addLine = addLine;
exports.removeArea = removeArea;
exports.addArea = addArea;
exports.removeDot = removeDot;
exports.addDot = addDot;
const referenceElementsReducer = exports.referenceElementsReducer = referenceElementsSlice.reducer;