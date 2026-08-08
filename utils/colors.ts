export type RgbColor = Readonly<{
  red: number
  green: number
  blue: number
}>

export type RgbaColor = RgbColor &
  Readonly<{
    alpha: number
  }>

const BLACK = '#000000' as const
const WHITE = '#ffffff' as const
const RGB_MAX_VALUE = 255 as const
const OPAQUE_ALPHA = 1 as const
const CONTRAST_OFFSET = 0.05 as const
const BLACK_RGB: RgbColor = { red: 0, green: 0, blue: 0 }
const WHITE_RGB: RgbColor = { red: RGB_MAX_VALUE, green: RGB_MAX_VALUE, blue: RGB_MAX_VALUE }

/**
 * Parses a short or full hexadecimal color string into sRGB channels.
 *
 * @param color - Hex color in #RGB or #RRGGBB format
 * @returns Parsed opaque color, or undefined when the input is invalid
 *
 * @example
 * ```typescript
 * parseHexColor('#3af') // { red: 51, green: 170, blue: 255, alpha: 1 }
 * parseHexColor('#336699') // { red: 51, green: 102, blue: 153, alpha: 1 }
 * parseHexColor('#ggg') // undefined
 * ```
 */
export function parseHexColor(color: string): RgbaColor | undefined {
  const hex = color.slice(1)

  if (/^[\dA-F]{3}$/i.test(hex)) {
    return {
      red: Number.parseInt(hex[0]! + hex[0]!, 16),
      green: Number.parseInt(hex[1]! + hex[1]!, 16),
      blue: Number.parseInt(hex[2]! + hex[2]!, 16),
      alpha: OPAQUE_ALPHA,
    }
  }

  if (!/^[\dA-F]{6}$/i.test(hex)) return undefined

  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
    alpha: OPAQUE_ALPHA,
  }
}

/**
 * Parses a comma-separated RGB or RGBA CSS color string into sRGB channels.
 *
 * @param color - CSS color in rgb(r, g, b) or rgba(r, g, b, a) format
 * @returns Parsed color, or undefined when the input is invalid
 *
 * @example
 * ```typescript
 * parseRgbColor('rgb(51, 102, 153)') // { red: 51, green: 102, blue: 153, alpha: 1 }
 * parseRgbColor('rgba(51, 102, 153, 0.5)') // { red: 51, green: 102, blue: 153, alpha: 0.5 }
 * parseRgbColor('rgb(300, 0, 0)') // undefined
 * ```
 */
export function parseRgbColor(color: string): RgbaColor | undefined {
  const match = color.match(
    /^(rgb|rgba)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d+(?:\.\d+)?|\.\d+))?\s*\)$/i,
  )
  if (!match) return undefined

  const [, functionName, redValue, greenValue, blueValue, alphaValue] = match
  const red = Number(redValue)
  const green = Number(greenValue)
  const blue = Number(blueValue)
  const alpha = alphaValue === undefined ? OPAQUE_ALPHA : Number(alphaValue)
  const usesAlphaFunction = functionName!.toLowerCase() === 'rgba'
  const hasAlphaValue = alphaValue !== undefined

  if (usesAlphaFunction !== hasAlphaValue) return undefined
  if ([red, green, blue].some((channel) => channel < 0 || channel > RGB_MAX_VALUE)) return undefined
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > OPAQUE_ALPHA) return undefined

  return { red, green, blue, alpha }
}

/**
 * Parses a supported hex, RGB, or RGBA color string into sRGB channels.
 * Leading and trailing whitespace is ignored.
 *
 * @param color - #RGB, #RRGGBB, rgb(r, g, b), or rgba(r, g, b, a)
 * @returns Parsed color, or undefined when the input is invalid or unsupported
 *
 * @example
 * ```typescript
 * parseColor(' #3498db ') // { red: 52, green: 152, blue: 219, alpha: 1 }
 * parseColor('rgba(0, 0, 0, 0.5)') // { red: 0, green: 0, blue: 0, alpha: 0.5 }
 * ```
 */
export function parseColor(color: string): RgbaColor | undefined {
  const normalizedColor = color.trim()

  if (normalizedColor.startsWith('#')) return parseHexColor(normalizedColor)
  return parseRgbColor(normalizedColor)
}

/**
 * Converts one 8-bit sRGB channel to its linear-light value.
 *
 * @param channel - An sRGB channel between 0 and 255
 * @returns The channel's linear-light value between 0 and 1
 *
 * @example
 * ```typescript
 * toLinearSrgb(0) // 0
 * toLinearSrgb(255) // 1
 * ```
 */
export function toLinearSrgb(channel: number): number {
  const normalizedChannel = channel / RGB_MAX_VALUE

  return normalizedChannel <= 0.04045 ? normalizedChannel / 12.92 : ((normalizedChannel + 0.055) / 1.055) ** 2.4
}

/**
 * Calculates the WCAG relative luminance of an opaque sRGB color.
 * The input should be opaque or already composited against its background.
 *
 * @param color - sRGB channels between 0 and 255
 * @returns Relative luminance between 0 for black and 1 for white
 *
 * @example
 * ```typescript
 * getRelativeLuminance({ red: 0, green: 0, blue: 0 }) // 0
 * getRelativeLuminance({ red: 255, green: 255, blue: 255 }) // 1
 * ```
 */
export function getRelativeLuminance({ red, green, blue }: RgbColor): number {
  return 0.2126 * toLinearSrgb(red) + 0.7152 * toLinearSrgb(green) + 0.0722 * toLinearSrgb(blue)
}

/**
 * Calculates the WCAG contrast ratio between two opaque sRGB colors.
 * The input colors should be opaque or already composited against their backgrounds.
 *
 * @param firstColor - First color's sRGB channels
 * @param secondColor - Second color's sRGB channels
 * @returns Contrast ratio from 1 for identical colors through 21 for black and white
 *
 * @example
 * ```typescript
 * getContrastRatio(
 *   { red: 0, green: 0, blue: 0 },
 *   { red: 255, green: 255, blue: 255 },
 * ) // 21
 * ```
 */
export function getContrastRatio(firstColor: RgbColor, secondColor: RgbColor): number {
  const firstLuminance = getRelativeLuminance(firstColor)
  const secondLuminance = getRelativeLuminance(secondColor)
  const lighterLuminance = Math.max(firstLuminance, secondLuminance)
  const darkerLuminance = Math.min(firstLuminance, secondLuminance)

  return (lighterLuminance + CONTRAST_OFFSET) / (darkerLuminance + CONTRAST_OFFSET)
}

/**
 * Returns black or white depending on which has the greater WCAG contrast ratio
 * against an opaque color.
 *
 * @param color - Hex color (#RGB, #RRGGBB), rgb(r, g, b), or opaque rgba(r, g, b, 1)
 * @param fallback - Color to return when the input is invalid or transparent
 * @returns Black or white when the color can be evaluated, otherwise the fallback
 *
 * @example
 * Basic usage with hex colors:
 * ```typescript
 * getContrastingColor('#ffffff') // '#000000' (black text on white)
 * getContrastingColor('#000000') // '#ffffff' (white text on black)
 * getContrastingColor('#3498db') // '#000000' (black has the greater contrast)
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
 * RGB and opaque RGBA strings:
 * ```typescript
 * getContrastingColor('rgb(255, 255, 255)') // '#000000'
 * getContrastingColor('rgba(0, 0, 0, 1)') // '#ffffff'
 * ```
 *
 * @example
 * Invalid and transparent input:
 * ```typescript
 * getContrastingColor('#ggg', '#000000') // '#000000'
 * getContrastingColor('rgb(300, 0, 0)', '#000000') // '#000000'
 * getContrastingColor('rgba(0, 0, 0, 0.5)', '#000000') // '#000000'
 * ```
 *
 * Semi-transparent colors return the fallback because their rendered contrast
 * depends on the background beneath them.
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
export function getContrastingColor(color: string): typeof BLACK | typeof WHITE
export function getContrastingColor<Fallback extends string>(
  color: string,
  fallback: Fallback,
): typeof BLACK | typeof WHITE | Fallback
export function getContrastingColor(color: string, fallback = WHITE): string {
  const rgbaColor = parseColor(color)
  if (!rgbaColor || rgbaColor.alpha !== OPAQUE_ALPHA) return fallback

  const blackContrast = getContrastRatio(rgbaColor, BLACK_RGB)
  const whiteContrast = getContrastRatio(rgbaColor, WHITE_RGB)

  return blackContrast >= whiteContrast ? BLACK : WHITE
}
