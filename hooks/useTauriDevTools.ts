import { useEffect } from 'react'

/**
 * Enables Cmd/Ctrl+R to reload a Tauri window during development.
 *
 * Pass the build-time development flag from the app root so production never
 * binds the shortcut.
 *
 * @example
 * ```tsx
 * useTauriDevTools(import.meta.env.DEV)
 * ```
 */
export function useTauriDevTools(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== 'r') {
        return
      }

      event.preventDefault()
      console.info('[dev tools] reload hotkey triggered')
      window.location.reload()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
