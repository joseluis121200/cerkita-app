import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Se conserva un día en caché: el mayor ve la última foto aunque no tenga cobertura.
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
    },
    mutations: { retry: 1 },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'cerca-query-cache-v1',
});

export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
