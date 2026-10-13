# JSX truthiness

Review each JSX condition that decides whether content renders.

1. Replace a verbose check such as `value !== undefined && value !== null && value !== false` with `!!value`.
2. Use a logical expression instead of a ternary when the false branch renders nothing:

   ```tsx
   {
     !!startContent && <Content>{startContent}</Content>
   }
   ```

   Instead of:

   ```tsx
   {
     startContent ? <Content>{startContent}</Content> : null
   }
   ```

3. Decide from the contract of the component and its actual use. Do not decide from every value that a broad type such as `ReactNode` permits.
4. Do not keep a verbose check only because a value such as `0` is possible, when that value is not a meaningful input.
5. Keep an explicit comparison when a falsy value has a different meaning from absence.
6. Keep a ternary when both branches produce meaningful output.
