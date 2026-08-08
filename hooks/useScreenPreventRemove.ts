import { type NavigationAction, useNavigation, usePreventRemove } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react'

type UseScreenPreventRemoveOptions = Readonly<{
  /** Whether removal prevention is enabled. Defaults to true. */
  enabled?: boolean
}>

type PendingNavigation = { type: 'goBack' } | { type: 'dispatch'; action: NavigationAction }

type UseScreenPreventRemoveContext = Readonly<{
  /** The action that attempted to remove the screen. */
  action: NavigationAction
  /** Continues the exact action that was originally blocked. */
  continueRemoval: () => void
}>

type UseScreenPreventRemoveCondition = boolean | (() => boolean)

type UseScreenPreventRemoveCallback = (context: UseScreenPreventRemoveContext) => void

/**
 * Blocks navigation actions that would remove the current screen while any condition holds.
 *
 * The callback can resume the exact action that was blocked after the user confirms. Use the
 * force helpers only when confirmation should take the user somewhere else instead.
 *
 * @param onPreventRemove - Called when a removal action is blocked.
 * @param conditions - Values or predicates that prevent removal when any resolve to `true`.
 * @param options - Optional behavior controls.
 * @returns Helpers to continue or deliberately replace a blocked navigation action.
 *
 * @example
 * Resume the action the user originally attempted:
 * ```tsx
 * function EditScreen() {
 *   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
 *
 *   useScreenPreventRemove(
 *     ({ continueRemoval }) => {
 *       Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
 *         { text: 'Stay', style: 'cancel' },
 *         { text: 'Discard', style: 'destructive', onPress: continueRemoval },
 *       ])
 *     },
 *     [hasUnsavedChanges],
 *   )
 * }
 * ```
 *
 * @example
 * Use predicates for complex conditions:
 * ```tsx
 * useScreenPreventRemove(
 *   ({ continueRemoval }) => showConfirmDialog({ onConfirm: continueRemoval }),
 *   [hasUnsavedChanges, () => formState.isDirty && !formState.isSubmitting],
 * )
 * ```
 *
 * @example
 * Disable prevention conditionally:
 * ```tsx
 * useScreenPreventRemove(onPreventRemove, [hasUnsavedChanges], { enabled: isEditMode })
 * ```
 *
 * @example
 * Choose a different navigation action after confirmation:
 * ```tsx
 * const { forceDispatch } = useScreenPreventRemove(onPreventRemove, [hasUnsavedChanges])
 *
 * forceDispatch(CommonActions.navigate('Home'))
 * ```
 */
export function useScreenPreventRemove(
  onPreventRemove: UseScreenPreventRemoveCallback,
  conditions: readonly UseScreenPreventRemoveCondition[] = [],
  options?: UseScreenPreventRemoveOptions,
) {
  const navigation = useNavigation()
  const blockedActionRef = useRef<NavigationAction | undefined>(undefined)
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)

  const shouldPrevent =
    (options?.enabled ?? true) &&
    conditions.some((condition) => (typeof condition === 'function' ? condition() : condition))

  // Render with prevention disabled before dispatching a confirmed action below.
  usePreventRemove(shouldPrevent && pendingNavigation === null, ({ data }) => {
    blockedActionRef.current = data.action
    onPreventRemove({ action: data.action, continueRemoval })
  })

  useEffect(() => {
    if (!pendingNavigation) return

    try {
      if (pendingNavigation.type === 'goBack') {
        navigation.goBack()
      } else {
        navigation.dispatch(pendingNavigation.action)
      }
    } finally {
      blockedActionRef.current = undefined
      setPendingNavigation(null)
    }
  }, [navigation, pendingNavigation])

  /** Continues the action that originally attempted to remove the screen. */
  function continueRemoval() {
    const action = blockedActionRef.current
    if (action) {
      setPendingNavigation({ type: 'dispatch', action })
    }
  }

  /** Navigates back without applying removal prevention. */
  function forceGoBack() {
    setPendingNavigation({ type: 'goBack' })
  }

  /** Dispatches an action without applying removal prevention. */
  function forceDispatch(action: NavigationAction) {
    setPendingNavigation({ type: 'dispatch', action })
  }

  return { continueRemoval, forceGoBack, forceDispatch }
}
