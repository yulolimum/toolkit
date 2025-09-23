---
priority: 3
category: programming
description: 'General programming guidelines covering comments, naming conventions, exports, function definitions, and codebase exploration'
---

# General Programming Rules

## 1. Minimal Comments Rule

**Default to NO comments.** Only add comments when code does something that would genuinely confuse a senior developer.

### When NOT to Comment

- Array methods: `filter`, `map`, `reduce`, `forEach`, `find`, etc.
- Basic conditionals and loops
- Standard API calls and library usage
- Variable assignments and declarations
- Function calls with descriptive names
- Common patterns and boilerplate code

### When Comments ARE Needed

- Workarounds for bugs or third-party library limitations
- Complex algorithms or mathematical formulas
- Non-obvious business logic or domain-specific rules
- Performance optimizations that look unusual
- Temporary solutions or known technical debt
- Regex patterns (unless extremely simple)

## 2. Self-Documenting Code Priority

Write code that explains itself through clear naming and structure.

### Good Practices

- Use descriptive variable and function names
- Break complex logic into well-named functions
- Choose clarity over cleverness
- Use meaningful constants instead of magic numbers
- Structure code to reveal intent

### Examples

```javascript
// Bad: Over-explaining obvious code
// Check if user is admin
if (user.role === 'admin') {
  // Allow access
  return true
}

// Good: Code is self-explanatory
if (user.role === 'admin') {
  return true
}
```

```javascript
// Bad: Comment states the obvious
// Filter active users
const activeUsers = users.filter((user) => user.isActive)

// Good: No comment needed, code is clear
const activeUsers = users.filter((user) => user.isActive)
```

```javascript
// Good: Comment explains WHY, not WHAT
// Using setTimeout instead of setInterval to prevent overlapping executions
// when the API response takes longer than the interval
setTimeout(pollApiStatus, POLL_INTERVAL)
```

## 3. Comment Quality Guidelines

When you do add comments, make them valuable:

- Explain **why**, not **what**
- Focus on business context and reasoning
- Keep comments concise and accurate
- Update comments when code changes
- Remove outdated or redundant comments

## 4. Code Review Test

Before adding any comment, ask:

1. Would this confuse a senior developer?
2. Is there a way to make the code clearer instead?
3. Does this comment explain something not obvious from reading the code?

If the answer to all three is "no," don't add the comment.

## 5. File Naming Conventions

Use consistent naming patterns based on file type and purpose.

### Naming Rules

- **Hooks**: camelCase, same name as the hook they export
- **Utils and lib**: kebab-case
- **Services and React components**: PascalCase

### Examples

```
✅ Good:
hooks/useUserData.js
hooks/useApiClient.js
utils/format-currency.js
utils/validate-email.js
lib/date-helpers.js
services/ApiService.js
services/AuthService.js
components/UserProfile.jsx
components/DataTable.jsx

❌ Bad:
hooks/user-data-hook.js
hooks/UseUserData.js
utils/formatCurrency.js
utils/validate_email.js
services/api-service.js
components/user-profile.jsx
components/dataTable.jsx
```

## 6. Module Export Patterns

Always use named exports and colocate export declarations with definitions.

### Export Rules

- Always use named exports (never default exports)
- Export inline with the declaration
- Never collect exports at the bottom of the file
- No barrel index files
- Avoid index files in general

### Examples

```javascript
// ✅ Good: Named export inline
export function useUserData() {
  // hook implementation
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export class ApiService {
  // service implementation
}
```

```javascript
// ❌ Bad: Default exports or bottom exports
function useUserData() {
  // hook implementation
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Don't do this
export default useUserData
export { formatCurrency }
```

```javascript
// ❌ Bad: Barrel index files
// Don't create index.js files like this:
export { useUserData } from './useUserData'
export { useApiClient } from './useApiClient'
```

## 7. Function and Component Definitions

### 7.1 Preference Order

- Prefer function declarations over arrow functions over function expressions
- Use named function declarations wherever possible for top-level and exported APIs

### 7.2 When Arrow Functions Are Acceptable

- Small inline callbacks and higher-order function arguments (e.g., map, filter, event handlers)
- Closures where lexical `this` is required
- Otherwise, default to function declarations

### 7.3 React Components

- Prefer named function components using function declarations
  - Example: `function UserCard(props: UserCardProps) { ... }`
- Avoid component definitions as arrow functions or function expressions for named components

### 7.4 Types/Interfaces Placement (TypeScript)

- Define types/interfaces for component props and for object-typed function parameters above the declaration
- For multiple simple parameters, inline their types in the signature is acceptable
- For complex object parameters, define a named type/interface separately above the function/component

### 7.5 Destructuring Rules

- Never destructure props/arguments in the function signature
- Always destructure at the top of the function body
- When destructuring potentially nullable/undefined inputs, use nullish coalescing (`??`) for safety before destructuring

### 7.6 Examples

```tsx
// ✅ Good: React component with function declaration
type UserCardProps = {
  name: string
  age?: number
}

function UserCard(props: UserCardProps) {
  const safeProps = props ?? {}
  const { name, age = 0 } = safeProps
  return (
    <div>
      {name} – {age}
    </div>
  )
}
```

```tsx
// ❌ Bad: Arrow component and parameter destructuring
type UserCardProps = {
  name: string
  age?: number
}

const UserCard = ({ name, age = 0 }: UserCardProps) => {
  return (
    <div>
      {name} – {age}
    </div>
  )
}
```

```typescript
// ✅ Good: Function with complex object parameter
type BuildOptions = {
  minify?: boolean
  target: 'es2019' | 'es2020'
}

function buildProject(options: BuildOptions) {
  const safeOptions = options ?? {}
  const { minify = false, target } = safeOptions
  // implementation
}
```

```typescript
// ❌ Bad: Function expression and parameter destructuring
type BuildOptions = {
  minify?: boolean
  target: 'es2019' | 'es2020'
}

const buildProject = ({ minify = false, target }: BuildOptions) => {
  // implementation
}
```

```javascript
// ✅ Good: Arrow functions for inline callbacks
const activeUsers = users.filter((user) => user.isActive).map((user) => user.name)

// ✅ Good: Function declaration for named function
function processUserData(userData) {
  const safeData = userData ?? {}
  const { users, metadata } = safeData
  return users.map(transformUser)
}
```

## 8. Codebase Exploration Before Implementation

### **Pre-Implementation Discovery**

- **Scan before building**: Always explore existing components, utils, and patterns before creating new ones
- **Use exploration tools**: Leverage `search_files`, `list_code_definition_names`, and `list_files` to discover existing code
- **Check common directories**: Prioritize `components/`, `ui/`, `shared/`, `lib/`, `utils/`, `hooks/`
- **Pattern recognition**: Look for established patterns in similar features

### **Discovery Workflow**

1. **Search for similar functionality**: Use `search_files` with relevant keywords
2. **List component definitions**: Use `list_code_definition_names` in component directories
3. **Examine naming patterns**: Follow existing component naming conventions
4. **Verify integration**: Ensure chosen components work with current architecture

### **When to Ask for Clarification**

- Multiple similar components exist
- Uncertain about which utility function to use
- Existing patterns conflict with requirements
- Component props or usage unclear

### **Question Examples**

> "Found TextField, Input, and FormField components. Which one for user registration?"

> "Existing validation uses Yup in UserForm but Zod in ProductForm. Which pattern should I follow?"

> "See both useApi and useFetch hooks. Which one handles error states better for this use case?"

### **Learn from Production Examples**

- **Find usage examples**: Search for existing implementations of components/hooks in the codebase
- **Study integration patterns**: Look at how components are actually used, not just their definitions
- **Copy proven patterns**: Mimic working examples rather than interpreting component APIs from scratch
- **Prioritize examples over docs**: Real usage trumps reading component source code

### **Example Discovery Process**

1. **Search for component usage**: Use `search_files` to find where components are imported and used
2. **Examine multiple examples**: Look at 2-3 different usage patterns to understand variations
3. **Copy the pattern**: Use the same props, structure, and integration approach
4. **Verify consistency**: Ensure the chosen pattern aligns with the broader codebase style

### **Search Patterns for Usage Examples**

```
// Find component usage
search_files: "import.*TextField" or "from.*TextField"
search_files: "<TextField" (for JSX usage)
search_files: "useUserData" (for hook usage)
```

### **When to Prioritize Examples Over Source**

- Complex components with many props
- Hooks with unclear usage patterns
- Components with conditional rendering logic
- Form components with validation patterns

### **Tools for Discovery**

- `search_files`: Find existing implementations by searching for keywords
- `list_code_definition_names`: Get overview of available functions/components in directories
- `list_files`: Explore directory structure to understand organization
- `read_file`: Examine specific components to understand their API and usage patterns
