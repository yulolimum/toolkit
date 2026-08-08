import type { LatLng, Region } from 'react-native-maps'

export type GetRegionForCoordinatesOptions = Readonly<{
  padding?: number
}>

const DEFAULT_PADDING = 0.01

/**
 * Calculates a React Native Maps region that contains every supplied coordinate.
 * The region uses simple latitude and longitude bounds, so coordinate sets that
 * cross the antimeridian may produce a wider-than-necessary region.
 *
 * @param coordinates - Coordinates to include in the region
 * @param options - Optional padding applied to the latitude and longitude spans
 * @returns A map region, or undefined when no coordinates are supplied
 *
 * @example
 * ```typescript
 * getRegionForCoordinates([
 *   { latitude: 47.6062, longitude: -122.3321 },
 *   { latitude: 47.6205, longitude: -122.3493 },
 * ])
 * // {
 * //   latitude: 47.61335,
 * //   longitude: -122.3407,
 * //   latitudeDelta: 0.014443,
 * //   longitudeDelta: 0.017372,
 * // }
 * ```
 *
 * @example
 * ```typescript
 * getRegionForCoordinates([{ latitude: 47.6062, longitude: -122.3321 }])
 * // {
 * //   latitude: 47.6062,
 * //   longitude: -122.3321,
 * //   latitudeDelta: 0.01,
 * //   longitudeDelta: 0.01,
 * // }
 * ```
 */
export function getRegionForCoordinates(
  coordinates: ReadonlyArray<LatLng>,
  options?: GetRegionForCoordinatesOptions,
): Region | undefined {
  if (coordinates.length === 0) return undefined

  const padding = options?.padding ?? DEFAULT_PADDING
  const [firstCoordinate] = coordinates
  if (!firstCoordinate) return undefined

  let minimumLatitude = firstCoordinate.latitude
  let maximumLatitude = firstCoordinate.latitude
  let minimumLongitude = firstCoordinate.longitude
  let maximumLongitude = firstCoordinate.longitude

  for (const { latitude, longitude } of coordinates.slice(1)) {
    minimumLatitude = Math.min(minimumLatitude, latitude)
    maximumLatitude = Math.max(maximumLatitude, latitude)
    minimumLongitude = Math.min(minimumLongitude, longitude)
    maximumLongitude = Math.max(maximumLongitude, longitude)
  }

  const latitudeDelta = (maximumLatitude - minimumLatitude) * (1 + padding) || padding
  const longitudeDelta = (maximumLongitude - minimumLongitude) * (1 + padding) || padding

  return {
    latitude: (minimumLatitude + maximumLatitude) / 2,
    longitude: (minimumLongitude + maximumLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  }
}
