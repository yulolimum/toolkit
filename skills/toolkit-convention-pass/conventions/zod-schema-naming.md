# Zod schema naming

Name each Zod schema value in PascalCase. End the name with `Schema`.

When code needs the inferred type, infer it from the schema. Give the type the same name as the schema. TypeScript permits a value and a type to share one name.

Do not declare an inferred type that no code uses.

```ts
const SignUpSearchSchema = z.object({
  product: z.string(),
})

type SignUpSearchSchema = z.infer<typeof SignUpSearchSchema>
```
