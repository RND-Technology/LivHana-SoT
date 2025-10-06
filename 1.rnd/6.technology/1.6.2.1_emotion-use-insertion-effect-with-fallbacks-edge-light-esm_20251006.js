import * as React from 'react';

const syncFallback = function syncFallback(create) {
  return create();
};

const useInsertionEffect = React['useInsertion' + 'Effect'] ? React['useInsertion' + 'Effect'] : false;
const useInsertionEffectAlwaysWithSyncFallback = syncFallback ;
const useInsertionEffectWithLayoutFallback = useInsertionEffect || React.useLayoutEffect;

export { useInsertionEffectAlwaysWithSyncFallback, useInsertionEffectWithLayoutFallback };
