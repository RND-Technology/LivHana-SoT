import {
  BarController,
  BubbleController,
  Chart,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController
} from "./chunk-5M33SXM5.js";
import {
  require_react
} from "./chunk-OU5AQDZK.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/react-chartjs-2/dist/index.js
const import_react = __toESM(require_react());
const defaultDatasetIdKey = "label";
function reforwardRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
function setOptions(chart, nextOptions) {
  const options = chart.options;
  if (options && nextOptions) {
    Object.assign(options, nextOptions);
  }
}
function setLabels(currentData, nextLabels) {
  currentData.labels = nextLabels;
}
function setDatasets(currentData, nextDatasets) {
  const datasetIdKey = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : defaultDatasetIdKey;
  const addedDatasets = [];
  currentData.datasets = nextDatasets.map((nextDataset) => {
    const currentDataset = currentData.datasets.find((dataset) => dataset[datasetIdKey] === nextDataset[datasetIdKey]);
    if (!currentDataset || !nextDataset.data || addedDatasets.includes(currentDataset)) {
      return {
        ...nextDataset
      };
    }
    addedDatasets.push(currentDataset);
    Object.assign(currentDataset, nextDataset);
    return currentDataset;
  });
}
function cloneData(data) {
  const datasetIdKey = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultDatasetIdKey;
  const nextData = {
    labels: [],
    datasets: []
  };
  setLabels(nextData, data.labels);
  setDatasets(nextData, data.datasets, datasetIdKey);
  return nextData;
}
function getDatasetAtEvent(chart, event) {
  return chart.getElementsAtEventForMode(event.nativeEvent, "dataset", {
    intersect: true
  }, false);
}
function getElementAtEvent(chart, event) {
  return chart.getElementsAtEventForMode(event.nativeEvent, "nearest", {
    intersect: true
  }, false);
}
function getElementsAtEvent(chart, event) {
  return chart.getElementsAtEventForMode(event.nativeEvent, "index", {
    intersect: true
  }, false);
}
function ChartComponent(props, ref) {
  const { height = 150, width = 300, redraw = false, datasetIdKey, type, data, options, plugins = [], fallbackContent, updateMode, ...canvasProps } = props;
  const canvasRef = (0, import_react.useRef)(null);
  const chartRef = (0, import_react.useRef)(null);
  const renderChart = () => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, {
      type,
      data: cloneData(data, datasetIdKey),
      options: options && {
        ...options
      },
      plugins
    });
    reforwardRef(ref, chartRef.current);
  };
  const destroyChart = () => {
    reforwardRef(ref, null);
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };
  (0, import_react.useEffect)(() => {
    if (!redraw && chartRef.current && options) {
      setOptions(chartRef.current, options);
    }
  }, [
    redraw,
    options
  ]);
  (0, import_react.useEffect)(() => {
    if (!redraw && chartRef.current) {
      setLabels(chartRef.current.config.data, data.labels);
    }
  }, [
    redraw,
    data.labels
  ]);
  (0, import_react.useEffect)(() => {
    if (!redraw && chartRef.current && data.datasets) {
      setDatasets(chartRef.current.config.data, data.datasets, datasetIdKey);
    }
  }, [
    redraw,
    data.datasets
  ]);
  (0, import_react.useEffect)(() => {
    if (!chartRef.current) return;
    if (redraw) {
      destroyChart();
      setTimeout(renderChart);
    } else {
      chartRef.current.update(updateMode);
    }
  }, [
    redraw,
    options,
    data.labels,
    data.datasets,
    updateMode
  ]);
  (0, import_react.useEffect)(() => {
    if (!chartRef.current) return;
    destroyChart();
    setTimeout(renderChart);
  }, [
    type
  ]);
  (0, import_react.useEffect)(() => {
    renderChart();
    return () => destroyChart();
  }, []);
  return import_react.default.createElement("canvas", {
    ref: canvasRef,
    role: "img",
    height,
    width,
    ...canvasProps
  }, fallbackContent);
}
const Chart2 = (0, import_react.forwardRef)(ChartComponent);
function createTypedChart(type, registerables) {
  Chart.register(registerables);
  return (0, import_react.forwardRef)((props, ref) => import_react.default.createElement(Chart2, {
    ...props,
    ref,
    type
  }));
}
const Line = createTypedChart("line", LineController);
const Bar = createTypedChart("bar", BarController);
const Radar = createTypedChart("radar", RadarController);
const Doughnut = createTypedChart("doughnut", DoughnutController);
const PolarArea = createTypedChart("polarArea", PolarAreaController);
const Bubble = createTypedChart("bubble", BubbleController);
const Pie = createTypedChart("pie", PieController);
const Scatter = createTypedChart("scatter", ScatterController);
export {
  Bar,
  Bubble,
  Chart2 as Chart,
  Doughnut,
  Line,
  Pie,
  PolarArea,
  Radar,
  Scatter,
  getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent
};
//# sourceMappingURL=react-chartjs-2.js.map
