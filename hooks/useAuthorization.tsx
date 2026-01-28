import type { PropsWithChildren, ReactNode } from 'react'

import { createContext, useContext, useMemo } from 'react'

type Authorization =
  | 'ExampleUserLoggedIn'
  | 'ExampleUserPro'
  | 'ExampleUserAdmin'
  | 'ExampleCanEdit'
  | 'ExampleCanDelete'

type BaseAuthorizationRequest = {
  [K in Authorization]?: boolean
}

type AuthorizationRequest =
  | BaseAuthorizationRequest
  | { and: BaseAuthorizationRequest }
  | { or: BaseAuthorizationRequest }

/**
 * Computes authorization flags from your app's auth state.
 * Replace with your own authentication hook and authorization logic.
 */
function useAuthorizationContext() {
  // Replace with your own auth hook, e.g.:
  // const { user, authenticated, permissions } = useAuth()
  const user = { id: '1', role: 'admin', plan: 'free' }
  const authenticated = true
  const permissions = { canEdit: true, canDelete: false }

  const authorizations = useMemo(
    () =>
      ({
        ExampleUserLoggedIn: authenticated,
        ExampleUserPro: user?.plan === 'pro',
        ExampleUserAdmin: user?.role === 'admin',
        ExampleCanEdit: !!permissions?.canEdit,
        ExampleCanDelete: !!permissions?.canDelete,
      }) satisfies Record<Authorization, boolean>,
    [authenticated, user?.plan, user?.role, permissions?.canEdit, permissions?.canDelete],
  )

  return authorizations
}

/**
 * Provider component that makes authorization context available to the app.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthorizationProvider>
 *       <MainContent />
 *     </AuthorizationProvider>
 *   )
 * }
 * ```
 */
export function AuthorizationProvider(props: PropsWithChildren) {
  const data = useAuthorizationContext()
  return <AuthorizationContext.Provider value={data}>{props.children}</AuthorizationContext.Provider>
}

/**
 * Hook to check authorization status. Can be called with no arguments to get all
 * authorization flags, or with a request object to check specific conditions.
 *
 * Supports AND/OR logic for combining multiple checks:
 * - Default (no wrapper): AND logic
 * - `{ and: { ... } }`: Explicit AND logic
 * - `{ or: { ... } }`: OR logic (any condition can be true)
 *
 * @example
 * Get all authorization flags:
 * ```tsx
 * const auths = useAuthorization()
 * console.log(auths.ExampleUserLoggedIn, auths.ExampleUserPro)
 * ```
 *
 * @example
 * Single check:
 * ```tsx
 * const isLoggedIn = useAuthorization({ ExampleUserLoggedIn: true })
 * const isNotPro = useAuthorization({ ExampleUserPro: false })
 * ```
 *
 * @example
 * AND logic (all must be true):
 * ```tsx
 * const canDelete = useAuthorization({ and: { ExampleUserAdmin: true, ExampleCanDelete: true } })
 * ```
 *
 * @example
 * OR logic (any can be true):
 * ```tsx
 * const canModify = useAuthorization({ or: { ExampleUserAdmin: true, ExampleCanEdit: true } })
 * ```
 */
export function useAuthorization(): AuthorizationContext
export function useAuthorization(request: AuthorizationRequest): boolean
export function useAuthorization(request?: AuthorizationRequest) {
  const authorizations = useContext(AuthorizationContext)

  const authorizationForRequest = useMemo(() => {
    if (!request) return true

    const base = 'and' in request ? request.and : 'or' in request ? request.or : request
    const op: 'and' | 'or' = 'or' in request ? 'or' : 'and'

    const entries = Object.entries(base) as [Authorization, boolean][]

    if (entries.length === 0) return false

    const results = entries.map(([key, expected]) => authorizations[key] === expected)
    return op === 'or' ? results.some(Boolean) : results.every(Boolean)
  }, [authorizations, request])

  if (request) {
    return authorizationForRequest
  } else {
    return authorizations
  }
}

type AuthorizedProps = PropsWithChildren<{
  auth: AuthorizationRequest
  fallback?: ReactNode
}>

/**
 * Component that conditionally renders children based on authorization.
 *
 * @param auth - Authorization request to check
 * @param fallback - Optional content to render when not authorized (default: null)
 * @param children - Content to render when authorized
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Authorized auth={{ ExampleUserLoggedIn: true }} fallback={<LoginPrompt />}>
 *   <UserDashboard />
 * </Authorized>
 * ```
 *
 * @example
 * With AND logic:
 * ```tsx
 * <Authorized auth={{ and: { ExampleUserAdmin: true, ExampleCanDelete: true } }}>
 *   <DangerZone />
 * </Authorized>
 * ```
 *
 * @example
 * With OR logic:
 * ```tsx
 * <Authorized auth={{ or: { ExampleUserPro: true, ExampleUserAdmin: true } }}>
 *   <PremiumFeature />
 * </Authorized>
 * ```
 */
export function Authorized(props: AuthorizedProps) {
  const { auth, children, fallback = null } = props
  const authorized = useAuthorization(auth)
  return authorized ? children : fallback
}

type AuthorizationContext = ReturnType<typeof useAuthorizationContext>
const AuthorizationContext = createContext<AuthorizationContext>({} as AuthorizationContext)
