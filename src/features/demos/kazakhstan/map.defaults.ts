import { MapViewState } from "@deck.gl/core"

/**
 * Default state of the map
 * @returns 
 */
export const kazakhstanDefaultMapState = () => {
  const initMapState: MapViewState = {
    latitude: 48.0196,
    longitude: 66.9237,
    zoom: 4,
    maxZoom: 20,
    maxPitch: 89,
    bearing: 0,
  }

  return initMapState
}