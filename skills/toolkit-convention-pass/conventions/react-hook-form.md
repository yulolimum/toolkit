# React Hook Form

Assign the complete `useForm` result to `form`.

Do not destructure the `useForm` result. Access its values through `form`, such as `form.control`, `form.setError`, and `form.formState.isSubmitting`.

Destructure only when it is absolutely necessary. Keep the exception local.

When a resolver supports schema inference, do not pass an explicit generic to `useForm`. Let the resolver infer field inputs and submitted outputs.

Use the inferred schema type for a standalone submit function. Pass that function to `form.handleSubmit`.

```tsx
const LoginFormSchema = z.object({
  email: z.email(),
})

type LoginFormSchema = z.infer<typeof LoginFormSchema>

const form = useForm({
  resolver: zodResolver(LoginFormSchema),
  defaultValues: { email: '' },
})

async function submit(values: LoginFormSchema) {}

return <form onSubmit={form.handleSubmit(submit)} />
```
