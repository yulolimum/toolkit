import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'

/**
 * A React hook that prevents a screen from being unmounted based on specified conditions.
 *
 * This hook is useful for preventing users from accidentally leaving a screen when they have
 * unsaved changes or when certain conditions need to be met before navigation.
 *
 * @example
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
 *
 *   return (
 *     // Your screen content
 *   )
 * }
 * ```
 */
export function useScreenPreventRemove(
  /** Callback function called when the screen is prevented from being unmounted. */
  preventCallbackFn: () => void,
  /** List of booleans to determine if the screen is allowed to be unmounted. If any value is true, the screen will NOT be unmounted. */
  deps: boolean[] = [],
) {
  const navigation = useNavigation()

  const [bypass, setBypass] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (bypass) return

        const shouldPrevent = deps.some((dep) => dep)

        if (shouldPrevent) {
          preventCallbackFn()
          e.preventDefault()
        }
      })

      return unsubscribe
    }, [navigation, bypass, ...deps]),
  )

  /**
   * Forces navigation back by bypassing the prevention logic.
   * This is typically called from within the prevention callback after user confirmation.
   */
  function forceGoBack() {
    setBypass(true)

    // Run in separate tick to allow state update to propagate
    setTimeout(navigation.goBack, 0)
  }

  return { forceGoBack }
}
