/**
 * Formats an elapsed duration as compact hours, minutes, and seconds.
 * Negative and non-finite durations are treated as zero so UI labels stay usable.
 *
 * @param milliseconds - Elapsed duration in milliseconds
 * @returns A compact duration label with seconds always included
 *
 * @example
 * ```typescript
 * formatElapsed(0) // '0s'
 * formatElapsed(65_000) // '1m 5s'
 * formatElapsed(3_661_000) // '1h 1m 1s'
 * ```
 */
export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Number.isFinite(milliseconds) ? Math.max(0, Math.floor(milliseconds / 1_000)) : 0
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join(' ')
}

/**
 * Determines whether a date range fits entirely within another date range.
 * Range endpoints are inclusive and either range may be supplied in reverse order.
 * Omit one container endpoint to make that side unbounded.
 *
 * @param rangeStart - First endpoint of the range being checked
 * @param rangeEnd - Second endpoint of the range being checked
 * @param containerStart - Optional first endpoint of the containing range
 * @param containerEnd - Optional second endpoint of the containing range
 * @returns Whether the checked range is fully contained by the supplied bounds
 *
 * @example
 * ```typescript
 * const januaryFirst = new Date('2026-01-01')
 * const januaryTenth = new Date('2026-01-10')
 * const januaryThirtyFirst = new Date('2026-01-31')
 *
 * isDateRangeContainedBy(januaryFirst, januaryTenth, januaryFirst, januaryThirtyFirst) // true
 * isDateRangeContainedBy(januaryFirst, januaryThirtyFirst, januaryTenth) // false
 * isDateRangeContainedBy(januaryTenth, januaryFirst, januaryThirtyFirst, januaryFirst) // true
 * ```
 */
export function isDateRangeContainedBy(
  rangeStart: Date,
  rangeEnd: Date,
  containerStart?: Date,
  containerEnd?: Date,
): boolean {
  const rangeStartTimestamp = rangeStart.getTime()
  const rangeEndTimestamp = rangeEnd.getTime()
  const containerStartTimestamp = containerStart?.getTime()
  const containerEndTimestamp = containerEnd?.getTime()
  const timestamps = [rangeStartTimestamp, rangeEndTimestamp, containerStartTimestamp, containerEndTimestamp]

  if (timestamps.some((timestamp) => timestamp !== undefined && !Number.isFinite(timestamp))) return false

  const earliestRangeTimestamp = Math.min(rangeStartTimestamp, rangeEndTimestamp)
  const latestRangeTimestamp = Math.max(rangeStartTimestamp, rangeEndTimestamp)
  const earliestContainerTimestamp =
    containerStartTimestamp === undefined
      ? Number.NEGATIVE_INFINITY
      : containerEndTimestamp === undefined
        ? containerStartTimestamp
        : Math.min(containerStartTimestamp, containerEndTimestamp)
  const latestContainerTimestamp =
    containerEndTimestamp === undefined
      ? Number.POSITIVE_INFINITY
      : containerStartTimestamp === undefined
        ? containerEndTimestamp
        : Math.max(containerStartTimestamp, containerEndTimestamp)

  return earliestRangeTimestamp >= earliestContainerTimestamp && latestRangeTimestamp <= latestContainerTimestamp
}
