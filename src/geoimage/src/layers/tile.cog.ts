import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { CogImage } from '@geoimage/cogs/models.cog';
import { convertBoundsToMercator } from '@geoimage/shared/helpers/gis.mercator';
import { BoundingBox } from '@geoimage/shared/helpers/gis.types';

interface CogLayerProps {
  id: string;
  cogImage: CogImage;
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

        console.log("BBOX", webProjectionBounds);

        const { bbox: bboxMercator } = convertBoundsToMercator(webProjectionBounds as BoundingBox)


        console.log("BBOX MERCATOR", bboxMercator);

        // Fetch raster data for the given tile coordinates
        const rasterResults = await cogImage.imageByBoundsForXYZ(z, bboxMercator);
        if (!rasterResults) {
          console.error('No raster data available for tile:', tile);
          return null;
        }

        const cogZoomInfo = cogImage.mapCogImageByTileZoom.get(z);

        if (!cogZoomInfo) {
          console.error('No zoom information available for tile:', tile);
          return null;
        }

        const [width, height] = cogZoomInfo.pixelSize

        // Convert raw raster data into an ImageBitmap or ImageData
        console.log('Raster results:', rasterResults);
        const pixelArray = new Uint8ClampedArray(rasterResults[1] as ArrayLike<number>);
        const expectedLength = width * height * 4;

        if (pixelArray.length !== expectedLength) {
          console.warn(`Raster data length (${pixelArray.length}) does not match expected length (${expectedLength}). Padding with zeros.`);
          const paddedArray = new Uint8ClampedArray(expectedLength);
          paddedArray.set(pixelArray.subarray(0, Math.min(pixelArray.length, expectedLength)));
          pixelArray.set(paddedArray);
        }

        const imageData = new ImageData(pixelArray, width, height);

        const bitmap = await createImageBitmap(imageData);

        return {
          data: bitmap
        };
      } catch (error) {
        console.error('Error fetching tile data:', error);
        return null;
      }
    },

    renderSubLayers: (props) => {
      const {
        id,
        data,
      } = props;

      console.log('Tile data:', data);

      if (data)
        return new BitmapLayer({
          id: `tile-bitmap-${id}`,
          image: data
        });
    }
  });
}


