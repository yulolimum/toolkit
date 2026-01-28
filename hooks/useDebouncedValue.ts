/**
 * Adapted from Mantine useDebouncedValue hook:
 * https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/hooks/src/use-debounced-value/use-debounced-value.ts
 */

import { useEffect, useRef, useState } from 'react'

export interface UseDebouncedValueOptions {
  /** If true, the value updates immediately on first change, then debounces subsequent changes */
  leading?: boolean
}

/**
 * A React hook that debounces a value, delaying updates until after a specified wait time
 * has passed since the last change.
 *
 * @param value - The value to debounce
 * @param wait - Debounce delay in milliseconds
 * @param options - Options object with `leading` flag
 * @returns Tuple of [debouncedValue, forceSetValue, cancel]
 *
 * @example
 * Basic usage - debounce search input:
 * ```tsx
 * function SearchInput() {
 *   const [value, setValue] = useState('')
 *   const [debouncedValue] = useDebouncedValue(value, 300)
 *
 *   useEffect(() => {
 *     // Only fires 300ms after user stops typing
 *     searchAPI(debouncedValue)
 *   }, [debouncedValue])
 *
 *   return <TextInput value={value} onChangeText={setValue} />
 * }
 * ```
 *
 * @example
 * Leading mode - update immediately, then debounce:
 * ```tsx
 * function LiveSearch() {
 *   const [value, setValue] = useState('')
 *   const [debouncedValue] = useDebouncedValue(value, 500, { leading: true })
 *
 *   // First keystroke updates immediately, subsequent ones debounce
 *   return <SearchResults query={debouncedValue} />
 * }
 * ```
 *
 * @example
 * Force immediate update:
 * ```tsx
 * function FilterInput() {
 *   const [value, setValue] = useState('')
 *   const [debouncedValue, forceSetValue] = useDebouncedValue(value, 300)
 *
 *   function handleSubmit() {
 *     // Skip debounce and update immediately
 *     forceSetValue(value)
 *   }
 *
 *   return (
 *     <>
 *       <TextInput value={value} onChangeText={setValue} />
 *       <Button onPress={handleSubmit} title="Apply Now" />
 *     </>
 *   )
 * }
 * ```
 *
 * @example
 * Cancel pending debounce:
 * ```tsx
 * function SearchWithCancel() {
 *   const [value, setValue] = useState('')
 *   const [debouncedValue, , cancel] = useDebouncedValue(value, 300)
 *
 *   function handleClear() {
 *     cancel() // Cancel pending update
 *     setValue('')
 *   }
 *
 *   return (
 *     <>
 *       <TextInput value={value} onChangeText={setValue} />
 *       <Button onPress={handleClear} title="Clear" />
 *     </>
 *   )
 * }
 * ```
 */
export function useDebouncedValue<T = any>(
  value: T,
  wait: number,
  options: UseDebouncedValueOptions = { leading: false },
) {
  const [_value, setValue] = useState(value)
  const mountedRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const cooldownRef = useRef(false)

  const cancel = () => window.clearTimeout(timeoutRef.current!)
  const forceSetValue: typeof setValue = (value) => {
    cancel()
    cooldownRef.current = false
    setValue(value)
  }

  useEffect(() => {
    if (mountedRef.current) {
      if (!cooldownRef.current && options.leading) {
        cooldownRef.current = true
        setValue(value)
      } else {
        cancel()
        timeoutRef.current = window.setTimeout(() => {
          cooldownRef.current = false
          setValue(value)
        }, wait)
      }
    }
  }, [value, options.leading, wait])

  useEffect(() => {
    mountedRef.current = true
    return cancel
  }, [])

  return [_value, forceSetValue, cancel] as const
}
