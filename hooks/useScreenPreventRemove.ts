import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'

type UseScreenPreventRemoveOptions = {
  /** Whether the hook is enabled. Defaults to true. */
  enabled?: boolean
}

/**
 * A React hook that prevents a screen from being unmounted based on specified conditions.
 *
 * This hook is useful for preventing users from accidentally leaving a screen when they have
 * unsaved changes or when certain conditions need to be met before navigation.
 *
 * @param preventCallbackFn - Callback function called when navigation is prevented
 * @param deps - List of booleans or predicates. If any value/predicate returns true, navigation is prevented
 * @param opts - Options object with `enabled` flag (defaults to true)
 * @returns Object with `forceGoBack` and `forceDispatch` functions to bypass prevention
 *
 * @example
 * Basic usage with boolean dependencies:
 * ```tsx
 * function EditScreen() {
 *   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
 *   const [isLoading, setIsLoading] = useState(false)
 *
 *   const { forceGoBack } = useScreenPreventRemove(
 *     () => {
 *       Alert.alert(
 *         "Unsaved Changes",
 *         "You have unsaved changes. Are you sure you want to leave?",
 *         [
 *           { text: "Stay", style: "cancel" },
 *           { text: "Leave", style: "destructive", onPress: forceGoBack }
 *         ]
 *       )
 *     },
 *     [hasUnsavedChanges, isLoading]
 *   )
 * }
 * ```
 *
 * @example
 * Using predicates for complex conditions:
 * ```tsx
 * const { forceGoBack } = useScreenPreventRemove(
 *   () => showConfirmDialog(),
 *   [
 *     hasUnsavedChanges,
 *     () => formState.isDirty && !formState.isSubmitting,
 *   ]
 * )
 * ```
 *
 * @example
 * Conditionally enabled:
 * ```tsx
 * const { forceGoBack } = useScreenPreventRemove(
 *   () => showConfirmDialog(),
 *   [hasUnsavedChanges],
 *   { enabled: isEditMode }
 * )
 * ```
 *
 * @example
 * Using forceDispatch for custom navigation:
 * ```tsx
 * const { forceDispatch } = useScreenPreventRemove(
 *   () => showConfirmDialog(),
 *   [hasUnsavedChanges]
 * )
 *
 * // Navigate to a specific screen bypassing prevention
 * forceDispatch(CommonActions.navigate('Home'))
 * ```
 */
export function useScreenPreventRemove(
  /** Callback function called when the screen is prevented from being unmounted. */
  preventCallbackFn: () => void,
  /** List of booleans or predicates to determine if the screen is allowed to be unmounted. If any value is true, the screen will NOT be unmounted. */
  deps: (boolean | (() => boolean))[] = [],
  /** Options for the hook. */
  opts?: UseScreenPreventRemoveOptions,
) {
  const navigation = useNavigation()

  const [bypass, setBypass] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const enabled = opts?.enabled ?? true
      if (!enabled) return

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (bypass) return

        const shouldPrevent = deps.some((dep) => {
          if (typeof dep === 'function') {
            return dep()
          }
          return dep
        })

        if (shouldPrevent) {
          preventCallbackFn()
          e.preventDefault()
        }
      })

      return unsubscribe
    }, [navigation, bypass, opts?.enabled, ...deps]),
  )

  /**
   * Forces navigation back by bypassing the prevention logic.
   * This is typically called from within the prevention callback after user confirmation.
   */
  function forceGoBack() {
    setBypass(true)

    // Run in separate tick to allow state update to propagate
    setTimeout(navigation.goBack, 10)
  }

  /**
   * Forces a navigation dispatch by bypassing the prevention logic.
   * Useful for navigating to a specific screen instead of just going back.
   */
  function forceDispatch(action: Parameters<typeof navigation.dispatch>[0]) {
    setBypass(true)

    // Run in separate tick to allow state update to propagate
    setTimeout(() => navigation.dispatch(action), 10)
  }

  return { forceGoBack, forceDispatch }
}
