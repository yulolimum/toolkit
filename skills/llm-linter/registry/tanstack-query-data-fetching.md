# TanStack Query conventions

Apply this prompt when reviewing React or TypeScript code that uses TanStack Query, frontend API clients, provider SDKs, query key changes, or mutations.

## Core rules

- A query function should call one endpoint or one provider SDK read operation.
- Do not hide multiple endpoint calls behind a shared fetch helper.
- Consumers compose multiple `useQuery` calls and wire dependencies with `enabled`.
- Consumers derive UI-ready data after query data arrives, usually in `useMemo`.
- Do not map, filter, merge, or reshape API response data inside the query function.
- Keep transforms out of the `queryFn`; derive data after the query returns.
- Helper placement is contextual: consumer-only UI shaping can live near the consumer, while reusable domain logic can live in the appropriate service/module.
- Prefer inferred types from the API client or query data. Avoid hand-authored argument and DTO types for local transforms unless the API client forces them.
- Query keys still belong in the app's query key namespace when the project has one.

## Mutation rules

- A mutation function should do one thing only: perform the mutation/write operation.
- Do not put side effects inside `mutationFn`: no cache writes, storage writes, toasts, navigation, dialog close/reset, query invalidation, or local UI cleanup there.
- Put side effects in TanStack mutation callbacks:
  - `onMutate` for optimistic/cache/storage preparation that must happen when the mutation starts.
  - `onSuccess` for success toasts, query invalidation/refetch, navigation, closing dialogs, and form reset.
  - `onError` for error toasts and rollback.
  - `onSettled` for cleanup that must happen regardless of outcome.
- UI event handlers should trigger mutations synchronously with `mutate(...)`.
- Do not make submit/click handlers `async` only to `await mutateAsync(...)`.
- Do not use `try/catch` around mutation triggers for UI side effects; handle success and failure in mutation callbacks.
- Use `mutateAsync` only when a non-React imperative caller truly needs a promise result. In ordinary React UI code, prefer `mutate`.

## What to flag

Flag code shaped like this:

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

Prefer this shape:

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

When this prompt finds issues, list each issue with the consumer file and the hidden endpoint calls or hidden transform. State the desired shape in one sentence: split the endpoint calls into separate queries, then derive the consumer-specific data locally.
