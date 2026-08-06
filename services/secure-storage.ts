import * as SecureStore from 'expo-secure-store'

export type SecureStorageSchema = Record<string, { default: string | undefined }>

export type SecureStorageAdapter = Pick<typeof SecureStore, 'deleteItemAsync' | 'getItemAsync' | 'setItemAsync'>

export type SecureStorageOptions = Readonly<{
  storage?: SecureStorageAdapter
}>

type SecureStorageKey<Schema extends SecureStorageSchema> = Extract<keyof Schema, string>
type SecureStorageValue<
  Schema extends SecureStorageSchema,
  Key extends SecureStorageKey<Schema>,
> = Schema[Key]['default']
type SecureStorageUpdater<Value> = (currentValue: Value) => Value | Promise<Value>

/**
 * Stores small sensitive strings with Expo SecureStore and a typed schema.
 * Use it for credentials such as access tokens rather than general application
 * data. Every operation is asynchronous, and `clear` affects only keys declared
 * in the schema. Read failures return the schema default; write failures log a warning.
 *
 * @example
 * ```typescript
 * const secureStorage = new SecureStorage({
 *   accessToken: { default: undefined as string | undefined },
 *   refreshToken: { default: undefined as string | undefined },
 * } satisfies SecureStorageSchema)
 *
 * await secureStorage.set('accessToken', 'token-value')
 * await secureStorage.get('accessToken') // 'token-value'
 * await secureStorage.set('accessToken', undefined) // removes the value
 * ```
 */
export class SecureStorage<Schema extends SecureStorageSchema> {
  readonly config: Schema
  readonly storage: SecureStorageAdapter

  constructor(config: Schema, options?: SecureStorageOptions) {
    this.config = config
    this.storage = options?.storage ?? SecureStore
  }

  /**
   * Reads a configured secure value.
   * Returns the schema default when the key is absent or its value cannot be read.
   *
   * @param key - Configured key to retrieve
   * @returns The stored value or the key's schema default
   */
  async get<Key extends SecureStorageKey<Schema>>(key: Key): Promise<SecureStorageValue<Schema, Key>> {
    const defaultValue = this.config[key].default

    try {
      const value = await this.storage.getItemAsync(key)
      return (value ?? defaultValue) as SecureStorageValue<Schema, Key>
    } catch (error) {
      console.warn(`Unable to retrieve secure value for key ${key}:`, error)
      return defaultValue
    }
  }

  /**
   * Stores a configured secure value or updates it from its current value.
   * Pass undefined, or return it from an updater, to remove the stored value.
   *
   * @param key - Configured key to update
   * @param value - Next value or an asynchronous updater that receives the current value
   */
  async set<Key extends SecureStorageKey<Schema>>(
    key: Key,
    value: SecureStorageValue<Schema, Key> | SecureStorageUpdater<SecureStorageValue<Schema, Key>>,
  ): Promise<void> {
    const nextValue = typeof value === 'function' ? await value(await this.get(key)) : value

    try {
      if (nextValue === undefined) {
        await this.storage.deleteItemAsync(key)
        return
      }

      await this.storage.setItemAsync(key, nextValue)
    } catch (error) {
      console.warn(`Unable to store secure value for key ${key}:`, error)
    }
  }

  /**
   * Removes one configured secure value.
   *
   * @param key - Configured key to remove
   */
  async remove<Key extends SecureStorageKey<Schema>>(key: Key): Promise<void> {
    await this.storage.deleteItemAsync(key)
  }

  /**
   * Removes every secure value declared in this storage schema.
   * Values outside the schema are left untouched.
   */
  async clear(): Promise<void> {
    await Promise.all(Object.keys(this.config).map((key) => this.storage.deleteItemAsync(key)))
  }
}
