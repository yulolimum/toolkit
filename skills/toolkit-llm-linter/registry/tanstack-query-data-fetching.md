# TanStack Query conventions

Apply this prompt when you review React or TypeScript code that uses TanStack Query, frontend API clients, provider SDKs, query key changes, or mutations.

## Core rules

- A query function should call one endpoint or one provider SDK read operation.
- Do not hide multiple endpoint calls behind a shared fetch helper.
- Use multiple `useQuery` calls in consumers. Use `enabled` to manage their dependencies.
- Derive UI-ready data in consumers after query data arrives, usually with `useMemo`.
- Do not map, filter, merge, or reshape API response data inside the query function.
- Keep transforms out of the `queryFn`; derive data after the query returns.
- Put consumer-only UI shaping near the consumer. Put reusable domain logic in the appropriate service or module.
- Prefer types inferred from the API client or query data. Avoid hand-authored argument and DTO types for local transforms unless the API client forces them.
- Query keys still belong in the app's query key namespace when the project has one.

## Mutation rules

- A mutation function should perform only the mutation or write operation.
- Do not put side effects in `mutationFn`. This includes cache writes, storage writes, toasts, navigation, dialog close/reset, query invalidation, and local UI cleanup.
- Put side effects in TanStack mutation callbacks:
  - `onMutate` for optimistic/cache/storage preparation that must happen when the mutation starts.
  - `onSuccess` for success toasts, query invalidation/refetch, navigation, closing dialogs, and form reset.
  - `onError` for error toasts and rollback.
  - `onSettled` for cleanup that must happen regardless of outcome.
- Trigger mutations synchronously from UI event handlers with `mutate(...)`.
- Do not make submit or click handlers `async` only to `await mutateAsync(...)`.
- Do not use `try/catch` around mutation triggers for UI side effects. Handle success and failure in mutation callbacks.
- Use `mutateAsync` only when an imperative non-React caller truly needs a promise result. Prefer `mutate` in ordinary React UI code.

## What to flag

Flag code like this:

```ts
export async function getProjectOptions() {
  const [user, workspaces] = await Promise.all([api.getUser(), api.getWorkspaces()])
  const workspace = workspaces.find(...)
  const projects = await api.getProjects({ workspaceId: workspace.id })
  return projects.map(...)
}

const projectsQuery = useQuery({
  queryKey: queryKeys.projects(),
  queryFn: getProjectOptions,
})
```

Prefer this structure:

```ts
const userQuery = useQuery({
  queryKey: queryKeys.user(),
  queryFn: () => api.getUser(),
})

const workspacesQuery = useQuery({
  queryKey: queryKeys.workspaces(),
  queryFn: () => api.getWorkspaces(),
})

const workspace = useMemo(() => {
  return workspacesQuery.data?.find(...)
}, [userQuery.data, workspacesQuery.data])

const projectsQuery = useQuery({
  queryKey: queryKeys.projects({ params: { workspaceId: workspace?.id } }),
  queryFn: () => api.getProjects({ workspaceId: workspace!.id }),
  enabled: Boolean(workspace?.id),
})

const projectOptions = useMemo(() => {
  return projectsQuery.data?.map(...) ?? []
}, [projectsQuery.data])
```

## Acceptable exceptions

- Authentication and credential bridge calls can stay in API-client plumbing when they are not app data.
- Low-level generated clients may normalize transport details, headers, or validation. Do not force generated code into consumer files.
- A single endpoint can accept request params and return raw data. The consumer still owns UI-specific derivation.

## Review output

When this prompt finds issues, list each issue with the consumer file. Include the hidden endpoint calls or transform. State the desired structure in one sentence: split the endpoint calls into separate queries, then derive consumer-specific data locally.
