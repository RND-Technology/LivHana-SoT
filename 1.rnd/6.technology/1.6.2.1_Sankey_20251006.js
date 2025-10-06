"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sankeyPayloadSearcher = exports.Sankey = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _maxBy = _interopRequireDefault(require("es-toolkit/compat/maxBy"));
const _sumBy = _interopRequireDefault(require("es-toolkit/compat/sumBy"));
const _get = _interopRequireDefault(require("es-toolkit/compat/get"));
const _Surface = require("../container/Surface");
const _Layer = require("../container/Layer");
const _Rectangle = require("../shape/Rectangle");
const _ShallowEqual = require("../util/ShallowEqual");
const _ReactUtils = require("../util/ReactUtils");
const _ChartUtils = require("../util/ChartUtils");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _tooltipPortalContext = require("../context/tooltipPortalContext");
const _RechartsWrapper = require("./RechartsWrapper");
const _RechartsStoreProvider = require("../state/RechartsStoreProvider");
const _hooks = require("../state/hooks");
const _tooltipSlice = require("../state/tooltipSlice");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _chartDataContext = require("../context/chartDataContext");
const _isWellBehavedNumber = require("../util/isWellBehavedNumber");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _excluded = ["sourceX", "sourceY", "sourceControlX", "targetX", "targetY", "targetControlX", "linkWidth"],
  _excluded2 = ["width", "height", "className", "style", "children"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const interpolationGenerator = (a, b) => {
  const ka = +a;
  const kb = b - ka;
  return t => ka + kb * t;
};
const centerY = node => node.y + node.dy / 2;
const getValue = entry => entry && entry.value || 0;
const getSumOfIds = (links, ids) => ids.reduce((result, id) => result + getValue(links[id]), 0);
const getSumWithWeightedSource = (tree, links, ids) => ids.reduce((result, id) => {
  const link = links[id];
  const sourceNode = tree[link.source];
  return result + centerY(sourceNode) * getValue(links[id]);
}, 0);
const getSumWithWeightedTarget = (tree, links, ids) => ids.reduce((result, id) => {
  const link = links[id];
  const targetNode = tree[link.target];
  return result + centerY(targetNode) * getValue(links[id]);
}, 0);
const ascendingY = (a, b) => a.y - b.y;
const searchTargetsAndSources = (links, id) => {
  const sourceNodes = [];
  const sourceLinks = [];
  const targetNodes = [];
  const targetLinks = [];
  for (let i = 0, len = links.length; i < len; i++) {
    const link = links[i];
    if (link.source === id) {
      targetNodes.push(link.target);
      targetLinks.push(i);
    }
    if (link.target === id) {
      sourceNodes.push(link.source);
      sourceLinks.push(i);
    }
  }
  return {
    sourceNodes,
    sourceLinks,
    targetLinks,
    targetNodes
  };
};
const updateDepthOfTargets = (tree, curNode) => {
  const {
    targetNodes
  } = curNode;
  for (let i = 0, len = targetNodes.length; i < len; i++) {
    const target = tree[targetNodes[i]];
    if (target) {
      target.depth = Math.max(curNode.depth + 1, target.depth);
      updateDepthOfTargets(tree, target);
    }
  }
};
const getNodesTree = (_ref, width, nodeWidth) => {
  const {
    nodes,
    links
  } = _ref;
  const tree = nodes.map((entry, index) => {
    const result = searchTargetsAndSources(links, index);
    return _objectSpread(_objectSpread(_objectSpread({}, entry), result), {}, {
      value: Math.max(getSumOfIds(links, result.sourceLinks), getSumOfIds(links, result.targetLinks)),
      depth: 0
    });
  });
  for (let i = 0, len = tree.length; i < len; i++) {
    const node = tree[i];
    if (!node.sourceNodes.length) {
      updateDepthOfTargets(tree, node);
    }
  }
  const maxDepth = (0, _maxBy.default)(tree, entry => entry.depth).depth;
  if (maxDepth >= 1) {
    const childWidth = (width - nodeWidth) / maxDepth;
    for (let _i = 0, _len = tree.length; _i < _len; _i++) {
      const _node = tree[_i];
      if (!_node.targetNodes.length) {
        _node.depth = maxDepth;
      }
      _node.x = _node.depth * childWidth;
      _node.dx = nodeWidth;
    }
  }
  return {
    tree,
    maxDepth
  };
};
const getDepthTree = tree => {
  const result = [];
  for (let i = 0, len = tree.length; i < len; i++) {
    const node = tree[i];
    if (!result[node.depth]) {
      result[node.depth] = [];
    }
    result[node.depth].push(node);
  }
  return result;
};
const updateYOfTree = (depthTree, height, nodePadding, links) => {
  const yRatio = Math.min(...depthTree.map(nodes => (height - (nodes.length - 1) * nodePadding) / (0, _sumBy.default)(nodes, getValue)));
  for (let d = 0, maxDepth = depthTree.length; d < maxDepth; d++) {
    for (let i = 0, len = depthTree[d].length; i < len; i++) {
      const node = depthTree[d][i];
      node.y = i;
      node.dy = node.value * yRatio;
    }
  }
  return links.map(link => _objectSpread(_objectSpread({}, link), {}, {
    dy: getValue(link) * yRatio
  }));
};
const resolveCollisions = function resolveCollisions(depthTree, height, nodePadding) {
  const sort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  for (let i = 0, len = depthTree.length; i < len; i++) {
    const nodes = depthTree[i];
    const n = nodes.length;

    // Sort by the value of y
    if (sort) {
      nodes.sort(ascendingY);
    }
    let y0 = 0;
    for (let j = 0; j < n; j++) {
      const node = nodes[j];
      const dy = y0 - node.y;
      if (dy > 0) {
        node.y += dy;
      }
      y0 = node.y + node.dy + nodePadding;
    }
    y0 = height + nodePadding;
    for (let _j = n - 1; _j >= 0; _j--) {
      const _node2 = nodes[_j];
      const _dy = _node2.y + _node2.dy + nodePadding - y0;
      if (_dy > 0) {
        _node2.y -= _dy;
        y0 = _node2.y;
      } else {
        break;
      }
    }
  }
};
const relaxLeftToRight = (tree, depthTree, links, alpha) => {
  for (let i = 0, maxDepth = depthTree.length; i < maxDepth; i++) {
    const nodes = depthTree[i];
    for (let j = 0, len = nodes.length; j < len; j++) {
      const node = nodes[j];
      if (node.sourceLinks.length) {
        const sourceSum = getSumOfIds(links, node.sourceLinks);
        const weightedSum = getSumWithWeightedSource(tree, links, node.sourceLinks);
        const y = weightedSum / sourceSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
const relaxRightToLeft = (tree, depthTree, links, alpha) => {
  for (let i = depthTree.length - 1; i >= 0; i--) {
    const nodes = depthTree[i];
    for (let j = 0, len = nodes.length; j < len; j++) {
      const node = nodes[j];
      if (node.targetLinks.length) {
        const targetSum = getSumOfIds(links, node.targetLinks);
        const weightedSum = getSumWithWeightedTarget(tree, links, node.targetLinks);
        const y = weightedSum / targetSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
const updateYOfLinks = (tree, links) => {
  for (let i = 0, len = tree.length; i < len; i++) {
    const node = tree[i];
    let sy = 0;
    let ty = 0;
    node.targetLinks.sort((a, b) => tree[links[a].target].y - tree[links[b].target].y);
    node.sourceLinks.sort((a, b) => tree[links[a].source].y - tree[links[b].source].y);
    for (let j = 0, tLen = node.targetLinks.length; j < tLen; j++) {
      const link = links[node.targetLinks[j]];
      if (link) {
        link.sy = sy;
        sy += link.dy;
      }
    }
    for (let _j2 = 0, sLen = node.sourceLinks.length; _j2 < sLen; _j2++) {
      const _link = links[node.sourceLinks[_j2]];
      if (_link) {
        _link.ty = ty;
        ty += _link.dy;
      }
    }
  }
};
const computeData = _ref2 => {
  const {
    data,
    width,
    height,
    iterations,
    nodeWidth,
    nodePadding,
    sort
  } = _ref2;
  const {
    links
  } = data;
  const {
    tree
  } = getNodesTree(data, width, nodeWidth);
  const depthTree = getDepthTree(tree);
  const newLinks = updateYOfTree(depthTree, height, nodePadding, links);
  resolveCollisions(depthTree, height, nodePadding, sort);
  let alpha = 1;
  for (let i = 1; i <= iterations; i++) {
    relaxRightToLeft(tree, depthTree, newLinks, alpha *= 0.99);
    resolveCollisions(depthTree, height, nodePadding, sort);
    relaxLeftToRight(tree, depthTree, newLinks, alpha);
    resolveCollisions(depthTree, height, nodePadding, sort);
  }
  updateYOfLinks(tree, newLinks);
  return {
    nodes: tree,
    links: newLinks
  };
};
const getCoordinateOfTooltip = (item, type) => {
  if (type === 'node') {
    return {
      x: +item.x + +item.width / 2,
      y: +item.y + +item.height / 2
    };
  }
  return 'sourceX' in item && {
    x: (item.sourceX + item.targetX) / 2,
    y: (item.sourceY + item.targetY) / 2
  };
};
const getPayloadOfTooltip = (item, type, nameKey) => {
  const {
    payload
  } = item;
  if (type === 'node') {
    return {
      payload,
      name: (0, _ChartUtils.getValueByDataKey)(payload, nameKey, ''),
      value: (0, _ChartUtils.getValueByDataKey)(payload, 'value')
    };
  }
  if ('source' in payload && payload.source && payload.target) {
    const sourceName = (0, _ChartUtils.getValueByDataKey)(payload.source, nameKey, '');
    const targetName = (0, _ChartUtils.getValueByDataKey)(payload.target, nameKey, '');
    return {
      payload,
      name: "".concat(sourceName, " - ").concat(targetName),
      value: (0, _ChartUtils.getValueByDataKey)(payload, 'value')
    };
  }
  return null;
};
const sankeyPayloadSearcher = (_, activeIndex, computedData, nameKey) => {
  if (activeIndex == null || typeof activeIndex !== 'string') {
    return undefined;
  }
  const splitIndex = activeIndex.split('-');
  const [targetType, index] = splitIndex;
  const item = (0, _get.default)(computedData, "".concat(targetType, "s[").concat(index, "]"));
  if (item) {
    const payload = getPayloadOfTooltip(item, targetType, nameKey);
    return payload;
  }
  return undefined;
};
exports.sankeyPayloadSearcher = sankeyPayloadSearcher;
const options = {
  chartName: 'Sankey',
  defaultTooltipEventType: 'item',
  validateTooltipEventTypes: ['item'],
  tooltipPayloadSearcher: sankeyPayloadSearcher,
  eventEmitter: undefined
};
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    nameKey,
    stroke,
    strokeWidth,
    fill,
    name,
    data
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      name,
      nameKey,
      color: fill,
      unit: '' // Sankey does not have unit, why?
    }
  };
}

// TODO: improve types - NodeOptions uses SankeyNode, LinkOptions uses LinkProps. Standardize.

// Why is margin not a Sankey prop? No clue. Probably it should be
const defaultSankeyMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
function renderLinkItem(option, props) {
  if (/*#__PURE__*/React.isValidElement(option)) {
    return /*#__PURE__*/React.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  let {
      sourceX,
      sourceY,
      sourceControlX,
      targetX,
      targetY,
      targetControlX,
      linkWidth
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  return /*#__PURE__*/React.createElement("path", _extends({
    className: "recharts-sankey-link",
    d: "\n          M".concat(sourceX, ",").concat(sourceY, "\n          C").concat(sourceControlX, ",").concat(sourceY, " ").concat(targetControlX, ",").concat(targetY, " ").concat(targetX, ",").concat(targetY, "\n        "),
    fill: "none",
    stroke: "#333",
    strokeWidth: linkWidth,
    strokeOpacity: "0.2"
  }, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others)));
}
const buildLinkProps = _ref3 => {
  const {
    link,
    nodes,
    left,
    top,
    i,
    linkContent,
    linkCurvature
  } = _ref3;
  const {
    sy: sourceRelativeY,
    ty: targetRelativeY,
    dy: linkWidth
  } = link;
  const sourceNode = nodes[link.source];
  const targetNode = nodes[link.target];
  const sourceX = sourceNode.x + sourceNode.dx + left;
  const targetX = targetNode.x + left;
  const interpolationFunc = interpolationGenerator(sourceX, targetX);
  const sourceControlX = interpolationFunc(linkCurvature);
  const targetControlX = interpolationFunc(1 - linkCurvature);
  const sourceY = sourceNode.y + sourceRelativeY + linkWidth / 2 + top;
  const targetY = targetNode.y + targetRelativeY + linkWidth / 2 + top;
  const linkProps = _objectSpread({
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    sourceRelativeY,
    targetRelativeY,
    linkWidth,
    index: i,
    payload: _objectSpread(_objectSpread({}, link), {}, {
      source: sourceNode,
      target: targetNode
    })
  }, (0, _ReactUtils.filterProps)(linkContent, false));
  return linkProps;
};
function SankeyLinkElement(_ref4) {
  const {
    props,
    i,
    linkContent,
    onMouseEnter: _onMouseEnter,
    onMouseLeave: _onMouseLeave,
    onClick: _onClick,
    dataKey
  } = _ref4;
  const activeCoordinate = getCoordinateOfTooltip(props, 'link');
  const activeIndex = "link-".concat(i);
  const dispatch = (0, _hooks.useAppDispatch)();
  const events = {
    onMouseEnter: e => {
      dispatch((0, _tooltipSlice.setActiveMouseOverItemIndex)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onMouseEnter(props, e);
    },
    onMouseLeave: e => {
      dispatch((0, _tooltipSlice.mouseLeaveItem)());
      _onMouseLeave(props, e);
    },
    onClick: e => {
      dispatch((0, _tooltipSlice.setActiveClickItemIndex)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onClick(props, e);
    }
  };
  return /*#__PURE__*/React.createElement(_Layer.Layer, events, renderLinkItem(linkContent, props));
}
function AllSankeyLinkElements(_ref5) {
  const {
    modifiedLinks,
    links,
    linkContent,
    onMouseEnter,
    onMouseLeave,
    onClick,
    dataKey
  } = _ref5;
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-sankey-links",
    key: "recharts-sankey-links"
  }, links.map((link, i) => {
    const linkProps = modifiedLinks[i];
    return /*#__PURE__*/React.createElement(SankeyLinkElement, {
      key: "link-".concat(link.source, "-").concat(link.target, "-").concat(link.value),
      props: linkProps,
      linkContent: linkContent,
      i: i,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick,
      dataKey: dataKey
    });
  }));
}
function renderNodeItem(option, props) {
  if (/*#__PURE__*/React.isValidElement(option)) {
    return /*#__PURE__*/React.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  return (
    /*#__PURE__*/
    // @ts-expect-error recharts radius is not compatible with SVG radius
    React.createElement(_Rectangle.Rectangle, _extends({
      className: "recharts-sankey-node",
      fill: "#0088fe",
      fillOpacity: "0.8"
    }, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props)))
  );
}
const buildNodeProps = _ref6 => {
  const {
    node,
    nodeContent,
    top,
    left,
    i
  } = _ref6;
  const {
    x,
    y,
    dx,
    dy
  } = node;
  const nodeProps = _objectSpread(_objectSpread({}, (0, _ReactUtils.filterProps)(nodeContent, false)), {}, {
    x: x + left,
    y: y + top,
    width: dx,
    height: dy,
    index: i,
    payload: node
  });
  return nodeProps;
};
function NodeElement(_ref7) {
  const {
    props,
    nodeContent,
    i,
    onMouseEnter: _onMouseEnter2,
    onMouseLeave: _onMouseLeave2,
    onClick: _onClick2,
    dataKey
  } = _ref7;
  const dispatch = (0, _hooks.useAppDispatch)();
  const activeCoordinate = getCoordinateOfTooltip(props, 'node');
  const activeIndex = "node-".concat(i);
  const events = {
    onMouseEnter: e => {
      dispatch((0, _tooltipSlice.setActiveMouseOverItemIndex)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onMouseEnter2(props, e);
    },
    onMouseLeave: e => {
      dispatch((0, _tooltipSlice.mouseLeaveItem)());
      _onMouseLeave2(props, e);
    },
    onClick: e => {
      dispatch((0, _tooltipSlice.setActiveClickItemIndex)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onClick2(props, e);
    }
  };
  return /*#__PURE__*/React.createElement(_Layer.Layer, events, renderNodeItem(nodeContent, props));
}
function AllNodeElements(_ref8) {
  const {
    modifiedNodes,
    nodeContent,
    onMouseEnter,
    onMouseLeave,
    onClick,
    dataKey
  } = _ref8;
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-sankey-nodes",
    key: "recharts-sankey-nodes"
  }, modifiedNodes.map((modifiedNode, i) => {
    return /*#__PURE__*/React.createElement(NodeElement, {
      props: modifiedNode,
      nodeContent: nodeContent,
      i: i,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick,
      dataKey: dataKey
    });
  }));
}
class Sankey extends _react.PureComponent {
  constructor() {
    super(...arguments);
    _defineProperty(this, "state", {
      nodes: [],
      links: [],
      modifiedLinks: [],
      modifiedNodes: []
    });
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      data,
      width,
      height,
      margin,
      iterations,
      nodeWidth,
      nodePadding,
      sort,
      linkCurvature
    } = nextProps;
    if (data !== prevState.prevData || width !== prevState.prevWidth || height !== prevState.prevHeight || !(0, _ShallowEqual.shallowEqual)(margin, prevState.prevMargin) || iterations !== prevState.prevIterations || nodeWidth !== prevState.prevNodeWidth || nodePadding !== prevState.prevNodePadding || sort !== prevState.sort) {
      const contentWidth = width - (margin && margin.left || 0) - (margin && margin.right || 0);
      const contentHeight = height - (margin && margin.top || 0) - (margin && margin.bottom || 0);
      const {
        links,
        nodes
      } = computeData({
        data,
        width: contentWidth,
        height: contentHeight,
        iterations,
        nodeWidth,
        nodePadding,
        sort
      });
      const top = (0, _get.default)(margin, 'top') || 0;
      const left = (0, _get.default)(margin, 'left') || 0;
      const modifiedLinks = links.map((link, i) => {
        return buildLinkProps({
          link,
          nodes,
          i,
          top,
          left,
          linkContent: nextProps.link,
          linkCurvature
        });
      });
      const modifiedNodes = nodes.map((node, i) => {
        return buildNodeProps({
          node,
          nodeContent: nextProps.node,
          i,
          top,
          left
        });
      });
      return _objectSpread(_objectSpread({}, prevState), {}, {
        nodes,
        links,
        modifiedLinks,
        modifiedNodes,
        prevData: data,
        prevWidth: iterations,
        prevHeight: height,
        prevMargin: margin,
        prevNodePadding: nodePadding,
        prevNodeWidth: nodeWidth,
        prevIterations: iterations,
        prevSort: sort
      });
    }
    return null;
  }
  handleMouseEnter(item, type, e) {
    const {
      onMouseEnter
    } = this.props;
    if (onMouseEnter) {
      onMouseEnter(item, type, e);
    }
  }
  handleMouseLeave(item, type, e) {
    const {
      onMouseLeave
    } = this.props;
    if (onMouseLeave) {
      onMouseLeave(item, type, e);
    }
  }
  handleClick(item, type, e) {
    const {
      onClick
    } = this.props;
    if (onClick) onClick(item, type, e);
  }
  render() {
    const _this$props = this.props,
      {
        width,
        height,
        className,
        style,
        children
      } = _this$props,
      others = _objectWithoutProperties(_this$props, _excluded2);
    if (!(0, _isWellBehavedNumber.isPositiveNumber)(width) || !(0, _isWellBehavedNumber.isPositiveNumber)(height)) {
      return null;
    }
    const {
      links,
      modifiedNodes,
      modifiedLinks
    } = this.state;
    const attrs = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others);
    return /*#__PURE__*/React.createElement(_RechartsStoreProvider.RechartsStoreProvider, {
      preloadedState: {
        options
      },
      reduxStoreName: className !== null && className !== void 0 ? className : 'Sankey'
    }, /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
      fn: getTooltipEntrySettings,
      args: this.props
    }), /*#__PURE__*/React.createElement(_chartDataContext.SetComputedData, {
      computedData: {
        links: modifiedLinks,
        nodes: modifiedNodes
      }
    }), /*#__PURE__*/React.createElement(_chartLayoutContext.ReportChartSize, {
      width: width,
      height: height
    }), /*#__PURE__*/React.createElement(_chartLayoutContext.ReportChartMargin, {
      margin: defaultSankeyMargin
    }), /*#__PURE__*/React.createElement(_tooltipPortalContext.TooltipPortalContext.Provider, {
      value: this.state.tooltipPortal
    }, /*#__PURE__*/React.createElement(_RechartsWrapper.RechartsWrapper, {
      className: className,
      style: style,
      width: width,
      height: height,
      ref: node => {
        if (this.state.tooltipPortal == null) {
          this.setState({
            tooltipPortal: node
          });
        }
      },
      onMouseEnter: undefined,
      onMouseLeave: undefined,
      onClick: undefined,
      onMouseMove: undefined,
      onMouseDown: undefined,
      onMouseUp: undefined,
      onContextMenu: undefined,
      onDoubleClick: undefined,
      onTouchStart: undefined,
      onTouchMove: undefined,
      onTouchEnd: undefined
    }, /*#__PURE__*/React.createElement(_Surface.Surface, _extends({}, attrs, {
      width: width,
      height: height
    }), children, /*#__PURE__*/React.createElement(AllSankeyLinkElements, {
      links: links,
      modifiedLinks: modifiedLinks,
      linkContent: this.props.link,
      dataKey: this.props.dataKey,
      onMouseEnter: (linkProps, e) => this.handleMouseEnter(linkProps, 'link', e),
      onMouseLeave: (linkProps, e) => this.handleMouseLeave(linkProps, 'link', e),
      onClick: (linkProps, e) => this.handleClick(linkProps, 'link', e)
    }), /*#__PURE__*/React.createElement(AllNodeElements, {
      modifiedNodes: modifiedNodes,
      nodeContent: this.props.node,
      dataKey: this.props.dataKey,
      onMouseEnter: (nodeProps, e) => this.handleMouseEnter(nodeProps, 'node', e),
      onMouseLeave: (nodeProps, e) => this.handleMouseLeave(nodeProps, 'node', e),
      onClick: (nodeProps, e) => this.handleClick(nodeProps, 'node', e)
    })))));
  }
}
exports.Sankey = Sankey;
_defineProperty(Sankey, "displayName", 'Sankey');
_defineProperty(Sankey, "defaultProps", {
  nameKey: 'name',
  dataKey: 'value',
  nodePadding: 10,
  nodeWidth: 10,
  linkCurvature: 0.5,
  iterations: 32,
  margin: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  },
  sort: true
});