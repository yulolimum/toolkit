/**
 * Safely access a nested property in an object using dot notation or bracket syntax.
 *
 * @param obj - The object to access
 * @param path - The path to the property (e.g., "user.address.city" or "items[0].name")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * ```typescript
 * const obj = { user: { name: 'John', addresses: [{ city: 'NYC' }] } }
 *
 * getObjPath(obj, 'user.name') // 'John'
 * getObjPath(obj, 'user.addresses[0].city') // 'NYC'
 * getObjPath(obj, 'user.missing') // undefined
 * getObjPath<string>(obj, 'user.name') // typed as string | undefined
 * ```
 */
export function getObjPath<T = any>(obj: unknown, path: string): T | undefined {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((acc, key) => (acc && typeof acc === 'object' ? (acc as any)[key] : undefined), obj) as T | undefined
}

/**
 * Check if an object is empty (null, undefined, or has no keys).
 *
 * @param obj - The value to check
 * @returns True if null, undefined, or an empty object
 *
 * @example
 * ```typescript
 * isObjEmpty(null) // true
 * isObjEmpty(undefined) // true
 * isObjEmpty({}) // true
 * isObjEmpty({ a: 1 }) // false
 * isObjEmpty([]) // true (empty array)
 * ```
 */
export function isObjEmpty(obj: unknown): boolean {
  return obj === null || obj === undefined || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

/**
 * Type-safe Object.keys that returns properly typed keys.
 *
 * @param obj - The object to get keys from
 * @returns Array of keys typed as keyof Obj
 *
 * @example
 * ```typescript
 * const user = { name: 'John', age: 30 }
 * const keys = getObjectKeys(user) // ('name' | 'age')[]
 *
 * keys.forEach(key => {
 *   console.log(user[key]) // No type error
 * })
 * ```
 */
export function getObjectKeys<Obj extends object>(obj: Obj): Array<keyof Obj> {
  return Object.keys(obj) as Array<keyof Obj>
}

/**
 * Type-safe Object.values that returns properly typed values.
 *
 * @param obj - The object to get values from
 * @returns Array of values typed as Obj[keyof Obj]
 *
 * @example
 * ```typescript
 * const user = { name: 'John', age: 30 }
 * const values = getObjectValues(user) // (string | number)[]
 * ```
 */
export function getObjectValues<Obj extends object>(obj: Obj): Array<Obj[keyof Obj]> {
  return Object.values(obj) as Array<Obj[keyof Obj]>
}

/**
 * Type-safe Object.entries that preserves each returned string key and its matching value type.
 *
 * @param obj - The object to get entries from
 * @returns Array of [key, value] tuples with matching key and value types
 *
 * @example
 * ```typescript
 * const user = { name: 'John', age: 30 }
 * const entries = getObjectEntries(user) // ['name' | 'age', string | number][]
 *
 * entries.forEach(([key, value]) => {
 *   console.log(key, value) // Both properly typed
 * })
 * ```
 */
type ObjectEntry<Obj extends object> = {
  [Key in keyof Obj]-?: Key extends string | number ? [`${Key}`, Obj[Key]] : never
}[keyof Obj]

export function getObjectEntries<Obj extends object>(obj: Obj): Array<ObjectEntry<Obj>> {
  return Object.entries(obj) as Array<ObjectEntry<Obj>>
}

/**
 * Extract only primitive (non-nested) properties from an object.
 * Filters out nested objects, arrays, null, and functions.
 *
 * @param obj - The object to filter
 * @returns A partial object containing only primitive values
 *
 * @example
 * ```typescript
 * const data = {
 *   id: 1,
 *   name: 'John',
 *   active: true,
 *   metadata: { created: '2024-01-01' },
 *   tags: ['a', 'b'],
 *   callback: () => {},
 * }
 *
 * getRootLevelObject(data)
 * // { id: 1, name: 'John', active: true }
 * ```
 */
/**
 * Creates a new object with specified keys removed.
 *
 * @param object - The source object
 * @param keys - Keys to omit from the result
 * @returns New object without the specified keys
 *
 * @example
 * Single key:
 * ```typescript
 * const user = { id: 1, name: 'John', password: 'secret' }
 * omit(user, 'password') // { id: 1, name: 'John' }
 * ```
 *
 * @example
 * Multiple keys:
 * ```typescript
 * const user = { id: 1, name: 'John', password: 'secret', token: 'abc' }
 * omit(user, 'password', 'token') // { id: 1, name: 'John' }
 * ```
 *
 * @example
 * Sanitizing API responses:
 * ```typescript
 * const publicUser = omit(dbUser, 'passwordHash', 'email', 'privateNotes')
 * ```
 */
/**
 * Creates a new object with null and undefined values removed.
 *
 * @param obj - The source object
 * @returns New object without nullish values
 *
 * @example
 * ```typescript
 * const data = { a: 1, b: null, c: 'hello', d: undefined, e: 0 }
 * removeNullishValues(data) // { a: 1, c: 'hello', e: 0 }
 * ```
 *
 * @example
 * Cleaning up API payloads:
 * ```typescript
 * const payload = removeNullishValues({
 *   name: formData.name,
 *   email: formData.email || null,
 *   phone: formData.phone || undefined,
 * })
 * // Only includes fields with actual values
 * ```
 *
 * @example
 * Merging with defaults (nullish removed first):
 * ```typescript
 * const config = { ...defaults, ...removeNullishValues(userConfig) }
 * ```
 */
/**
 * Creates a new object containing only properties that pass the predicate.
 *
 * @param obj - The source object
 * @param predicate - Function that returns true for properties to keep
 * @returns New object with only matching properties
 *
 * @example
 * Filter by value:
 * ```typescript
 * const scores = { alice: 85, bob: 42, carol: 91 }
 * pickBy(scores, (v) => v > 50) // { alice: 85, carol: 91 }
 * ```
 *
 * @example
 * Filter by key:
 * ```typescript
 * const data = { _id: 1, name: 'John', _rev: '2' }
 * pickBy(data, (_, k) => !String(k).startsWith('_')) // { name: 'John' }
 * ```
 *
 * @example
 * Remove falsy values:
 * ```typescript
 * const form = { name: 'John', email: '', age: 0, active: false }
 * pickBy(form, Boolean) // { name: 'John' }
 * ```
 */
export function pickBy<T extends object>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const k = key as keyof T
    if (predicate(value, k)) {
      acc[k] = value
    }
    return acc
  }, {} as Partial<T>)
}

export function removeNullishValues<T extends object>(obj: T): Partial<T> {
  const newObj = {} as Partial<T>

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  }

  return newObj
}

export function omit<O extends object, K extends keyof O>(object: O, ...keys: K[]): Omit<O, K> {
  const result = { ...object }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * Creates a new object containing only the specified keys.
 *
 * @param object - The source object
 * @param keys - Keys to include in the result
 * @returns New object containing only the specified properties
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: 'John', password: 'secret' }
 * pick(user, 'id', 'name') // { id: 1, name: 'John' }
 * ```
 *
 * @example
 * Selecting fields for a request payload:
 * ```typescript
 * const payload = pick(formData, 'name', 'email')
 * ```
 */
export function pick<O extends object, K extends keyof O>(object: O, ...keys: K[]): Pick<O, K> {
  const result = {} as Pick<O, K>

  for (const key of keys) {
    result[key] = object[key]
  }

  return result
}

export function getRootLevelObject<Obj extends object>(obj: Obj): Partial<Obj> {
  const result: Partial<Obj> = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]

    const isNestedObject = typeof value === 'object' || value === null || Array.isArray(value)
    const isFunction = typeof value === 'function'

    if (!isNestedObject && !isFunction) {
      result[key] = value
    }
  }

  return result
}
