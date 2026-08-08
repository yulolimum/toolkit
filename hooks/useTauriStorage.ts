import type {
  TauriStorage,
  TauriStorageKey,
  TauriStorageSchema,
  TauriStorageSetterValue,
  TauriStorageValue,
} from '../services/tauri-storage'

import { useCallback, useEffect, useState } from 'react'

/**
 * Connects one Tauri storage key to React state.
 *
 * The hook returns the schema default while the value loads or desktop storage
 * is unavailable. It also listens for changes made outside this component. The
 * setter and resetter wait for storage to finish, then refresh from the source
 * of truth.
 *
 * @example
 * ```tsx
 * const [sidebarOpen, setSidebarOpen, resetSidebarOpen] = useTauriStorage(preferences, 'sidebarOpen')
 *
 * await setSidebarOpen(false)
 * await resetSidebarOpen()
 * ```
 */
export function useTauriStorage<Schema extends TauriStorageSchema, Key extends TauriStorageKey<Schema>>(
  storage: TauriStorage<Schema>,
  key: Key,
) {
  type Value = TauriStorageValue<Schema, Key>

  const defaultValue = storage.config[key].default as Value
  const [value, setValue] = useState<Value>(defaultValue)

  useEffect(() => {
    let active = true
    let unlisten: (() => void) | undefined

    setValue(defaultValue)

    void (async () => {
      const nextUnlisten = await storage.onKeyChange(key, (nextValue) => {
        if (active) {
          setValue(nextValue ?? defaultValue)
        }
      })

      if (!active) {
        nextUnlisten?.()
        return
      }

      unlisten = nextUnlisten

      const storedValue = await storage.get(key)
      if (active) {
        setValue(storedValue)
      }
    })()

    return () => {
      active = false
      unlisten?.()
    }
  }, [defaultValue, key, storage])

  const setStoredValue = useCallback(
    async (nextValue: TauriStorageSetterValue<Schema, Key>) => {
      await storage.set(key, nextValue)
      setValue(await storage.get(key))
    },
    [key, storage],
  )

  const reset = useCallback(async () => {
    await storage.remove(key)
    setValue(await storage.get(key))
  }, [key, storage])

  return [value, setStoredValue, reset] as const
}
