import { MapView } from "@deck.gl/core"

/**
 * Default state of the map view
 * @returns 
 */
export const defaultMapView = () => {
  const defaultView = new MapView({ controller: true, repeat: true })
  return defaultView
}