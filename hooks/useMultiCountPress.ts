import { useRef } from 'react'

/**
 * A React hook that detects multiple consecutive presses within a time threshold.
 * Useful for implementing features like "press 5 times to enable debug mode" or similar patterns.
 *
 * @param callback - Function to execute when the target press count is reached
 * @param opts - Configuration options
 * @param opts.count - Number of presses required to trigger the callback (default: 10)
 * @param opts.threshold - Time window in milliseconds to reset the press count (default: 500)
 * @param opts.enabled - Whether the hook is enabled (default: true). Returns undefined when disabled.
 * @returns The press handler function, or undefined if disabled
 *
 * @example
 * ```tsx
 * function DebugButton() {
 *   const handleDebugPress = useMultiCountPress(
 *     () => console.log('Debug mode activated!'),
 *     { count: 5, threshold: 1000 }
 *   )
 *
 *   return <Pressable onPress={handleDebugPress}><Text>Press me 5 times</Text></Pressable>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function SecretFeature() {
 *   const handleSecretPress = useMultiCountPress(
 *     () => setShowSecretMenu(true),
 *     { count: 3, enabled: isDevMode }
 *   )
 *
 *   return <TouchableOpacity onPress={handleSecretPress}><Text>Logo</Text></TouchableOpacity>
 * }
 * ```
 */
export function useMultiCountPress(
  callback: () => void,
  opts?: { count?: number; threshold?: number; enabled?: boolean },
) {
  const { count = 10, threshold = 500, enabled = true } = opts ?? {}

  const pressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pressCount = useRef(0)

  function handleClick() {
    clearTimeout(pressTimeout.current)

    pressCount.current += 1

    if (pressCount.current === count) {
      pressCount.current = 0
      callback()
    } else {
      pressTimeout.current = setTimeout(() => {
        pressCount.current = 0
      }, threshold)
    }
  }

  return enabled ? handleClick : undefined
}
