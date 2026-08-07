import type { UseQueryResult } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import type { ViewProps, ViewStyle } from 'react-native'

import { createContext, useContext } from 'react'
import { ActivityIndicator, Button, Text, View } from 'react-native'

/** Query lifecycle flags consumed by the query-state components. */
export type QueryStateStatus = Pick<
  UseQueryResult<unknown, Error>,
  'isError' | 'isFetching' | 'isLoading' | 'isPending'
>

export type QueryStateProviderProps = Readonly<
  PropsWithChildren<{
    isEmpty?: boolean
    query: QueryStateStatus
  }>
>

type QueryStateViewProps = Readonly<ViewProps & { when?: boolean }>

type QueryStateFeedbackProps = QueryStateViewProps &
  Readonly<{
    message?: string
  }>

type QueryStateErrorProps = QueryStateFeedbackProps &
  Readonly<{
    onRetry?: () => void
  }>

function useQueryStateData(query: QueryStateStatus, isEmpty = false) {
  return {
    // data
    isEmpty,
    // queries
    queries: {
      query,
    },
  }
}

type QueryStateContext = ReturnType<typeof useQueryStateData>
const QueryStateContext = createContext<QueryStateContext | null>(null)

/**
 * Shares one query's lifecycle flags and a consumer-derived empty state with
 * explicit query-state components.
 *
 * Derive `isEmpty` where the data is known instead of relying on a built-in
 * empty check. That keeps lists, objects, and domain-specific results honest.
 *
 * @example
 * ```tsx
 * <QueryStateProvider isEmpty={usersQuery.data?.length === 0} query={usersQuery}>
 *   <QueryStateLoading message="Loading users..." />
 *   <QueryStateError onRetry={usersQuery.refetch} />
 *   <QueryStateEmpty message="No users found." />
 *   <QueryStateContent>
 *     <UserList users={usersQuery.data ?? []} />
 *   </QueryStateContent>
 *   <QueryStateFetching />
 * </QueryStateProvider>
 * ```
 */
export function QueryStateProvider(props: QueryStateProviderProps) {
  const data = useQueryStateData(props.query, props.isEmpty)

  return <QueryStateContext.Provider value={data}>{props.children}</QueryStateContext.Provider>
}

/**
 * Reads the state shared by `QueryStateProvider`.
 *
 * @throws {Error} When called outside a `QueryStateProvider`.
 */
export function useQueryState() {
  const context = useContext(QueryStateContext)

  if (!context) throw new Error('QueryState components require QueryStateProvider.')

  return context
}

function QueryStateFeedbackContainer(props: ViewProps) {
  const { style, ...viewProps } = props

  return <View {...viewProps} style={[$feedbackContainer, style]} />
}

function QueryStateMessage(props: Readonly<{ message?: string }>) {
  return props.message ? <Text>{props.message}</Text> : null
}

/**
 * Renders content after a query has settled successfully with non-empty data.
 * Set `when` to replace that condition, for example to preserve stale content
 * after an error.
 */
export function QueryStateContent(props: QueryStateViewProps) {
  const { isEmpty, queries } = useQueryState()
  const { children, style, when, ...viewProps } = props
  const { query } = queries
  const shouldRender = when ?? (!query.isPending && !query.isError && !isEmpty)

  if (!shouldRender) return null

  return (
    <View {...viewProps} style={[$content, style]}>
      {children}
    </View>
  )
}

/**
 * Renders while a query is pending but not fetching, such as before an enabled
 * query starts its first request. Set `when` to replace the default condition.
 */
export function QueryStatePending(props: QueryStateFeedbackProps) {
  const { queries } = useQueryState()
  const { children, message, style, when, ...viewProps } = props
  const { query } = queries

  if (!(when ?? (query.isPending && !query.isFetching))) return null

  return (
    <QueryStateFeedbackContainer {...viewProps} style={style}>
      {children ?? (
        <>
          <ActivityIndicator />
          <QueryStateMessage message={message} />
        </>
      )}
    </QueryStateFeedbackContainer>
  )
}

/**
 * Renders during TanStack Query's initial active load. Custom children replace
 * the default centered spinner, and `when` replaces the default condition.
 */
export function QueryStateLoading(props: QueryStateFeedbackProps) {
  const { queries } = useQueryState()
  const { children, message, style, when, ...viewProps } = props
  const { query } = queries

  if (!(when ?? query.isLoading)) return null

  if (children != null) {
    return (
      <View {...viewProps} style={[$content, style]}>
        {children}
      </View>
    )
  }

  return (
    <QueryStateFeedbackContainer {...viewProps} style={style}>
      <ActivityIndicator />
      <QueryStateMessage message={message} />
    </QueryStateFeedbackContainer>
  )
}

/**
 * Renders during a non-initial fetch without replacing existing content.
 * Provide children to customize the indicator, or set `when` to replace the
 * default background-fetch condition.
 */
export function QueryStateFetching(props: QueryStateViewProps) {
  const { queries } = useQueryState()
  const { children, pointerEvents = 'none', style, when, ...viewProps } = props
  const { query } = queries

  if (!(when ?? (query.isFetching && !query.isLoading))) return null

  return (
    <View {...viewProps} pointerEvents={pointerEvents} style={[$fetchingIndicator, style]}>
      {children ?? <ActivityIndicator size="small" />}
    </View>
  )
}

/**
 * Renders for a failed query. Children replace the default message and optional
 * retry button; `when` replaces the error condition.
 */
export function QueryStateError(props: QueryStateErrorProps) {
  const { queries } = useQueryState()
  const { children, message = 'Unable to load data.', onRetry, style, when, ...viewProps } = props
  const { query } = queries

  if (!(when ?? query.isError)) return null

  return (
    <QueryStateFeedbackContainer {...viewProps} style={style}>
      {children ?? (
        <>
          <Text>{message}</Text>
          {onRetry ? <Button title="Retry" onPress={onRetry} /> : null}
        </>
      )}
    </QueryStateFeedbackContainer>
  )
}

/**
 * Renders after a successful settled query when the provider's `isEmpty` value
 * is true. Children replace the default message, and `when` replaces the
 * default condition.
 */
export function QueryStateEmpty(props: QueryStateFeedbackProps) {
  const { isEmpty, queries } = useQueryState()
  const { children, message = 'No results found.', style, when, ...viewProps } = props
  const { query } = queries

  if (!(when ?? (!query.isPending && !query.isError && isEmpty))) return null

  return (
    <QueryStateFeedbackContainer {...viewProps} style={style}>
      {children ?? <Text>{message}</Text>}
    </QueryStateFeedbackContainer>
  )
}

const $content: ViewStyle = {
  flexGrow: 1,
  position: 'relative',
}

const $feedbackContainer: ViewStyle = {
  alignItems: 'center',
  flexGrow: 1,
  justifyContent: 'center',
  minHeight: 125,
}

const $fetchingIndicator: ViewStyle = {
  position: 'absolute',
  right: 8,
  top: 8,
}
