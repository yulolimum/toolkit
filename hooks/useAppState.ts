import type { DependencyList } from 'react'
import type { AppStateStatus } from 'react-native'

import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

type UseAppStateOptions = {
  /** Callback fired when app becomes active (foreground) */
  onActive?: () => void
  /** Callback fired when app goes to background */
  onBackground?: () => void
}

/**
 * A React Native hook that tracks app state (active, background, inactive) and provides
 * callbacks for state transitions.
 *
 * @param options - Optional callbacks for state transitions
 * @param deps - Dependency array for the effect (defaults to [])
 * @returns Object with current state and convenience booleans
 *
 * @example
 * Basic usage - track app state:
 * ```tsx
 * function MyComponent() {
 *   const { state, active, background } = useAppState()
 *
 *   return <Text>App is {active ? 'active' : 'in background'}</Text>
 * }
 * ```
 *
 * @example
 * Refresh data when app becomes active:
 * ```tsx
 * function DataScreen() {
 *   const { refetch } = useQuery({ queryKey: ['data'], queryFn: fetchData })
 *
 *   useAppState({
 *     onActive: () => refetch(),
 *   })
 *
 *   return <DataList />
 * }
 * ```
 *
 * @example
 * Pause/resume functionality:
 * ```tsx
 * function VideoPlayer() {
 *   const [isPlaying, setIsPlaying] = useState(true)
 *
 *   useAppState({
 *     onBackground: () => setIsPlaying(false),
 *     onActive: () => setIsPlaying(true),
 *   })
 *
 *   return <Video playing={isPlaying} />
 * }
 * ```
 *
 * @example
 * With dependencies:
 * ```tsx
 * function SyncComponent() {
 *   const syncData = useCallback(() => {
 *     // sync logic
 *   }, [userId])
 *
 *   useAppState({ onActive: syncData }, [syncData])
 * }
 * ```
 */
export function useAppState(options?: UseAppStateOptions, deps: DependencyList = []) {
  const [state, setState] = useState<AppStateStatus>(AppState.currentState)
  const prevState = useRef(state)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const becomingActive = prevState.current.match(/inactive|background/) && nextState === 'active'
      const goingBackground = nextState.match(/inactive|background/)

      if (becomingActive) options?.onActive?.()
      if (goingBackground) options?.onBackground?.()

      prevState.current = nextState
      setState(nextState)
    })

    return () => {
      subscription.remove()
    }
  }, deps)

  return {
    state,
    active: state === 'active',
    background: state === 'background',
    inactive: state === 'inactive',
  }
}
