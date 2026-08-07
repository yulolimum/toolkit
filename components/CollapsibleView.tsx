import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'

import { useEffect, useRef, useState } from 'react'
import { Animated, View } from 'react-native'

type CollapsibleViewProps = Omit<ViewProps, 'children' | 'style'> & {
  children?: ReactNode
  collapsed?: boolean
  duration?: number
  style?: StyleProp<Omit<ViewStyle, 'height'>>
  contentStyle?: StyleProp<ViewStyle>
}

/**
 * Animates its content between its measured height and zero.
 *
 * @example
 * ```tsx
 * <CollapsibleView collapsed={!isExpanded} duration={200}>
 *   <Text>Details that can be shown or hidden</Text>
 * </CollapsibleView>
 * ```
 */
export function CollapsibleView(props: CollapsibleViewProps) {
  const { children, collapsed = false, contentStyle, duration = 300, style, ...restProps } = props
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)
  const height = useRef(new Animated.Value(0)).current
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (contentHeight === undefined) return

    const toValue = collapsed ? 0 : contentHeight

    if (!hasInitialized.current) {
      hasInitialized.current = true
      height.setValue(toValue)
      return
    }

    const animation = Animated.timing(height, {
      toValue,
      duration,
      useNativeDriver: false,
    })

    animation.start()

    return animation.stop
  }, [collapsed, contentHeight, duration, height])

  const isMeasuring = contentHeight === undefined

  return (
    <Animated.View {...restProps} style={[$container, (collapsed || !isMeasuring) && { height }, style]}>
      <View
        onLayout={(event) => {
          const nextHeight = Math.round(event.nativeEvent.layout.height)
          if (!hasInitialized.current && !collapsed) height.setValue(nextHeight)
          setContentHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight))
        }}
        style={[$content, contentStyle, (collapsed || !isMeasuring) && $absoluteContent]}
      >
        {children}
      </View>
    </Animated.View>
  )
}

const $container: ViewStyle = {
  overflow: 'hidden',
}

const $content: ViewStyle = {
  width: '100%',
}

const $absoluteContent: ViewStyle = {
  position: 'absolute',
}
