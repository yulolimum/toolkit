/**
 * Safely resolves a promise, returning a result object instead of throwing.
 * Useful for avoiding try/catch blocks and handling errors inline.
 *
 * @param promise - The promise to resolve
 * @param fallback - Value to return if promise rejects (default: undefined)
 * @returns Object with `ok: true` and resolved value, or `ok: false` and fallback
 *
 * @example
 * Basic usage:
 * ```typescript
 * const result = await safeResolve(fetchUser(id))
 *
 * if (result.ok) {
 *   console.log(result.value) // User data
 * } else {
 *   console.log('Failed to fetch user')
 * }
 * ```
 *
 * @example
 * With fallback value:
 * ```typescript
 * const result = await safeResolve(fetchConfig(), defaultConfig)
 *
 * // result.value is either fetched config or defaultConfig
 * const config = result.value
 * ```
 *
 * @example
 * Destructuring pattern:
 * ```typescript
 * const { ok, value } = await safeResolve(api.getItems())
 *
 * if (!ok) return showError()
 * renderItems(value)
 * ```
 */
export async function safeResolve<T, F = undefined>(
  promise: Promise<T>,
  fallback: F = undefined as F,
): Promise<{ ok: true; value: T } | { ok: false; value: F }> {
  try {
    const resolved = await promise
    return { ok: true as const, value: resolved }
  } catch {
    return { ok: false as const, value: fallback }
  }
}

/**
 * Safely executes a synchronous function, returning a result object instead of throwing.
 * Useful for operations that might throw (JSON.parse, etc.) without try/catch blocks.
 *
 * @param fn - The function to execute
 * @param fallback - Value to return if function throws (default: undefined)
 * @returns Object with `ok: true` and return value, or `ok: false` and fallback
 *
 * @example
 * Safe JSON parsing:
 * ```typescript
 * const result = safeExec(() => JSON.parse(jsonString), {})
 *
 * if (result.ok) {
 *   console.log(result.value) // Parsed object
 * } else {
 *   console.log('Invalid JSON, using fallback:', result.value) // {}
 * }
 * ```
 *
 * @example
 * With type inference:
 * ```typescript
 * const result = safeExec(() => JSON.parse(data) as UserConfig, defaultConfig)
 *
 * // result.value is UserConfig regardless of ok status
 * applyConfig(result.value)
 * ```
 *
 * @example
 * Inline usage:
 * ```typescript
 * const config = safeExec(() => JSON.parse(localStorage.getItem('config')!), {}).value
 * ```
 */
export function safeExec<T, F = undefined>(
  fn: () => T,
  fallback: F = undefined as F,
): { ok: true; value: T } | { ok: false; value: F } {
  try {
    const resolved = fn()
    return { ok: true as const, value: resolved }
  } catch {
    return { ok: false as const, value: fallback }
  }
}
