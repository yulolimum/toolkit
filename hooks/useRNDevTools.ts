/* eslint-disable react-hooks/rules-of-hooks -- __DEV__ is a Metro build-time constant. */

import type { QueryClient } from '@tanstack/react-query'

import { useNetworkActivityDevTools } from '@rozenite/network-activity-plugin'
import {
  createExpoSecureStorageAdapter,
  createMMKVStorageAdapter,
  useRozeniteStoragePlugin,
} from '@rozenite/storage-plugin'
import { useTanStackQueryDevTools } from '@rozenite/tanstack-query-plugin'

import { mmkv } from '../lib/mmkv'
import { secureStorage } from '../lib/secure-storage'

/**
 * Registers Rozenite panels for network activity, TanStack Query, MMKV, and
 * Expo SecureStore in Metro development builds.
 *
 * The secure-store panel exposes only keys declared in `secureStorage`.
 * Configure Rozenite's app-specific Metro integration separately.
 *
 * @example
 * ```tsx
 * useRNDevTools(queryClient)
 * ```
 */
export function useRNDevTools(queryClient: QueryClient) {
  if (!__DEV__) {
    return
  }

  useTanStackQueryDevTools(queryClient)
  useNetworkActivityDevTools()
  useRozeniteStoragePlugin({
    storages: [
      createMMKVStorageAdapter({ storages: { default: mmkv } }),
      createExpoSecureStorageAdapter({
        storage: secureStorage.storage,
        keys: Object.keys(secureStorage.config),
      }),
    ],
  })
}
