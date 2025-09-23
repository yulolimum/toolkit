---
priority: 4
category: programming
description: 'React component best practices covering prop types, function declarations, exports, destructuring, and hook imports'
---

# Rules for React Components

1.  **Define Prop Types Above the Component**
    - Always define the types for component props using an interface or type alias.
    - Place the prop type definition above the component function declaration.
    - Avoid defining prop types inline within the component's function arguments.

2.  **Prefer `type` over `interface`**
    - Use `type` for defining prop types unless you need to extend existing types.
    - `interface` should be used when defining types that need to be extended by other interfaces.

3.  **Prefer Named Functions for Components**
    - Use named function declarations for React components instead of anonymous functions, function expressions, or arrow functions assigned to `const` variables.
    - Named functions improve debugging by providing clear names in stack traces.
    - They also enhance readability and make it easier to identify components in code.
    - Named functions improve debugging by providing clear names in stack traces.
    - They also enhance readability and make it easier to identify components in code.

4.  **Export Components/Types on Declaration**
    - Export individual components, types, and interfaces directly when they are declared.
    - Avoid collecting all exports at the bottom of the file.
    - This improves code readability and makes it easier to see what is being exported at a glance.

5.  **Destructure Props Inside Function Body**
    - Never destructure props directly in the function argument.
    - Always destructure props on their own line inside the function body.
    - Use nullish coalescing (`??`) for safety when destructuring potentially nullable/undefined props.
    - This improves readability, especially for components with many props.

6.  **Avoid Module Namespace for React Hooks**
    - Never use the module namespace for React hooks (e.g., `React.useEffect`).
    - Always import hooks individually (e.g., `useEffect`).
    - This leads to cleaner code and better tree-shaking.

## Example Component

```tsx
// Good Example (Adheres to all rules)
import { useEffect } from 'react' // Rule 6: Import hooks individually

type GoodComponentProps = {
  // Rule 2: Prefer type over interface
  id: string
  name: string
  count: number
}

export function GoodComponent(props: GoodComponentProps) {
  // Rule 3: Named function, Rule 4: Export on declaration
  const safeProps = props ?? {} // Rule 5: Use nullish coalescing for safety
  const { id, name, count } = safeProps // Rule 5: Destructure props inside function body

  useEffect(() => {
    // Rule 6: Import hooks individually
    console.log(`Component ${id} mounted`)
  }, [id])

  return (
    <div>
      <p>ID: {id}</p>
      <p>Name: {name}</p>
      <p>Count: {count}</p>
    </div>
  )
}

// Bad Example (Violates all rules)
const BadComponent = ({ message, value }: { message: string; value: number }) => {
  // Rule 1: Inline prop types, Rule 3: Arrow function, Rule 5: Destructure props in argument
  React.useEffect(() => {
    // Rule 6: Use module namespace for hooks
    console.log(`Bad component: ${message}`)
  }, [message])

  return (
    <div>
      <p>Message: {message}</p>
      <p>Value: {value}</p>
    </div>
  )
}

// No export here, violating Rule 4
```
