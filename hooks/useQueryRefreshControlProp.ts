import type { InfiniteData, QueryKey } from '@tanstack/react-query'

import { useQueryClient } from '@tanstack/react-query'
import { createElement, useState } from 'react'
import { RefreshControl, type RefreshControlProps } from 'react-native'

type RefreshQueryTarget = Readonly<{
  pageCount?: number
  queryKey: QueryKey
  refetchMode?: 'all-pages' | 'keep-pages'
}>

type UseQueryRefreshControlPropOptions = Readonly<{
  refreshControlProps?: RefreshControlProps
  targets: readonly RefreshQueryTarget[]
}>

/**
 * Returns a `refreshControl` prop for a React Native list. It refreshes exact
 * TanStack Query targets when the user pulls down.
 *
 * `keep-pages` trims an infinite query to its first `pageCount` pages before
 * refetching. Use it when pull-to-refresh should restart a long list near the
 * top instead of reloading every page the user previously reached.
 *
 * @example
 * ```tsx
 * const refreshControlProp = useQueryRefreshControlProp({
 *   targets: [{ queryKey: usersQueryOptions.queryKey }],
 * })
 *
 * return <FlatList {...refreshControlProp} data={users} renderItem={renderUser} />
 * ```
 *
 * @example
 * ```tsx
 * const refreshControlProp = useQueryRefreshControlProp({
 *   targets: [{ queryKey: ordersQueryOptions.queryKey, refetchMode: 'keep-pages' }],
 * })
 * ```
 */
export function useQueryRefreshControlProp(options: UseQueryRefreshControlPropOptions) {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  async function onRefresh() {
    options.refreshControlProps?.onRefresh?.()
    setRefreshing(true)

    try {
      await Promise.all(
        options.targets.map(async (target) => {
          if (target.refetchMode === 'keep-pages') {
            keepInfiniteQueryPages(target.queryKey, target.pageCount ?? 1)
          }

          await queryClient.refetchQueries({ exact: true, queryKey: target.queryKey })
        }),
      )
    } finally {
      setRefreshing(false)
    }
  }

  const props = { ...options.refreshControlProps, onRefresh, refreshing }

  return { refreshControl: createElement(RefreshControl, props) }

  function keepInfiniteQueryPages(queryKey: QueryKey, pageCount: number) {
    queryClient.setQueryData<InfiniteData<unknown>>(queryKey, (data) => {
      if (!data) return data

      const keptPageCount = Math.max(1, pageCount)

      return {
        ...data,
        pageParams: data.pageParams.slice(0, keptPageCount),
        pages: data.pages.slice(0, keptPageCount),
      }
    })
  }
}
