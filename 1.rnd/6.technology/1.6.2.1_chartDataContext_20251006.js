"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDataIndex = exports.useChartData = exports.SetComputedData = exports.ChartDataContextProvider = void 0;
const _react = require("react");
const _chartDataSlice = require("../state/chartDataSlice");
const _hooks = require("../state/hooks");
const _PanoramaContext = require("./PanoramaContext");
const ChartDataContextProvider = props => {
  const {
    chartData
  } = props;
  const dispatch = (0, _hooks.useAppDispatch)();
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  (0, _react.useEffect)(() => {
    if (isPanorama) {
      // Panorama mode reuses data from the main chart, so we must not overwrite it here.
      return () => {
        // there is nothing to clean up
      };
    }
    dispatch((0, _chartDataSlice.setChartData)(chartData));
    return () => {
      dispatch((0, _chartDataSlice.setChartData)(undefined));
    };
  }, [chartData, dispatch, isPanorama]);
  return null;
};
exports.ChartDataContextProvider = ChartDataContextProvider;
const SetComputedData = props => {
  const {
    computedData
  } = props;
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _chartDataSlice.setComputedData)(computedData));
    return () => {
      dispatch((0, _chartDataSlice.setChartData)(undefined));
    };
  }, [computedData, dispatch]);
  return null;
};
exports.SetComputedData = SetComputedData;
const selectChartData = state => state.chartData.chartData;

/**
 * "data" is the data of the chart - it has no type because this part of recharts is very flexible.
 * Basically it's an array of "something" and then there's the dataKey property in various places
 * that's meant to pull other things away from the data.
 *
 * Some charts have `data` defined on the chart root, and they will return the array through this hook.
 * For example: <ComposedChart data={data} />.
 *
 * Other charts, such as Pie, have data defined on individual graphical elements.
 * These charts will return `undefined` through this hook, and you need to read the data from children.
 * For example: <PieChart><Pie data={data} />
 *
 * Some charts also allow setting both - data on the parent, and data on the children at the same time!
 * However, this particular selector will only return the ones defined on the parent.
 *
 * @deprecated use one of the other selectors instead - which one, depends on how do you identify the applicable graphical items.
 *
 * @return data array for some charts and undefined for other
 */
const useChartData = () => (0, _hooks.useAppSelector)(selectChartData);
exports.useChartData = useChartData;
const selectDataIndex = state => {
  const {
    dataStartIndex,
    dataEndIndex
  } = state.chartData;
  return {
    startIndex: dataStartIndex,
    endIndex: dataEndIndex
  };
};

/**
 * startIndex and endIndex are data boundaries, set through Brush.
 *
 * @return object with startIndex and endIndex
 */
const useDataIndex = () => {
  return (0, _hooks.useAppSelector)(selectDataIndex);
};
exports.useDataIndex = useDataIndex;