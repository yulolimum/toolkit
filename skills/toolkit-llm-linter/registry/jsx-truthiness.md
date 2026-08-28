# JSX truthiness

Review JSX conditions that decide whether content renders.

1. Replace verbose checks such as `value !== undefined && value !== null && value !== false` with `!!value`.
2. Prefer logical expressions over ternaries when the false branch renders nothing:

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

3. Base the decision on the component contract and actual usage, not every theoretical value allowed by a broad type such as `ReactNode`.
4. Do not preserve verbose checks solely because values such as `0` could technically be passed when they are not meaningful inputs.
5. Keep explicit comparisons when a falsy value is intentionally distinct from absence.
6. Keep ternaries when both branches produce meaningful output.
