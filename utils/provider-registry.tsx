import type { ComponentProps, ComponentType, PropsWithChildren, ReactNode } from 'react'

type ProviderProps<T extends { [K: string]: ComponentType<any> }> = PropsWithChildren<{
  /**
   * Map of provider names to React components.
   * Each key becomes available as `${key}Props`.
   */
  registry: T
  /**
   * Ordered list of provider names to wrap the children with.
   * `false` entries are ignored. First item becomes the outermost provider.
   */
  providers: Array<keyof T | false>
}> & {
  /**
   * Props passed to each provider component.
   * The key is `${ProviderName}Props`.
   * `children` is optional and defaults to the accumulated subtree.
   */
  [K in Exclude<keyof T, symbol> as `${K}Props`]?: Omit<ComponentProps<T[K]>, 'children'> & {
    children?: ReactNode
  }
}

/**
 * A component that composes multiple React providers without deep nesting.
 * Providers are applied in order (first = outermost) and can be conditionally included.
 *
 * @param registry - Map of provider names to React components
 * @param providers - Ordered list of provider names (false entries are filtered out)
 * @param children - Content to wrap with providers
 * @param [ProviderName]Props - Props for each provider (e.g., ThemeProps, AuthProps)
 *
 * @example
 * Basic usage - replace nested providers:
 * ```tsx
 * // Before: deeply nested providers
 * <ThemeProvider theme={theme}>
 *   <AuthProvider>
 *     <QueryClientProvider client={queryClient}>
 *       <App />
 *     </QueryClientProvider>
 *   </AuthProvider>
 * </ThemeProvider>
 *
 * // After: flat composition
 * <ProviderRegistry
 *   registry={{ Theme: ThemeProvider, Auth: AuthProvider, Query: QueryClientProvider }}
 *   providers={['Theme', 'Auth', 'Query']}
 *   ThemeProps={{ theme }}
 *   QueryProps={{ client: queryClient }}
 * >
 *   <App />
 * </ProviderRegistry>
 * ```
 *
 * @example
 * Conditional providers:
 * ```tsx
 * <ProviderRegistry
 *   registry={{ Theme: ThemeProvider, Auth: AuthProvider, Debug: DebugProvider }}
 *   providers={['Theme', 'Auth', __DEV__ && 'Debug']}
 *   ThemeProps={{ theme }}
 * >
 *   <App />
 * </ProviderRegistry>
 * ```
 *
 * @example
 * Reusable provider config:
 * ```tsx
 * const registry = {
 *   Theme: ThemeProvider,
 *   Auth: AuthProvider,
 *   Query: QueryClientProvider,
 *   Navigation: NavigationContainer,
 * } as const
 *
 * function AppProviders({ children }: PropsWithChildren) {
 *   return (
 *     <ProviderRegistry
 *       registry={registry}
 *       providers={['Theme', 'Auth', 'Query', 'Navigation']}
 *       ThemeProps={{ theme: darkTheme }}
 *       QueryProps={{ client: queryClient }}
 *     >
 *       {children}
 *     </ProviderRegistry>
 *   )
 * }
 * ```
 */
export function ProviderRegistry<T extends { [K: string]: ComponentType<any> }>(props: ProviderProps<T>) {
  const providers = props.providers.filter((name): name is Exclude<typeof name, false> => name !== false)

  return providers.reduceRight<ReactNode>((acc, name) => {
    const ProviderComponent = props.registry[name] as ComponentType<any>
    const providerProps = (props as any)[`${String(name)}Props`] ?? {}

    return <ProviderComponent {...providerProps}>{acc}</ProviderComponent>
  }, props.children)
}
