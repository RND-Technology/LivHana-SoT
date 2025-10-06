import * as React from 'react';

const isBrowser = typeof document !== 'undefined';

const syncFallback = function syncFallback(create) {
  return create();
};

const useInsertionEffect = React['useInsertion' + 'Effect'] ? React['useInsertion' + 'Effect'] : false;
const useInsertionEffectAlwaysWithSyncFallback = !isBrowser ? syncFallback : useInsertionEffect || syncFallback;
const useInsertionEffectWithLayoutFallback = useInsertionEffect || React.useLayoutEffect;

export { useInsertionEffectAlwaysWithSyncFallback, useInsertionEffectWithLayoutFallback };
