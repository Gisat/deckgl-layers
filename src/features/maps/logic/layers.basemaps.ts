import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers";

/**
 * Creates and returns an OpenStreetMap tile layer using deck.gl TileLayer.
 * 
 * The layer displays OpenStreetMap tiles with specified configurations:
 * - Uses standard OSM tile service at "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
 * - Supports zoom levels from 0 to 19
 * - Uses 256x256 pixel tiles
 * - Limits concurrent requests to 20
 * - Renders tiles as BitmapLayer instances with proper geo-bounds
 * 
 * @returns {TileLayer<ImageBitmap>} Configured OpenStreetMap tile layer
 */
export const createOpenstreetMap = () => {
    const layer = new TileLayer<ImageBitmap>({
        id: "openstreetmap",
        data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        maxRequests: 20,
        pickable: true,
        renderSubLayers: props => {
            const [[west, south], [east, north]] = props.tile.boundingBox;
            const { data, ...otherProps } = props;
      
            return [
              new BitmapLayer(otherProps, {
                image: data,
                bounds: [west, south, east, north]
              })
            ];
          }
    })
    return layer
}