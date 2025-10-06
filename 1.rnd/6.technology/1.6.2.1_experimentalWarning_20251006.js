'use strict'

const experimentalWarnings = new Set();

function emitExperimentalWarning(feature) {
  if (experimentalWarnings.has(feature)) return;
  const msg = feature + ' is an experimental feature. This feature could ' +
       'change at any time';
  experimentalWarnings.add(feature);
  process.emitWarning(msg, 'ExperimentalWarning');
}

function noop() {}

module.exports.emitExperimentalWarning = process.emitWarning
  ? emitExperimentalWarning
  : noop;
