// Виртуальный shim для use-sync-external-store
// React 18 уже имеет встроенный useSyncExternalStore
import { useSyncExternalStore, useRef, useEffect, useMemo, useDebugValue } from 'react';

// Простая реализация useSyncExternalStoreWithSelector для zustand
function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  const slice = useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    getServerSnapshot ? () => selector(getServerSnapshot()) : undefined
  );
  
  useDebugValue(slice);
  return slice;
}

export { useSyncExternalStore, useSyncExternalStoreWithSelector };
export default { useSyncExternalStore, useSyncExternalStoreWithSelector };
