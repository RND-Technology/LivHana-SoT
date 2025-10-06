"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addBeach = addBeach;
exports.removeBeach = removeBeach;
const _RedBlackTree = require("./RedBlackTree");
const _Cell = require("./Cell");
const _Circle = require("./Circle");
const _Edge = require("./Edge");
const _Diagram = require("./Diagram");
const beachPool = [];
function Beach() {
  (0, _RedBlackTree.RedBlackNode)(this);
  this.edge = this.site = this.circle = null;
}
function createBeach(site) {
  const beach = beachPool.pop() || new Beach();
  beach.site = site;
  return beach;
}
function detachBeach(beach) {
  (0, _Circle.detachCircle)(beach);
  _Diagram.beaches.remove(beach);
  beachPool.push(beach);
  (0, _RedBlackTree.RedBlackNode)(beach);
}
function removeBeach(beach) {
  let circle = beach.circle,
    x = circle.x,
    y = circle.cy,
    vertex = [x, y],
    previous = beach.P,
    next = beach.N,
    disappearing = [beach];
  detachBeach(beach);
  let lArc = previous;
  while (lArc.circle && Math.abs(x - lArc.circle.x) < _Diagram.epsilon && Math.abs(y - lArc.circle.cy) < _Diagram.epsilon) {
    previous = lArc.P;
    disappearing.unshift(lArc);
    detachBeach(lArc);
    lArc = previous;
  }
  disappearing.unshift(lArc);
  (0, _Circle.detachCircle)(lArc);
  let rArc = next;
  while (rArc.circle && Math.abs(x - rArc.circle.x) < _Diagram.epsilon && Math.abs(y - rArc.circle.cy) < _Diagram.epsilon) {
    next = rArc.N;
    disappearing.push(rArc);
    detachBeach(rArc);
    rArc = next;
  }
  disappearing.push(rArc);
  (0, _Circle.detachCircle)(rArc);
  let nArcs = disappearing.length,
    iArc;
  for (iArc = 1; iArc < nArcs; ++iArc) {
    rArc = disappearing[iArc];
    lArc = disappearing[iArc - 1];
    (0, _Edge.setEdgeEnd)(rArc.edge, lArc.site, rArc.site, vertex);
  }
  lArc = disappearing[0];
  rArc = disappearing[nArcs - 1];
  rArc.edge = (0, _Edge.createEdge)(lArc.site, rArc.site, null, vertex);
  (0, _Circle.attachCircle)(lArc);
  (0, _Circle.attachCircle)(rArc);
}
function addBeach(site) {
  let x = site[0],
    directrix = site[1],
    lArc,
    rArc,
    dxl,
    dxr,
    node = _Diagram.beaches._;
  while (node) {
    dxl = leftBreakPoint(node, directrix) - x;
    if (dxl > _Diagram.epsilon) node = node.L;else {
      dxr = x - rightBreakPoint(node, directrix);
      if (dxr > _Diagram.epsilon) {
        if (!node.R) {
          lArc = node;
          break;
        }
        node = node.R;
      } else {
        if (dxl > -_Diagram.epsilon) {
          lArc = node.P;
          rArc = node;
        } else if (dxr > -_Diagram.epsilon) {
          lArc = node;
          rArc = node.N;
        } else {
          lArc = rArc = node;
        }
        break;
      }
    }
  }
  (0, _Cell.createCell)(site);
  const newArc = createBeach(site);
  _Diagram.beaches.insert(lArc, newArc);
  if (!lArc && !rArc) return;
  if (lArc === rArc) {
    (0, _Circle.detachCircle)(lArc);
    rArc = createBeach(lArc.site);
    _Diagram.beaches.insert(newArc, rArc);
    newArc.edge = rArc.edge = (0, _Edge.createEdge)(lArc.site, newArc.site);
    (0, _Circle.attachCircle)(lArc);
    (0, _Circle.attachCircle)(rArc);
    return;
  }
  if (!rArc) {
    // && lArc
    newArc.edge = (0, _Edge.createEdge)(lArc.site, newArc.site);
    return;
  }

  // else lArc !== rArc
  (0, _Circle.detachCircle)(lArc);
  (0, _Circle.detachCircle)(rArc);
  const lSite = lArc.site,
    ax = lSite[0],
    ay = lSite[1],
    bx = site[0] - ax,
    by = site[1] - ay,
    rSite = rArc.site,
    cx = rSite[0] - ax,
    cy = rSite[1] - ay,
    d = 2 * (bx * cy - by * cx),
    hb = bx * bx + by * by,
    hc = cx * cx + cy * cy,
    vertex = [(cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay];
  (0, _Edge.setEdgeEnd)(rArc.edge, lSite, rSite, vertex);
  newArc.edge = (0, _Edge.createEdge)(lSite, site, null, vertex);
  rArc.edge = (0, _Edge.createEdge)(site, rSite, null, vertex);
  (0, _Circle.attachCircle)(lArc);
  (0, _Circle.attachCircle)(rArc);
}
function leftBreakPoint(arc, directrix) {
  let site = arc.site,
    rfocx = site[0],
    rfocy = site[1],
    pby2 = rfocy - directrix;
  if (!pby2) return rfocx;
  const lArc = arc.P;
  if (!lArc) return -Infinity;
  site = lArc.site;
  const lfocx = site[0],
    lfocy = site[1],
    plby2 = lfocy - directrix;
  if (!plby2) return lfocx;
  const hl = lfocx - rfocx,
    aby2 = 1 / pby2 - 1 / plby2,
    b = hl / plby2;
  if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
  return (rfocx + lfocx) / 2;
}
function rightBreakPoint(arc, directrix) {
  const rArc = arc.N;
  if (rArc) return leftBreakPoint(rArc, directrix);
  const site = arc.site;
  return site[1] === directrix ? site[0] : Infinity;
}