import type { AppStateStatus } from 'react-native'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { AppState } from 'react-native'

type UseAppStateOptions = Readonly<{
  /** Callback fired when the app becomes active after any other state. */
  onActive?: () => void
  /** Callback fired when the app enters the background, not when it becomes inactive. */
  onBackground?: () => void
}>

/**
 * A React Native hook that tracks app state (active, background, inactive) and provides
 * callbacks for state transitions.
 *
 * Callbacks always read values from the latest committed render without recreating the native
 * subscription.
 *
 * @param options - Optional callbacks for state transitions.
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
 * Callbacks can safely read changing values:
 * ```tsx
 * function SyncComponent({ userId }: { userId: string }) {
 *   useAppState({
 *     onActive: () => void syncUser(userId),
 *   })
 * }
 * ```
 */
export function useAppState(options?: UseAppStateOptions) {
  const [state, setState] = useState<AppStateStatus>(AppState.currentState)
  const prevState = useRef(state)

  const handleStateChange = useEffectEvent((nextState: AppStateStatus) => {
    const becomingActive = prevState.current !== 'active' && nextState === 'active'
    const enteringBackground = prevState.current !== 'background' && nextState === 'background'

    if (becomingActive) options?.onActive?.()
    if (enteringBackground) options?.onBackground?.()

    prevState.current = nextState
    setState(nextState)
  })

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleStateChange)

    return () => {
      subscription.remove()
    }
  }, [])

  return {
    state,
    active: state === 'active',
    background: state === 'background',
    inactive: state === 'inactive',
  }
}
