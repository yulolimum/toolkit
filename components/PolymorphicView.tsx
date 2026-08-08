import type { ComponentProps, ComponentType } from 'react'
import type { ViewProps } from 'react-native'

import { View } from 'react-native'

export type PolymorphicViewProps<C extends ComponentType> = Omit<ComponentProps<C>, 'as'> & {
  as?: C
}

/**
 * Renders a View by default, or an alternate React Native component through `as`.
 *
 * @example
 * ```tsx
 * <PolymorphicView as={Pressable} onPress={handlePress}>
 *   <Text>Open details</Text>
 * </PolymorphicView>
 * ```
 */
export function PolymorphicView<C extends ComponentType = ComponentType<ViewProps>>(props: PolymorphicViewProps<C>) {
  const { as: Component = View, ...restProps } = props

  return <Component {...restProps} />
}
