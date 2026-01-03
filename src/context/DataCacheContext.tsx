import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

type CacheValue = any

interface DataCache {
  get: <T = CacheValue>(key: string) => T | undefined
  set: (key: string, value: CacheValue) => void
  delete: (key: string) => void
  clear: () => void
}

const DataCacheContext = createContext<DataCache | null>(null)

const fallbackStore = new Map<string, CacheValue>()
const fallbackCache: DataCache = {
  get: <T = CacheValue>(key: string) =>
    (fallbackStore.has(key) ? (fallbackStore.get(key) as unknown as T) : undefined),
  set: (key, value) => {
    fallbackStore.set(key, value)
  },
  delete: (key) => {
    fallbackStore.delete(key)
  },
  clear: () => {
    fallbackStore.clear()
  },
}

export const DataCacheProvider = ({ children }: { children: ReactNode }) => {
  const cacheRef = useRef<Map<string, CacheValue>>(new Map())

  const get = useCallback<DataCache['get']>(
    (key) => cacheRef.current.get(key),
    [],
  )

  const set = useCallback<DataCache['set']>((key, value) => {
    cacheRef.current.set(key, value)
  }, [])

  const deleteEntry = useCallback<DataCache['delete']>((key) => {
    cacheRef.current.delete(key)
  }, [])

  const clear = useCallback<DataCache['clear']>(() => {
    cacheRef.current.clear()
  }, [])

  const value = useMemo<DataCache>(
    () => ({
      get,
      set,
      delete: deleteEntry,
      clear,
    }),
    [get, set, deleteEntry, clear],
  )

  return <DataCacheContext.Provider value={value}>{children}</DataCacheContext.Provider>
}

export const useDataCache = () => {
  return useContext(DataCacheContext) ?? fallbackCache
}

