# Zod schema naming

Name each Zod schema value in PascalCase. End the name with `Schema`.

When code needs the inferred type, infer it from the schema. Give the type the same name as the schema. TypeScript permits the value and type to share a name.

Do not declare an inferred type when code does not use it.

```ts
const SignUpSearchSchema = z.object({
  product: z.string(),
});

type SignUpSearchSchema = z.infer<typeof SignUpSearchSchema>;
```
