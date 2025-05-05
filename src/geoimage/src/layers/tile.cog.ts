import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';
import { boundsToBbox } from '@geoimage/shared/helpers/gis.bbox';
import { BoundingBox } from '@geoimage/shared/helpers/gis.types';
import { D4, RenderByValueDecider } from '@geoimage/shared/helpers/rendering.types';
import { ReadRasterResult } from 'geotiff';

/**
 * Interface for the properties of the CogLayer.
 */
interface CogLayerProps {
  id: string;
  cogImage: CogDynamicImage;
  renderLogicMap: RenderByValueDecider;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  debugMode?: boolean;
}


/**
 * Default values for the layer configuration.
 * These values are used if the user does not provide specific values.
 */
const LAYER_DEFAULTS = {
  tileSize: 256,
  minZoom: 0,
  maxZoom: 20,
}


/**
 * Creates a Deck.gl TileLayer for rendering Cloud Optimized GeoTIFF (COG) images.
 *
 * This function generates a TileLayer that processes raster data from COG images
 * and converts it into RGBA bitmaps for rendering. It supports custom rendering
 * logic, zoom levels, and debugging options.
 *
 * @param cogImage - An object providing access to the COG image data, including methods
 *                   for fetching raster data by tile coordinates.
 * @param id - A unique identifier for the layer.
 * @param tileSize - The size of each tile in pixels. Defaults to a predefined value if not provided.
 * @param maxZoom - The maximum zoom level for the layer. Defaults to a predefined value if not provided.
 * @param minZoom - The minimum zoom level for the layer. Defaults to a predefined value if not provided.
 * @param renderLogicMap - A mapping of raster values to RGBA color arrays. This map defines how
 *                         raster values are converted into colors for rendering.
 * @param debugMode - A boolean flag to enable debug mode. When enabled, tiles are rendered with
 *                    random colors for easier debugging.
 *
 * @returns A Deck.gl TileLayer configured to render COG image tiles.
 */
export const createCogLayer = ({ cogImage, id, tileSize, maxZoom, minZoom, renderLogicMap, debugMode }: CogLayerProps): TileLayer => {


  /**
   * Generates a random RGBA color with a fixed alpha value of 177.
   * 
   * @returns {D4} An array representing the RGBA color, where:
   * - The first element is the red component (0-255).
   * - The second element is the green component (0-255).
   * - The third element is the blue component (0-255).
   * - The fourth element is the alpha component (fixed at 177).
   */
  const debugRandomTileColor = () => {
    const randomR = Math.floor(Math.random() * 256);
    const randomG = Math.floor(Math.random() * 256);
    const randomB = Math.floor(Math.random() * 256);
    return [randomR, randomG, randomB, 177] as D4;
  }

  /**
   * Converts a raster dataset into an 8-bit RGBA image representation.
   *
   * This function processes a raster dataset, interprets its values using a mapping logic,
   * and generates an RGBA image. The resulting image is returned as a bitmap for further use.
   *
   * @param cogRaster - The raster data to be converted, containing pixel values and dimensions.
   *                    It is expected to have a `width` and `height` property, and the pixel
   *                    values are accessed as an array-like structure.
   *
   * @returns A promise that resolves to an object containing:
   *          - `bitmap`: An `ImageBitmap` representation of the processed RGBA image.
   * @throws Will throw an error if the `createImageBitmap` function fails.
   */
  const rasterToRGBA = async (cogRaster: ReadRasterResult, colorForUnknown?: D4) => {

    // prepare clamped array for 8-bit RGBA
    const output = new Uint8ClampedArray(cogRaster.width * cogRaster.height * 4); // 4 channels per value (RGBA)

    // retype the raster data to a number array
    const rasterData = cogRaster as ArrayLike<number>;

    // now we need to read each pixel and convert it to RGBA
    let rasterDataIdx = 0;
    for (let i = 0; i < output.length; i += 4) {

      // this can be anything as COG in not always about RGBA, but also about other values
      // it can be measurement, classification, etc.
      const rasterValueFromImage = rasterData[rasterDataIdx];

      // ...but we have a map to convert it to RGBA
      // the maps tells us how to convert the value to RGBA
      const [r, g, b, a] = renderLogicMap.get(rasterValueFromImage) ??
        colorForUnknown ??
        renderLogicMap.get("unknown") ??
        [0, 0, 0, 0]; // Default transparent black

      // and for each pixel we need to set RGBA
      output[i] = r; // Red
      output[i + 1] = g; // Green
      output[i + 2] = b; // Blue
      output[i + 3] = a; // Alpha

      rasterDataIdx += 1;
    }

    const imageData = new ImageData(output, tileSize, tileSize);
    const bitmap = await createImageBitmap(imageData); // optional: wrap in async

    return bitmap
  }

  // the output is special kind of DeckGL TileLayer as it's mapped to XYZ tile coordinates
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

        // Fetch raster data for the given tile coordinates
        const rasterResults = await cogImage.imageByBoundsForXYZ(
          z,
          webProjectionBounds as BoundingBox,
        )

        if (!rasterResults) {
          // console.info('No raster data available for tile:', tile);
          return null;
        }

        if (rasterResults.width !== tileSize || rasterResults.height !== tileSize) {
          console.error('Raster data dimensions do not match tile size:', rasterResults.width, rasterResults.height);
          return null;
        }

        const bitmap = await rasterToRGBA(rasterResults, debugMode ? debugRandomTileColor() : undefined);

        return {
          bitmap
        };
      } catch (error) {
        console.error('Error fetching tile data:', error);
        return null;
      }
    },

    // This function is called for each tile to render the data into map
    // Each tile data from the COG is a bitmap
    // and we need to render it as a bitmap layer
    renderSubLayers: (props) => {

      const { data, tile: { boundingBox } } = props;

      const randomNumber = Math.floor(Math.random() * 1000) + "_._" + Math.floor(Math.random() * 1000);
      const bitmap = data?.bitmap;

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


