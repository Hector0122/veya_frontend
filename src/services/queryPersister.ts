import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { defaultShouldDehydrateQuery } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import type { Query } from '@tanstack/react-query';

/**
 * Caché de React Query persistida en AsyncStorage, para que Home/Mi
 * lista/detalle no arranquen en blanco cada vez que se reabre la app con
 * el backend de Railway dormido — ver
 * openspec/changes/persist-cached-content-on-launch. Instancia única
 * compartida: App.tsx la usa para hidratar/guardar, useAuth.ts la usa
 * para borrarla en logout (`removeClient`).
 */
export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'veya-query-cache',
});

// Únicos query keys que vale la pena persistir — "lo último que viste" en
// Home/Mi lista/detalle/perfil. `search` queda afuera a propósito: es
// efímero por definición (una query por tecleo), persistirlo solo haría
// crecer el storage sin ningún beneficio visible. Si agregás una query
// nueva bajo uno de estos prefijos, ahora se persiste también — es
// intencional, revisá si de verdad corresponde.
const PERSISTED_QUERY_KEY_PREFIXES = [
  'myList',
  'recommendations',
  'contentDetail',
  'me',
  'savedBooks',
];

function isPersistedQuery(query: Query): boolean {
  const [firstKey] = query.queryKey;
  return (
    typeof firstKey === 'string' && PERSISTED_QUERY_KEY_PREFIXES.includes(firstKey)
  );
}

// Bump manual cuando el shape de una respuesta persistida cambia de forma
// incompatible (p.ej. un rename de campo en Content/UserContent) — un
// buster distinto invalida lo ya guardado en vez de intentar restaurar
// algo que el código nuevo no espera. No se ata a la versión de la app:
// la mayoría de los releases no tocan estos shapes.
const PERSISTED_CACHE_BUSTER = 'v1';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const queryPersistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: ONE_DAY_MS,
  buster: PERSISTED_CACHE_BUSTER,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) && isPersistedQuery(query),
  },
};
