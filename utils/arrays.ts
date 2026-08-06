/**
 * The direction used by locale-aware sorting helpers.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Ensures a nullable scalar-or-array value is represented as an array.
 * Returns a new array so callers can safely modify the result.
 *
 * @param value - A single value, an array of values, or a nullish value
 * @returns An array containing the value, the array's values, or an empty array
 *
 * @example
 * ```typescript
 * ensureArray('featured') // ['featured']
 * ensureArray(['featured', 'recent']) // ['featured', 'recent']
 * ensureArray(null) // []
 * ```
 */
export function ensureArray<T>(value: T | ReadonlyArray<T> | null | undefined): T[] {
  if (value === null || value === undefined) return []
  return ([] as T[]).concat(value)
}

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
 * Returns a shuffled copy of an array using the Fisher-Yates algorithm.
 * The source array is never modified.
 *
 * @param array - The source array
 * @returns A new array containing every source item in random order
 *
 * @example
 * ```typescript
 * shuffleArray(['a', 'b', 'c']) // e.g., ['c', 'a', 'b']
 * ```
 */
export function shuffleArray<T>(array: ReadonlyArray<T>): T[] {
  const shuffled = [...array]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index]!

    shuffled[index] = shuffled[randomIndex]!
    shuffled[randomIndex] = currentItem
  }

  return shuffled
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
 * Returns multiple random items from an array without reusing a source position.
 * Uses a Fisher-Yates shuffle.
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

  return shuffleArray(array).slice(0, Math.min(count, array.length))
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

/**
 * Sorts a copy of an array with locale-aware string comparison.
 * Comparison ignores letter case and orders embedded numbers naturally.
 *
 * @param array - The source array
 * @param accessor - Returns the string used to compare each item
 * @param direction - Sort order, ascending by default
 * @returns A sorted copy of the source array
 *
 * @example
 * ```typescript
 * localeSort(users, user => user.name, 'desc')
 * ```
 */
export function localeSort<T>(
  array: ReadonlyArray<T>,
  accessor: (item: T) => string,
  direction: SortDirection = 'asc',
): T[] {
  return [...array].sort((a, b) => {
    const comparison = accessor(a).localeCompare(accessor(b), undefined, {
      sensitivity: 'base',
      numeric: true,
    })

    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Sorts a copy of an array of strings with locale-aware comparison.
 *
 * @param array - The source strings
 * @param direction - Sort order, ascending by default
 * @returns A sorted copy of the source strings
 *
 * @example
 * ```typescript
 * localeSortStrings(['item 10', 'item 2']) // ['item 2', 'item 10']
 * ```
 */
export function localeSortStrings(array: ReadonlyArray<string>, direction: SortDirection = 'asc'): string[] {
  return localeSort(array, (item) => item, direction)
}

/**
 * Sorts a copy of an array of objects by one property with locale-aware comparison.
 * Nullish property values sort as empty strings.
 *
 * @param array - The source objects
 * @param key - The property to compare
 * @param direction - Sort order, ascending by default
 * @returns A sorted copy of the source objects
 *
 * @example
 * ```typescript
 * localeSortByKey(users, 'name')
 * ```
 */
export function localeSortByKey<T extends object>(
  array: ReadonlyArray<T>,
  key: keyof T,
  direction: SortDirection = 'asc',
): T[] {
  return localeSort(array, (item) => String(item[key] ?? ''), direction)
}
