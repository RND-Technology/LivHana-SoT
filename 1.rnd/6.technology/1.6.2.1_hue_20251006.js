import {hue} from "./color.js";

export default function(a, b) {
  const i = hue(+a, +b);
  return function(t) {
    const x = i(t);
    return x - 360 * Math.floor(x / 360);
  };
}
