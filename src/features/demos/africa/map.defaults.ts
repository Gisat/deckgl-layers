import { MapView, MapViewState } from "@deck.gl/core"

/**
 * Default state of the map
 * @returns 
 */
export const useGeorgiaMapDefaults = () => {
  const initMapState: MapViewState = {
    latitude: 41.6434,
    longitude: 41.6399,
    zoom: 6,
    maxZoom: 20,
    maxPitch: 89,
    bearing: 0,
  }

  return initMapState
}