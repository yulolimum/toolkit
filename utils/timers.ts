export type IntervalTick = Readonly<{
  tick: number
  timestamp: Date
  intervalMs: number
}>

export type CreateIntervalOptions = Readonly<{
  intervalMs: number
  immediate?: boolean
}>

export type IntervalRunner = Readonly<{
  run: () => void
  stop: () => void
}>

function assertDuration(milliseconds: number, name: string) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError(`${name} must be a finite number greater than or equal to zero.`)
  }
}

/**
 * Returns a promise that resolves after the requested duration.
 *
 * @param milliseconds - Non-negative duration to wait before resolving
 * @returns A promise that resolves after the delay
 * @throws {RangeError} When the duration is negative, infinite, or NaN
 *
 * @example
 * ```typescript
 * await delay(250)
 * ```
 */
export function delay(milliseconds: number): Promise<void> {
  assertDuration(milliseconds, 'milliseconds')

  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/**
 * Creates a controllable interval using recursive timeouts.
 * Calling `run` while it is already active does nothing, preventing duplicate timers.
 * Calling `stop` is safe repeatedly and allows the same runner to be started again from tick zero.
 *
 * @param options - Interval duration and whether to emit the first tick immediately
 * @param onTick - Callback invoked for each tick
 * @returns Controls for starting and stopping the interval
 * @throws {RangeError} When `intervalMs` is negative, infinite, or NaN
 *
 * @example
 * ```typescript
 * const heartbeat = createInterval({ intervalMs: 30_000, immediate: true }, ({ tick }) => {
 *   console.log(`Heartbeat ${tick}`)
 * })
 *
 * heartbeat.run()
 * heartbeat.stop()
 * ```
 */
export function createInterval(options: CreateIntervalOptions, onTick: (tick: IntervalTick) => void): IntervalRunner {
  const { intervalMs, immediate = false } = options
  assertDuration(intervalMs, 'intervalMs')

  let timeout: ReturnType<typeof setTimeout> | undefined
  let tickCount = 0
  let isRunning = false

  const fireTick = () => {
    const tick = tickCount
    tickCount += 1

    onTick({ intervalMs, tick, timestamp: new Date() })
  }

  const scheduleNext = () => {
    timeout = setTimeout(() => {
      timeout = undefined
      if (!isRunning) return

      try {
        fireTick()
      } finally {
        if (isRunning) scheduleNext()
      }
    }, intervalMs)
  }

  return {
    run: () => {
      if (isRunning) return

      isRunning = true
      tickCount = 0

      if (immediate) {
        try {
          fireTick()
        } catch (error) {
          isRunning = false
          throw error
        }
      }
      if (isRunning) scheduleNext()
    },
    stop: () => {
      if (!isRunning) return

      isRunning = false

      if (timeout !== undefined) {
        clearTimeout(timeout)
        timeout = undefined
      }
    },
  }
}
