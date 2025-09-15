import type { UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query'
import type { RefreshControlProps } from 'react-native'

import { useState } from 'react'

type UseGenericQueryResult = UseInfiniteQueryResult<any, any> | UseQueryResult<any, any>

/**
 * A React hook that provides RefreshControl props for React Native ScrollView/FlatList components
 * that automatically refetches multiple React Query queries when pulled to refresh.
 *
 * @param queries - Array of React Query results (useQuery or useInfiniteQuery) to refetch on refresh
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
 * Usage with infinite query and additional props:
 * ```typescript
 * const postsQuery = useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   getNextPageParam: (lastPage) => lastPage.nextCursor
 * })
 * const refreshControlProps = useQueryRefreshControlProps(
 *   [postsQuery],
 *   { tintColor: '#ff0000' }
 * )
 * // Use with FlatList: refreshControl={<RefreshControl {...refreshControlProps} />}
 * ```
 */
export function useQueryRefreshControlProps(
  queries: UseGenericQueryResult[],
  RefreshControlProps?: RefreshControlProps,
) {
  const [refreshing, setRefreshing] = useState(false)

  async function onRefresh() {
    RefreshControlProps?.onRefresh?.()
    setRefreshing(true)

    try {
      await Promise.all(queries.map((query) => query.refetch()))
    } finally {
      setRefreshing(false)
    }
  }

  return { ...RefreshControlProps, onRefresh, refreshing }
}
