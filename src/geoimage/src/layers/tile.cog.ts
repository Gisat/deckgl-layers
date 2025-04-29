import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';
import { convertBoundsToMercator } from '@geoimage/shared/helpers/gis.mercator';
import { bboxToBounds, boundsToBbox } from '@geoimage/shared/helpers/gis.transform';
import { BoundingBox } from '@geoimage/shared/helpers/gis.types';

interface CogLayerProps {
  id: string;
  cogImage: CogDynamicImage;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
}

const LAYER_DEFAULTS = {
  tileSize: 256,
  minZoom: 0,
  maxZoom: 20,
}


/**
 * Asynchronously creates a COG (Cloud Optimized GeoTIFF) tile layer for use with Deck.gl.
 *
 * This function loads a COG image from the provided URL and defines a `TileLayer` 
 * that fetches raster data for individual tiles and renders them using a `BitmapLayer`.
 *
 * @param props - The properties required to configure the COG layer.
 * @param props.url - The URL of the COG image to load.
 * @param props.id - A unique identifier for the layer.
 * @param props.tileSize - The size of each tile in pixels. Defaults to `LAYER_DEFAULTS.tileSize`.
 * @param props.minZoom - The minimum zoom level for the layer. Defaults to `LAYER_DEFAULTS.minZoom`.
 * @param props.maxZoom - The maximum zoom level for the layer. Defaults to `LAYER_DEFAULTS.maxZoom`.
 *
 * @returns A promise that resolves to a configured `TileLayer` instance.
 *
 * @remarks
 * - The `getTileData` function fetches raster data for each tile based on its coordinates.
 * - The `renderSubLayers` function converts raster data into an `ImageBitmap` or `ImageData` 
 *   and renders it using a `BitmapLayer`.
 * - If raster data or zoom information is unavailable for a tile, it returns `null`.
 *
 * @example
 * ```typescript
 * const layer = await createCogLayer({
 *   url: 'https://example.com/cog.tif',
 *   id: 'my-cog-layer',
 *   tileSize: 256,
 *   minZoom: 0,
 *   maxZoom: 20
 * });
 * ```
 */
export const createCogLayer = ({ cogImage, id, tileSize, maxZoom, minZoom }: CogLayerProps): TileLayer => {

  return new TileLayer({

    // name of the layer
    id: id,

    // // source of the tile data
    // data: url,

    //size of the tile
    tileSize: tileSize ?? LAYER_DEFAULTS.tileSize,

    // Viewport/zoom range
    minZoom: minZoom ?? LAYER_DEFAULTS.minZoom,
    maxZoom: maxZoom ?? LAYER_DEFAULTS.maxZoom,

    // How to get the data for each tile
    getTileData: async (tile) => {

      try {

        const { index: { x, y, z }, bbox: webProjectionBounds } = tile;

        const bbox = boundsToBbox(webProjectionBounds as BoundingBox);

        // Fetch raster data for the given tile coordinates
        const rasterResults = await cogImage.imageByBoundsForXYZ(z, bbox);

        if (!rasterResults) {
          console.info('No raster data available for tile:', tile);
          return null;
        }


        if (rasterResults.width !== tileSize || rasterResults.height !== tileSize) {
          console.error('Raster data dimensions do not match tile size:', rasterResults.width, rasterResults.height);
          return null;
        }

        const output = new Uint8ClampedArray(rasterResults.width * rasterResults.height * 4); // 4 channels per value (RGBA)
        const rasterData = rasterResults as ArrayLike<number>;

        const valueMap: Map<number, [number, number, number, number]> = new Map();

        valueMap.set(0, [0, 0, 0, 255]); // Black
        valueMap.set(255, [0, 0, 0, 255]); // Black

        valueMap.set(11, [255, 0, 0, 255]); // Red for 11
        valueMap.set(12, [0, 255, 0, 255]); // Green for 12
        valueMap.set(13, [0, 0, 255, 255]); // Blue for 13

        for (let i = 0; i < rasterData.length; i += 4) {

          const rasterValue = rasterData[i]; // 0–255 assumed
          const [r, g, b, a] = valueMap.get(rasterValue) || [0, 0, 0, 255]; // Default to black if not found

          output[i] = r; // Red
          output[i + 1] = g; // Green
          output[i + 2] = b; // Blue
          output[i + 3] = a; // Alpha
        }

        const imageData = new ImageData(output, tileSize, tileSize);
        const bitmap = await createImageBitmap(imageData); // optional: wrap in async

        return {
          bitmap
        };
      } catch (error) {
        console.error('Error fetching tile data:', error);
        return null;
      }
    },

    renderSubLayers: (props) => {

      console.log("2, Props", props);
      const { data, tile } = props;

      const { boundingBox } = tile;

      const randomNumber = Math.floor(Math.random() * 1000);
      const bitmap = data?.bitmap;

      // if (!bitmap)
      //   console.warn('No bitmap available for rendering:', data);

      if (bitmap) {
        return new BitmapLayer({
          id: `tile-bitmap-${randomNumber}`,
          image: bitmap,
          bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]],
          pickable: false,

        });
      }

      return null;
    }
  });
}


