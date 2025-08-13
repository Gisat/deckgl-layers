import { MapViewState } from "@deck.gl/core"

/**
 * Default state of the map
 * @returns 
 */
export const useAfricaMapDefaults = () => {
  const initMapState: MapViewState = {
    latitude: 1.3733,
    longitude: 32.5822,
    zoom: 3,
    maxZoom: 20,
    maxPitch: 89,
    bearing: 0,
  }

  return initMapState
}