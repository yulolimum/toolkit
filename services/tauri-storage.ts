import type { UnlistenFn } from '@tauri-apps/api/event'
import type { StoreOptions } from '@tauri-apps/plugin-store'

import { isTauri } from '@tauri-apps/api/core'
import { Store } from '@tauri-apps/plugin-store'

export type TauriStorageValueType = 'object' | 'string' | 'boolean' | 'number'

export type TauriStorageSchema = Record<
  string,
  {
    type: TauriStorageValueType
    default: unknown
    version?: string | number
  }
>

type TauriStorageMetadata = Record<string, string | number>

export type TauriStorageKey<Schema extends TauriStorageSchema> = Extract<keyof Schema, string>

export type TauriStorageValue<
  Schema extends TauriStorageSchema,
  Key extends TauriStorageKey<Schema>,
> = Schema[Key]['default']

export type TauriStorageUpdater<Value> = (currentValue: Value) => Value | Promise<Value>

export type TauriStorageSetterValue<Schema extends TauriStorageSchema, Key extends TauriStorageKey<Schema>> =
  TauriStorageValue<Schema, Key> | TauriStorageUpdater<TauriStorageValue<Schema, Key>>

/**
 * Stores schema-defined preferences in a Tauri store file.
 *
 * Reads return each key's configured default when the key is absent, storage is
 * unavailable, or the code is running outside Tauri. Versioning a key discards
 * its previous value when the version changes, which is appropriate for
 * preferences and caches rather than user-created data.
 *
 * @example
 * ```ts
 * const preferences = new TauriStorage(
 *   {
 *     sidebarOpen: { type: 'boolean', default: true, version: 1 },
 *     recentFiles: { type: 'object', default: [] as string[], version: 1 },
 *   } satisfies TauriStorageSchema,
 *   'preferences.json',
 * )
 *
 * await preferences.set('sidebarOpen', false)
 * const sidebarOpen = await preferences.get('sidebarOpen')
 * ```
 */
export class TauriStorage<Schema extends TauriStorageSchema> {
  readonly config: Schema

  private readonly options: StoreOptions | undefined
  private readonly path: string
  private storePromise: Promise<Store | null> | undefined

  constructor(config: Schema, path: string, options?: StoreOptions) {
    this.config = config
    this.path = path
    this.options = options
  }

  /**
   * Loads the backing store and applies configured version changes.
   * It is safe to call during shared web and desktop startup: outside Tauri it
   * resolves without opening a store.
   */
  async init(): Promise<void> {
    await this.getStore()
  }

  /**
   * Reads one configured value. Missing, unreadable, and unavailable values
   * resolve to the key's schema default.
   */
  async get<Key extends TauriStorageKey<Schema>>(key: Key): Promise<TauriStorageValue<Schema, Key>> {
    type Value = TauriStorageValue<Schema, Key>

    const defaultValue = this.config[key].default as Value

    try {
      const store = await this.getStore()

      if (!store) {
        return defaultValue
      }

      const value = await store.get<Value>(key)
      return value ?? defaultValue
    } catch (error) {
      console.warn(`[tauri-storage] Unable to retrieve value for key ${key}:`, error)
      return defaultValue
    }
  }

  /**
   * Stores a configured value or computes one from the current value.
   * Passing or returning `null` or `undefined` removes the key instead.
   */
  async set<Key extends TauriStorageKey<Schema>>(key: Key, value: TauriStorageSetterValue<Schema, Key>): Promise<void> {
    try {
      const store = await this.getStore()

      if (!store) {
        return
      }

      const nextValue =
        typeof value === 'function'
          ? await (value as TauriStorageUpdater<TauriStorageValue<Schema, Key>>)(await this.get(key))
          : value

      if (nextValue === null || nextValue === undefined) {
        await store.delete(key)
      } else {
        await store.set(key, nextValue)
      }

      await store.save()
    } catch (error) {
      console.warn(`[tauri-storage] Unable to store value for key ${key}:`, error)
    }
  }

  /**
   * Removes one configured value. A later read returns its schema default.
   */
  async remove<Key extends TauriStorageKey<Schema>>(key: Key): Promise<void> {
    try {
      const store = await this.getStore()

      if (!store) {
        return
      }

      await store.delete(key)
      await store.save()
    } catch (error) {
      console.warn(`[tauri-storage] Unable to remove value for key ${key}:`, error)
    }
  }

  /**
   * Clears every value in this store file, including values outside this schema.
   * Use a dedicated file for each independent storage service.
   */
  async clear(): Promise<void> {
    try {
      const store = await this.getStore()

      if (!store) {
        return
      }

      await store.clear()
      await store.save()
    } catch (error) {
      console.warn('[tauri-storage] Unable to clear storage:', error)
    }
  }

  /**
   * Listens for changes to one configured key.
   * Returns `undefined` when no Tauri store is available or a listener cannot be attached.
   */
  async onKeyChange<Key extends TauriStorageKey<Schema>>(
    key: Key,
    callback: (value: TauriStorageValue<Schema, Key> | undefined) => void,
  ): Promise<UnlistenFn | undefined> {
    try {
      const store = await this.getStore()
      return store?.onKeyChange<TauriStorageValue<Schema, Key>>(key, callback)
    } catch (error) {
      console.warn(`[tauri-storage] Unable to listen for changes to key ${key}:`, error)
      return undefined
    }
  }

  private getStore(): Promise<Store | null> {
    if (!isTauri()) {
      return Promise.resolve(null)
    }

    this.storePromise ??= Store.load(this.path, this.options)
      .then(async (store) => {
        await this.validateAndMigrateVersions(store)
        return store
      })
      .catch((error: unknown) => {
        console.warn('[tauri-storage] Unable to load storage:', error)
        return null
      })

    return this.storePromise
  }

  private async validateAndMigrateVersions(store: Store): Promise<void> {
    const metadata = (await store.get<TauriStorageMetadata>('__storage_metadata')) ?? {}
    let changed = false

    for (const [key, config] of Object.entries(this.config)) {
      if (config.version === undefined || metadata[key] === config.version) {
        continue
      }

      await store.delete(key)
      metadata[key] = config.version
      changed = true
    }

    if (changed) {
      await store.set('__storage_metadata', metadata)
      await store.save()
    }
  }
}
