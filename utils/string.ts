const ELLIPSIS = '...' as const

/**
 * Selects the singular or plural form of an English word for a count.
 * Provide both forms explicitly so irregular plurals stay correct.
 *
 * @param count - Quantity used to select the word form
 * @param singular - Word to return when count is exactly one
 * @param plural - Word to return for every other count
 * @param includeCount - Whether to prefix the selected word with the count
 * @returns The selected word, optionally prefixed with the count
 *
 * @example
 * ```typescript
 * pluralize(1, 'item', 'items') // 'item'
 * pluralize(2, 'item', 'items', true) // '2 items'
 * pluralize(3, 'category', 'categories') // 'categories'
 * ```
 */
export function pluralize(count: number, singular: string, plural: string, includeCount = false): string {
  const word = count === 1 ? singular : plural

  return includeCount ? `${count} ${word}` : word
}

/**
 * Escapes text so it is treated literally when included in a regular expression.
 * Use this when building a RegExp from user input or another dynamic string.
 *
 * @param value - Text that should match literally in a regular expression
 * @returns The text with regular-expression syntax characters escaped
 *
 * @example
 * ```typescript
 * const filename = 'file?.txt'
 * const filenamePattern = new RegExp(`^${escapeRegExp(filename)}$`)
 *
 * filenamePattern.test('file?.txt') // true
 * filenamePattern.test('file1txt') // false
 * ```
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Truncates text to a maximum final length and adds an ellipsis when needed.
 * The ellipsis counts toward the limit, so a truncated result never exceeds it.
 *
 * @param value - Text to truncate
 * @param maxLength - Maximum number of characters in the returned text
 * @returns The original text when it fits, otherwise its truncated form with an ellipsis
 *
 * @example
 * ```typescript
 * truncateWithEllipsis('A long project name', 12) // 'A long pr...'
 * truncateWithEllipsis('Short name', 12) // 'Short name'
 * truncateWithEllipsis('Long name', 2) // '..'
 * ```
 */
export function truncateWithEllipsis(value: string, maxLength: number): string {
  if (!Number.isFinite(maxLength)) return maxLength > 0 ? value : ''

  const normalizedMaxLength = Math.max(0, Math.floor(maxLength))
  if (normalizedMaxLength === 0) return ''

  const characters = Array.from(value)
  if (characters.length <= normalizedMaxLength) return value

  const ellipsisCharacters = Array.from(ELLIPSIS)
  if (normalizedMaxLength <= ellipsisCharacters.length) {
    return ellipsisCharacters.slice(0, normalizedMaxLength).join('')
  }

  return `${characters.slice(0, normalizedMaxLength - ellipsisCharacters.length).join('')}${ELLIPSIS}`
}

/**
 * Joins the first items in a list and appends the number of hidden items.
 * This is useful for compact summaries of selected people, tags, or filters.
 *
 * @param values - Strings to summarize without modifying the source array
 * @param visibleCount - Maximum number of values to include before the remaining count
 * @returns A comma-separated summary, optionally ending in a +remaining count
 *
 * @example
 * ```typescript
 * joinArrayWithRemainingCount(['Ada', 'Grace', 'Linus'], 2) // 'Ada, Grace, +1'
 * joinArrayWithRemainingCount(['Ada'], 2) // 'Ada'
 * joinArrayWithRemainingCount(['Ada', 'Grace'], 0) // '+2'
 * ```
 */
export function joinArrayWithRemainingCount(values: ReadonlyArray<string>, visibleCount: number): string {
  const normalizedVisibleCount = Number.isFinite(visibleCount)
    ? Math.max(0, Math.floor(visibleCount))
    : visibleCount > 0
      ? values.length
      : 0

  if (values.length <= normalizedVisibleCount) return values.join(', ')

  const visibleValues = values.slice(0, normalizedVisibleCount)
  const remainingCount = values.length - visibleValues.length
  const joinedVisibleValues = visibleValues.join(', ')

  return joinedVisibleValues ? `${joinedVisibleValues}, +${remainingCount}` : `+${remainingCount}`
}

/**
 * Determines whether one normalized SemVer core version is greater than another.
 * This intentionally supports only MAJOR.MINOR.PATCH strings, without prerelease
 * or build metadata. Nullish and empty versions are never considered greater.
 *
 * @param firstVersion - Normalized SemVer core version to evaluate
 * @param secondVersion - Normalized SemVer core version to compare against
 * @returns Whether the first version is greater than the second version
 *
 * @example
 * ```typescript
 * semverGT('1.10.0', '1.2.0') // true
 * semverGT('1.2.0', '1.2.0') // false
 * semverGT(null, '1.2.0') // false
 * ```
 */
export function semverGT(firstVersion: string | null | undefined, secondVersion: string | null | undefined): boolean {
  if (!firstVersion || !secondVersion) return false

  return firstVersion.localeCompare(secondVersion, undefined, { numeric: true }) > 0
}

/**
 * Removes characters that are not Unicode letters or numbers.
 * Supply exclusions to preserve additional individual characters, such as hyphens,
 * underscores, spaces, or punctuation that is meaningful to the calling context.
 *
 * @param value - Text to filter
 * @param exclusions - Additional characters to preserve in the returned text
 * @returns Text containing only letters, numbers, and the requested exclusions
 *
 * @example
 * ```typescript
 * removeNonAlphaNumeric('Café 42!') // 'Café42'
 * removeNonAlphaNumeric('ACME-42_v2!', '-_') // 'ACME-42_v2'
 * removeNonAlphaNumeric('person@example.com', '@.') // 'person@example.com'
 * ```
 */
export function removeNonAlphaNumeric(value: string, exclusions = ''): string {
  const escapedExclusions = escapeRegExp(exclusions).replaceAll('-', '\\-')
  const nonAlphaNumericPattern = new RegExp(`[^\\p{L}\\p{N}${escapedExclusions}]`, 'gu')

  return value.replace(nonAlphaNumericPattern, '')
}
