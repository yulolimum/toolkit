import type { QueryKey, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query'
import type { RefreshControlProps } from 'react-native'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

type UseGenericQueryResult = UseInfiniteQueryResult<any, any> | UseQueryResult<any, any>

/**
 * A React hook that provides RefreshControl props for React Native ScrollView/FlatList components
 * that automatically refetches multiple React Query queries when pulled to refresh.
 *
 * @param queries - Array of React Query results (useQuery or useInfiniteQuery) to refetch on refresh.
 *                  Only queries that are fetched or currently fetching will be refetched.
 * @param invalidateQueryKeys - Optional array of query keys to invalidate after refetch completes
 * @param RefreshControlProps - Optional additional RefreshControl props to merge with the generated ones
 * @returns RefreshControl props object with onRefresh and refreshing state
 *
 * @example
 * Basic usage with multiple queries:
 * ```typescript
 * const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
 * const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
 * const refreshControlProps = useQueryRefreshControlProps([usersQuery, postsQuery])
 * // Use with ScrollView: refreshControl={<RefreshControl {...refreshControlProps} />}
 * ```
 *
 * @example
 * Usage with query invalidation:
 * ```typescript
 * const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
 * const refreshControlProps = useQueryRefreshControlProps(
 *   [postsQuery],
 *   [['notifications'], ['unreadCount']], // Invalidate these queries on refresh
 *   { tintColor: '#ff0000' }
 * )
 * // Use with FlatList: refreshControl={<RefreshControl {...refreshControlProps} />}
 * ```
 */
export function useQueryRefreshControlProps(
  queries: UseGenericQueryResult[],
  invalidateQueryKeys?: QueryKey[],
  RefreshControlProps?: RefreshControlProps,
) {
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()

  async function onRefresh() {
    RefreshControlProps?.onRefresh?.()
    setRefreshing(true)

    try {
      await Promise.all(queries.filter((q) => q.isFetched || q.isFetching).map((query) => query.refetch()))

      if (invalidateQueryKeys?.length) {
        invalidateQueryKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
    } finally {
      setRefreshing(false)
    }
  }

  return { ...RefreshControlProps, onRefresh, refreshing }
}
