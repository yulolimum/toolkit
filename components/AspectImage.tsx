import type { ImageProps, ImageSource } from 'expo-image'
import type { ImageStyle, StyleProp } from 'react-native'

import { Image, useImage } from 'expo-image'

interface BaseProps extends Omit<ImageProps, 'source'> {
  source: ImageSource | string | number
  style?: StyleProp<Omit<ImageStyle, 'width' | 'height'>>
}

type AspectImageProps = BaseProps & {
  width?: number
  height?: number
}

export function AspectImage(props: AspectImageProps) {
  const { source, style, width, height, ...restProps } = props

  const image = useImage(
    source,
    {
      maxWidth: width,
      maxHeight: height,
      onError: () => console.error('Failed to load image:', source),
    },
    [width, height],
  )

  if (!image) return null

  const $style = [{ width: image.width, height: image.height }, style]

  return <Image {...restProps} source={image} style={$style as StyleProp<ImageStyle>} />
}
