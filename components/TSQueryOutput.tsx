import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'

import { ActivityIndicator, Text, View } from 'react-native'

type TSQueryOutputProps<T> = {
  query?: UseQueryResult<T, any>
  queries?: UseQueryResult<any, any>[]
  empty?: ReactNode
  emptyPredicate?: () => boolean
  loading?: ReactNode
  error?: ReactNode
  success?: ReactNode
  children?: ReactNode
  defaultHeight?: number
  styles?: {
    loadingContainer?: ViewStyle
    emptyContainer?: ViewStyle
    errorContainer?: ViewStyle
    loadingText?: TextStyle
    emptyText?: TextStyle
    errorText?: TextStyle
  }
}

function isEmptyData(data: any): boolean {
  if (!data) return true
  if (Array.isArray(data)) return !data.length
  return false
}

/**
 * A React component that handles different states of React Query results with customizable UI for each state.
 * Supports both single query and multiple queries, providing a declarative way to render loading, error,
 * empty, and success states.
 *
 * @param query - Optional single React Query result object (from useQuery or useInfiniteQuery)
 * @param queries - Optional array of React Query results for handling multiple queries together
 * @param empty - Content to show when data is empty (default: "No data found")
 * @param emptyPredicate - Function to determine if data should be considered empty (overrides default check)
 * @param loading - Content to show while loading (default: ActivityIndicator)
 * @param error - Content to show on error (default: "Error loading data")
 * @param success - Content to show on successful load (takes precedence over children)
 * @param children - Content to show on successful load (used if success is not provided)
 * @param defaultHeight - Minimum height for state containers (default: 125)
 * @param styles - Optional style overrides for containers and text in each state
 *
 * @example
 * Basic usage with single query:
 * ```typescript
 * const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
 *
 * return (
 *   <TSQueryOutput query={usersQuery}>
 *     {usersQuery.data?.map(user => <UserCard key={user.id} user={user} />)}
 *   </TSQueryOutput>
 * )
 * ```
 *
 * @example
 * Multiple queries - waits for all to load, shows error if any fail:
 * ```typescript
 * const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
 * const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
 *
 * return (
 *   <TSQueryOutput query={usersQuery} queries={[postsQuery]}>
 *     <UserPostsList users={usersQuery.data} posts={postsQuery.data} />
 *   </TSQueryOutput>
 * )
 * ```
 *
 * @example
 * Custom empty predicate with multiple queries:
 * ```typescript
 * return (
 *   <TSQueryOutput
 *     queries={[usersQuery, postsQuery]}
 *     emptyPredicate={() => !usersQuery.data?.length && !postsQuery.data?.length}
 *     empty="No users or posts found"
 *   >
 *     <Content />
 *   </TSQueryOutput>
 * )
 * ```
 *
 * @example
 * Custom styling with styles prop:
 * ```typescript
 * return (
 *   <TSQueryOutput
 *     query={dataQuery}
 *     styles={{
 *       loadingContainer: { backgroundColor: '#f0f0f0', borderRadius: 8 },
 *       emptyContainer: { padding: 20 },
 *       errorContainer: { backgroundColor: '#ffe6e6' },
 *       errorText: { color: '#d32f2f', fontSize: 14 }
 *     }}
 *   >
 *     <DataList data={dataQuery.data} />
 *   </TSQueryOutput>
 * )
 * ```
 */
export function TSQueryOutput<T>(props: TSQueryOutputProps<T>) {
  const {
    query,
    queries = [],
    empty = 'No data found',
    loading,
    error = 'Error loading data',
    success = null,
    children = null,
    emptyPredicate,
    defaultHeight = 125,
    styles = {},
  } = props

  const allQueries = query ? [query, ...queries] : queries

  if (allQueries.length === 0) return null

  const isLoading = allQueries.some((q) => q.isLoading)
  const isError = allQueries.some((q) => q.isError)
  const isFetched = allQueries.every((q) => q.isFetched || (!q.isLoading && !q.isFetching))

  const emptyStrType = typeof empty === 'string'
  const loadingStrType = typeof loading === 'string'
  const errorStrType = typeof error === 'string'

  if (isLoading) {
    if (loading === undefined) {
      return (
        <View style={[$blockContainer, styles.loadingContainer, { minHeight: defaultHeight }]}>
          <ActivityIndicator size="large" />
        </View>
      )
    }
    return !loadingStrType ? (
      loading
    ) : (
      <View style={[$blockContainer, styles.loadingContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'gray' }, styles.loadingText]}>{loading}</Text>
      </View>
    )
  }

  if (isError) {
    return !errorStrType ? (
      error
    ) : (
      <View style={[$blockContainer, styles.errorContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'red' }, styles.errorText]}>{error}</Text>
      </View>
    )
  }

  const shouldShowEmpty = isFetched && (emptyPredicate?.() ?? isEmptyData(allQueries[0]?.data))

  if (shouldShowEmpty) {
    return !emptyStrType ? (
      empty
    ) : (
      <View style={[$blockContainer, styles.emptyContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'gray' }, styles.emptyText]}>{empty}</Text>
      </View>
    )
  }

  return success ?? children ?? null
}

const $blockContainer: ViewStyle = {
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
}
