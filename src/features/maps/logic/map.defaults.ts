import { MapView, MapViewState } from "@deck.gl/core"

/**
 * Default state of the map
 * @returns 
 */
export const defaultMapState = () => {
  const initMapState: MapViewState = {
    latitude: 49.8175,
    longitude: 15.4730,
    zoom: 5,
    maxZoom: 20,
    maxPitch: 89,
    bearing: 0,
  }

  return initMapState
}

/**
 * Default state of the map view
 * @returns 
 */
export const defaultMapView = () => {
  const defaultView = new MapView({ controller: true, repeat: true })
  return defaultView
}