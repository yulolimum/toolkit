/**
 * Returns black or white depending on which contrasts better with the given color.
 * Uses the YIQ color space formula for perceived brightness.
 *
 * @param color - Hex color (#RGB, #RRGGBB) or RGB string (rgb(r,g,b), rgba(r,g,b,a))
 * @param fallback - Color to return if input can't be parsed (default: "#ffffff")
 * @returns "#000000" for light colors, "#ffffff" for dark colors
 *
 * @example
 * Basic usage with hex colors:
 * ```typescript
 * getContrastingColor('#ffffff') // '#000000' (black text on white)
 * getContrastingColor('#000000') // '#ffffff' (white text on black)
 * getContrastingColor('#3498db') // '#ffffff' (white text on blue)
 * getContrastingColor('#f1c40f') // '#000000' (black text on yellow)
 * ```
 *
 * @example
 * Short hex notation:
 * ```typescript
 * getContrastingColor('#fff') // '#000000'
 * getContrastingColor('#000') // '#ffffff'
 * ```
 *
 * @example
 * RGB/RGBA strings:
 * ```typescript
 * getContrastingColor('rgb(255, 255, 255)') // '#000000'
 * getContrastingColor('rgba(0, 0, 0, 0.5)') // '#ffffff'
 * ```
 *
 * @example
 * With fallback for invalid input:
 * ```typescript
 * getContrastingColor('invalid', '#000000') // '#000000'
 * getContrastingColor('notacolor') // '#ffffff' (default fallback)
 * ```
 *
 * @example
 * Dynamic text color on colored backgrounds:
 * ```typescript
 * function ColoredBadge({ color, label }: { color: string; label: string }) {
 *   return (
 *     <View style={{ backgroundColor: color }}>
 *       <Text style={{ color: getContrastingColor(color) }}>{label}</Text>
 *     </View>
 *   )
 * }
 * ```
 */
export function getContrastingColor(color: string, fallback: string = '#ffffff'): string {
  let r = 0,
    g = 0,
    b = 0

  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    } else {
      return fallback
    }
  } else if (color.startsWith('rgb')) {
    const parts = color
      .replace(/[^\d,]/g, '')
      .split(',')
      .slice(0, 3)
      .map(Number)
    if (parts.length < 3 || parts.some(isNaN)) return fallback
    ;[r, g, b] = parts
  } else {
    return fallback
  }

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness >= 128 ? '#000000' : '#ffffff'
}
