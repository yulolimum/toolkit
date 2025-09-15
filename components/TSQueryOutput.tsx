import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'

import { useCallback, useMemo } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

type TSQueryOutputProps<T> = {
  query: UseQueryResult<T, any>
  empty?: ReactNode
  emptyPredicate?: (data: T) => boolean
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

/**
 * A React component that handles different states of a React Query result with customizable UI for each state.
 * Provides a declarative way to render loading, error, empty, and success states for query results.
 *
 * @param query - The React Query result object (from useQuery or useInfiniteQuery)
 * @param empty - Content to show when data is empty (default: "No data found")
 * @param emptyPredicate - Function to determine if data should be considered empty
 * @param loading - Content to show while loading (default: ActivityIndicator with "Loading..." text)
 * @param error - Content to show on error (default: "Error loading data")
 * @param success - Content to show on successful load (takes precedence over children)
 * @param children - Content to show on successful load (used if success is not provided)
 * @param defaultHeight - Minimum height for state containers (default: 125)
 * @param styles - Optional style overrides for containers and text in each state
 *
 * @example
 * Basic usage with default states:
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
 * Custom empty and loading states:
 * ```typescript
 * const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
 *
 * return (
 *   <TSQueryOutput
 *     query={postsQuery}
 *     empty={<CustomEmptyState />}
 *     loading={<CustomLoader />}
 *     emptyPredicate={(data) => !data || data.length === 0}
 *   >
 *     <PostsList posts={postsQuery.data} />
 *   </TSQueryOutput>
 * )
 * ```
 *
 * @example
 * String-based states with custom styling:
 * ```typescript
 * return (
 *   <TSQueryOutput
 *     query={articlesQuery}
 *     empty="No articles available"
 *     loading="Loading articles..."
 *     error="Failed to load articles"
 *     defaultHeight={200}
 *   >
 *     <ArticleList articles={articlesQuery.data} />
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
 *       loadingText: { fontSize: 16, fontWeight: 'bold' },
 *       emptyText: { color: '#666', fontStyle: 'italic' },
 *       errorText: { color: '#d32f2f', fontSize: 14 }
 *     }}
 *   >
 *     <DataList data={dataQuery.data} />
 *   </TSQueryOutput>
 * )
 * ```
 */
export function TSQueryOutput<T>(props: TSQueryOutputProps<T>) {
  const { query, empty, loading, error, success, children, emptyPredicate, defaultHeight = 125, styles = {} } = props

  const emptyResolved = useMemo(() => empty ?? 'No data found', [empty])

  const loadingResolved = useMemo(
    () =>
      loading ?? (
        <View style={[$blockContainer, styles.loadingContainer, { height: defaultHeight }]}>
          <ActivityIndicator size="large" />
        </View>
      ),
    [loading, defaultHeight, styles.loadingContainer],
  )

  const errorResolved = useMemo(() => error ?? 'Error loading data', [error])

  const emptyPredicateResolved = useCallback(
    emptyPredicate ??
      ((d: any) => {
        if (!d) return true
        if (Array.isArray(d)) return !d.length
        return false
      }),
    [emptyPredicate],
  )

  if (!query) return null

  const emptyStrType = typeof emptyResolved === 'string'
  const loadingStrType = typeof loadingResolved === 'string'
  const errorStrType = typeof errorResolved === 'string'

  if (!query.isLoading && emptyPredicateResolved(query.data as any)) {
    return !emptyStrType ? (
      emptyResolved
    ) : (
      <View style={[$blockContainer, styles.emptyContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'gray' }, styles.emptyText]}>{emptyResolved}</Text>
      </View>
    )
  } else if (query.isLoading) {
    return !loadingStrType ? (
      loadingResolved
    ) : (
      <View style={[$blockContainer, styles.loadingContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'gray' }, styles.loadingText]}>{loadingResolved}</Text>
      </View>
    )
  } else if (query.isError) {
    return !errorStrType ? (
      errorResolved
    ) : (
      <View style={[$blockContainer, styles.errorContainer, { minHeight: defaultHeight }]}>
        <Text style={[{ color: 'red' }, styles.errorText]}>{errorResolved}</Text>
      </View>
    )
  } else {
    return success ?? children ?? null
  }
}

const $blockContainer: ViewStyle = {
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
}
