'use strict';

function undefsafe(obj, path, value, __res) {
  // I'm not super keen on this private function, but it's because
  // it'll also be use in the browser and I wont *one* function exposed
  function split(path) {
    const res = [];
    let level = 0;
    let key = '';

    for (let i = 0; i < path.length; i++) {
      let c = path.substr(i, 1);

      if (level === 0 && (c === '.' || c === '[')) {
        if (c === '[') {
          level++;
          i++;
          c = path.substr(i, 1);
        }

        if (key) {
          // the first value could be a string
          res.push(key);
        }
        key = '';
        continue;
      }

      if (c === ']') {
        level--;
        key = key.slice(0, -1);
        continue;
      }

      key += c;
    }

    res.push(key);

    return res;
  }

  // bail if there's nothing
  if (obj === undefined || obj === null) {
    return undefined;
  }

  const parts = split(path);
  let key = null;
  const type = typeof obj;
  const root = obj;
  let parent = obj;

  const star =
    parts.filter(function(_) {
      return _ === '*';
    }).length > 0;

  // we're dealing with a primitive
  if (type !== 'object' && type !== 'function') {
    return obj;
  } else if (path.trim() === '') {
    return obj;
  }

  key = parts[0];
  let i = 0;
  for (; i < parts.length; i++) {
    key = parts[i];
    parent = obj;

    if (key === '*') {
      // loop through each property
      let prop = '';
      const res = __res || [];

      for (prop in parent) {
        const shallowObj = undefsafe(
          obj[prop],
          parts.slice(i + 1).join('.'),
          value,
          res
        );
        if (shallowObj && shallowObj !== res) {
          if ((value && shallowObj === value) || value === undefined) {
            if (value !== undefined) {
              return shallowObj;
            }

            res.push(shallowObj);
          }
        }
      }

      if (res.length === 0) {
        return undefined;
      }

      return res;
    }

    if (Object.getOwnPropertyNames(obj).indexOf(key) == -1) {
      return undefined;
    }

    obj = obj[key];
    if (obj === undefined || obj === null) {
      break;
    }
  }

  // if we have a null object, make sure it's the one the user was after,
  // if it's not (i.e. parts has a length) then give undefined back.
  if (obj === null && i !== parts.length - 1) {
    obj = undefined;
  } else if (!star && value) {
    key = path.split('.').pop();
    parent[key] = value;
  }
  return obj;
}

if (typeof module !== 'undefined') {
  module.exports = undefsafe;
}
