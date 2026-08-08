export type PlaceholderImageFormat = 'jpeg' | 'png' | 'webp'

export type GeneratePlaceholderImageUrlOptions = Readonly<{
  width?: number
  height?: number
  backgroundColor?: string
  textColor?: string
  format?: PlaceholderImageFormat
  text?: string
}>

/**
 * Builds a customizable image URL through placehold.co.
 * Colors may include a leading hash, and text is safely encoded for use as a query parameter.
 *
 * @param options - Placeholder dimensions, colors, output format, and optional label
 * @returns A complete placehold.co image URL
 *
 * @example
 * ```typescript
 * generatePlaceholderImageUrl()
 * // 'https://placehold.co/600x400/CCCCCC/333333.png?text=Placeholder%20Image'
 *
 * generatePlaceholderImageUrl({ width: 1200, height: 630, backgroundColor: '#111827', text: '' })
 * // 'https://placehold.co/1200x630/111827/333333.png'
 * ```
 */
export function generatePlaceholderImageUrl(options: GeneratePlaceholderImageUrlOptions = {}): string {
  const {
    width = 600,
    height = 400,
    backgroundColor = 'CCCCCC',
    textColor = '333333',
    format = 'png',
    text = 'Placeholder Image',
  } = options
  const safeBackgroundColor = backgroundColor.replaceAll('#', '')
  const safeTextColor = textColor.replaceAll('#', '')
  const baseUrl = `https://placehold.co/${width}x${height}/${safeBackgroundColor}/${safeTextColor}.${format}`

  return text ? `${baseUrl}?text=${encodeURIComponent(text)}` : baseUrl
}
