/**
 *
 * # Storage
 *
 * A comprehensive storage service built on MMKV that provides both imperative and reactive
 * interfaces for persistent data storage in React Native applications. Features full TypeScript
 * support with schema-driven type safety and automatic default value management.
 *
 * ## Usage Guide
 *
 * ### 1. Define your storage schema
 * ```typescript
 * import type { BaseStorage } from "./storage"
 * import { Storage } from "./storage"
 *
 * const config = {
 *   exampleString: { type: 'string', default: 'defaultString' as string },
 *   exampleBoolean: { type: 'boolean', default: false as boolean },
 *   exampleNumber: { type: 'number', default: 0 as number },
 *   exampleObject: { type: 'object', default: { key: 'value' } as Record<string, any>, version: "2.0" },
 * } satisfies BaseStorage
 * ```
 *
 * ### 2. Create a storage instance
 * ```typescript
 * export const storage = new Storage(config)
 * ```
 *
 * ### 3. Use the storage API
 * ```typescript
 * storage.get("exampleString")
 * storage.set("exampleString", "newValue")
 * const [exampleString, setExampleString] = storage.useStorage("exampleString")
 * ```
 *
 */

import { useMemo, useRef } from 'react'
import * as MMKV from 'react-native-mmkv'

import { mmkv } from '../lib/mmkv'

export type BaseStorage = Record<string, { type: StorageTypes; default: any; version?: string | number }>
type StorageTypes = 'object' | 'string' | 'boolean' | 'number'
type StorageMetadata = Record<string, string | number>
type GetStorageKey<S extends BaseStorage> = keyof S
type GetStorageValue<S extends BaseStorage, K extends GetStorageKey<S>> = S[K]['default']

export class Storage<T extends BaseStorage> {
  storage: T = {} as T

  constructor(storage: T) {
    this.storage = storage
    this.validateAndMigrateVersions()
  }

  private validateAndMigrateVersions() {
    const metadataJson = mmkv.getString('__storage_metadata')
    const metadata: StorageMetadata = metadataJson ? JSON.parse(metadataJson) : {}

    Object.entries(this.storage).forEach(([key, config]) => {
      if (config.version !== undefined) {
        const storedVersion = metadata[key]

        if (storedVersion !== config.version) {
          this.remove(key as keyof T)
          metadata[key] = config.version
        }
      }
    })

    mmkv.set('__storage_metadata', JSON.stringify(metadata))
  }

  get = <K extends GetStorageKey<typeof this.storage>>(key: K): GetStorageValue<typeof this.storage, K> => {
    type Value = GetStorageValue<typeof this.storage, K>

    const defaultValue = this.storage[key]?.default
    const persistenceType = this.storage[key]?.type as StorageTypes

    try {
      if (!mmkv.contains(key as string)) {
        return defaultValue
      }
      if (persistenceType === 'string') {
        return (mmkv.getString(key as string) || defaultValue) as Value
      }
      if (persistenceType === 'boolean') {
        return (mmkv.getBoolean(key as string) ?? defaultValue) as Value
      }
      if (persistenceType === 'number') {
        return (mmkv.getNumber(key as string) ?? defaultValue) as Value
      }
      if (persistenceType === 'object') {
        const jsonValue = mmkv.getString(key as string)
        return jsonValue ? JSON.parse(jsonValue) : defaultValue
      }
      return defaultValue
    } catch (error) {
      console.warn(`Error retrieving value for key ${String(key)}:`, error)
      return defaultValue
    }
  }

  set = <K extends GetStorageKey<typeof this.storage>>(key: K, value: GetStorageValue<typeof this.storage, K>) => {
    try {
      if (value === null || value === undefined) {
        mmkv.delete(key as string)
      }
      // Primitives can be stored directly
      else if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
        mmkv.set(key as string, value)
      }
      // For complex objects, use JSON
      else {
        mmkv.set(key as string, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Error setting value for key ${String(key)}:`, error)
    }
  }

  remove = <K extends GetStorageKey<typeof this.storage>>(key: K) => {
    mmkv.delete(key as string)
  }

  clear = () => {
    mmkv.clearAll()
  }

  /**
   * React hook for accessing and updating a value in persistent storage.
   * This hook provides a reactive interface to MMKV storage, automatically updating when the value changes.
   */
  useStorage = <K extends GetStorageKey<typeof this.storage>>(
    key: K,
  ): [GetStorageValue<typeof this.storage, K>, (value: GetStorageValue<typeof this.storage, K>) => void] => {
    const defaultValue = useRef(this.storage[key]?.default).current
    const persistenceType = useRef(this.storage[key]?.type).current as StorageTypes

    const useReactiveValue = useMemo(() => {
      if (persistenceType === 'string') {
        return MMKV.useMMKVString
      }
      if (persistenceType === 'boolean') {
        return MMKV.useMMKVBoolean
      }
      if (persistenceType === 'number') {
        return MMKV.useMMKVNumber
      }
      if (persistenceType === 'object') {
        return MMKV.useMMKVObject
      }

      return MMKV.useMMKVString
    }, [persistenceType])

    const [value, setValue] = useReactiveValue(key as string, mmkv)

    const valueOrDefault = useMemo(() => {
      if (persistenceType === 'string') {
        return value || defaultValue
      } else {
        return value ?? defaultValue
      }
    }, [value, defaultValue, persistenceType])

    return [valueOrDefault, setValue] as any
  }
}
