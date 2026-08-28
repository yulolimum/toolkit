# Component style slots

Use a slot map when a reusable component exposes two or more styling targets.

For web components, name the prop `classNames`. Each optional property contains the class name for one slot.

For React Native components, name the prop `styles`. Each optional property contains the `StyleProp` for one slot.

Always name the outermost slot `root`. Name other slots by their rendered role, such as `input`, `label`, or `description`.

Default the slot map to an empty object during prop destructuring.

```tsx
type FieldProps = {
  classNames?: {
    root?: string
    input?: string
  }
}

function Field({ classNames = {} }: FieldProps) {
  return (
    <label className={cn('field', classNames.root)}>
      <input className={cn('input', classNames.input)} />
    </label>
  )
}
```

For React Native, use the style type that matches each slot.

```tsx
type FieldProps = {
  styles?: {
    root?: StyleProp<ViewStyle>
    input?: StyleProp<TextStyle>
  }
}

function Field({ styles = {} }: FieldProps) {
  return (
    <View style={[baseStyles.root, styles.root]}>
      <TextInput style={[baseStyles.input, styles.input]} />
    </View>
  )
}
```

Do not also expose `className`, `style`, or separate props such as `inputClassName`. The root override belongs in `classNames.root` or `styles.root`.

Keep `className` or `style` when the component exposes only one styling target.
