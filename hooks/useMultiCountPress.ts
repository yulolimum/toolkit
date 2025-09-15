import { useEffect, useRef, useState } from 'react'

/**
 * A React hook that detects multiple consecutive presses within a time threshold.
 * Useful for implementing features like "press 5 times to enable debug mode" or similar patterns.
 *
 * @param callback - Function to execute when the target press count is reached
 * @param count - Number of presses required to trigger the callback
 * @param threshold - Time window in milliseconds to reset the press count
 * @returns Object with onPress handler to attach to pressable components
 *
 * @example
 * ```tsx
 * function DebugButton() {
 *   const debugPressProps = useMultiCountPress(
 *     () => console.log('Debug mode activated!'),
 *     5,
 *     1000
 *   )
 *
 *   return <Pressable {...debugPressProps}><Text>Press me 5 times</Text></Pressable>
 * }
 * ```
 *
 * @example
 * ```tsx
 * function SecretFeature() {
 *   const secretPressProps = useMultiCountPress(
 *     () => setShowSecretMenu(true),
 *     3,
 *     500
 *   )
 *
 *   return <TouchableOpacity {...secretPressProps}><Text>Logo</Text></TouchableOpacity>
 * }
 * ```
 */
export function useMultiCountPress(callback: () => void, count: number, threshold: number) {
  const pressTimeout = useRef<NodeJS.Timeout>(undefined)

  const [pressCount, setPressCount] = useState(0)

  useEffect(() => {
    clearTimeout(pressTimeout.current)

    if (pressCount === count) {
      setPressCount(0)
      callback()
    } else if (pressCount > 0) {
      pressTimeout.current = setTimeout(() => setPressCount(0), threshold)
    }
  }, [pressCount])

  function handleClick() {
    setPressCount((prev) => prev + 1)
  }

  return { onPress: handleClick }
}
