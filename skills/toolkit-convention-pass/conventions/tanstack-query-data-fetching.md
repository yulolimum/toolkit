# TanStack Query

Apply this convention when you review React or TypeScript code that uses TanStack Query, a frontend API client, a provider SDK, a query key, or a mutation.

## Queries

- A query function calls one endpoint, or one read operation of a provider SDK.
- Do not hide more than one endpoint call behind a shared fetch helper.
- Use more than one `useQuery` call in a consumer. Use `enabled` to control the dependency between them.
- Derive the data that the UI needs in the consumer, after the query data arrives. Use `useMemo` for that work.
- Do not map, filter, merge, or reshape response data inside the query function. Keep each transform out of `queryFn`, and derive the data after the query returns.
- Put UI shaping that one consumer needs near that consumer. Put reusable domain logic in the service or the module that owns it.
- Prefer a type that the API client or the query data infers. Do not write an argument type or a DTO type by hand for a local transform, unless the API client requires one.
- A query key belongs in the query key namespace of the app, when the app has one.

## Mutations

- A mutation function performs the mutation alone.
- Do not put a side effect in `mutationFn`. A cache write, a storage write, a toast, navigation, a dialog close, a dialog reset, query invalidation, and local UI cleanup are each such a side effect.
- Put each side effect in a mutation callback:
  - `onMutate` for the optimistic, cache, or storage preparation that must occur when the mutation starts.
  - `onSuccess` for a success toast, query invalidation, a refetch, navigation, a dialog close, and a form reset.
  - `onError` for an error toast and a rollback.
  - `onSettled` for cleanup that must occur after each outcome.
- Start a mutation from a UI event handler with `mutate(...)`, and do so synchronously.
- Do not make a submit handler or a click handler `async` only to await `mutateAsync(...)`.
- Do not put `try`/`catch` around a mutation trigger to run a UI side effect. Handle success and failure in the mutation callbacks.
- Use `mutateAsync` only when an imperative caller outside React needs the promise result. Prefer `mutate` in ordinary React UI code.

## What to report

Report code such as this:

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

## Permitted exceptions

- An authentication call and a credential bridge call can stay in the plumbing of the API client, because they carry no app data.
- A low-level generated client can normalize a transport detail, a header, or validation. Do not move generated code into a consumer file.
- One endpoint can accept request params and return raw data. The consumer still owns the derivation that its UI needs.

## Report format

When this convention finds a problem, give each problem with its consumer file. Name the endpoint calls or the transform that the code hides. Then state the structure to use, in one sentence: divide the endpoint calls into separate queries, then derive the data that the consumer needs in the consumer.
