/**
 * Toggles an item in an array - adds it if not present, removes it if present.
 * Also deduplicates the array.
 *
 * @param array - The source array
 * @param item - The item to toggle
 * @returns New array with item added or removed
 *
 * @example
 * Adding an item:
 * ```typescript
 * toggleStringItem(['a', 'b'], 'c') // ['a', 'b', 'c']
 * ```
 *
 * @example
 * Removing an item:
 * ```typescript
 * toggleStringItem(['a', 'b', 'c'], 'b') // ['a', 'c']
 * ```
 *
 * @example
 * Deduplicates while toggling:
 * ```typescript
 * toggleStringItem(['a', 'a', 'b'], 'c') // ['a', 'b', 'c']
 * ```
 *
 * @example
 * Checkbox selection state:
 * ```typescript
 * const [selected, setSelected] = useState<string[]>([])
 *
 * function handleToggle(id: string) {
 *   setSelected(prev => toggleStringItem(prev, id))
 * }
 * ```
 */
export function toggleStringItem<T>(array: T[], item: T): T[] {
  const dedupedArray = Array.from(new Set(array))

  const index = dedupedArray.indexOf(item)
  if (index === -1) {
    return [...dedupedArray, item]
  } else {
    return dedupedArray.filter((_, i) => i !== index)
  }
}

/**
 * Returns a random item from an array.
 *
 * @param array - The source array
 * @returns A random item, or undefined if array is empty
 *
 * @example
 * ```typescript
 * randomArrayItem(['a', 'b', 'c']) // 'a' or 'b' or 'c'
 * randomArrayItem([]) // undefined
 * ```
 *
 * @example
 * Random placeholder text:
 * ```typescript
 * const placeholder = randomArrayItem([
 *   'Search...',
 *   'What are you looking for?',
 *   'Type to search',
 * ]) ?? 'Search'
 * ```
 */
export function randomArrayItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

/**
 * Returns multiple random items from an array (without duplicates).
 * Uses Fisher-Yates-like shuffle approach.
 *
 * @param array - The source array
 * @param count - Number of items to return
 * @returns Array of random items (may be fewer if source array is smaller)
 *
 * @example
 * ```typescript
 * randomArrayItems(['a', 'b', 'c', 'd', 'e'], 3) // e.g., ['c', 'a', 'e']
 * randomArrayItems(['a', 'b'], 5) // ['a', 'b'] (capped at array length)
 * randomArrayItems([], 3) // []
 * ```
 *
 * @example
 * Random featured items:
 * ```typescript
 * const featuredProducts = randomArrayItems(allProducts, 4)
 * ```
 */
export function randomArrayItems<T>(array: T[], count: number): T[] {
  if (count <= 0) return []
  if (array.length === 0) return []

  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * Deduplicates an array of objects by a specific key, keeping the first occurrence.
 *
 * @param arr - The source array of objects
 * @param key - The key to deduplicate by
 * @returns New array with duplicates removed
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice Copy' },
 * ]
 *
 * dedupeByKey(users, 'id')
 * // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
 * ```
 *
 * @example
 * Dedupe API results by unique field:
 * ```typescript
 * const allResults = [...page1Results, ...page2Results]
 * const unique = dedupeByKey(allResults, 'id')
 * ```
 */
export function dedupeByKey<T extends object>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter((item) => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}
