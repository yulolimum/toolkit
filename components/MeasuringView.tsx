import type { ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { useState } from 'react'
import { View } from 'react-native'

type Size = { width: number | undefined; height: number | undefined }

export function MeasuringView(
  props: Omit<ViewProps, 'children' | 'onLayout'> & { children?: (size: Size) => ReactNode },
) {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  return (
    <View
      {...props}
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {props.children?.(size)}
    </View>
  )
}
