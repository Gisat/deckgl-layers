import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { CogImage } from '@geoimage/cogs/models.cog';
import { Nullable } from '@geoimage/shared/helpers/code.types';
import { ReadRasterResult } from 'geotiff';

interface CogLayerProps {
  id: string;
  url: string;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
}

const LAYER_DEFAULTS = {
  tileSize: 256,
  minZoom: 0,
  maxZoom: 20,
}


export const createCogLayer = async (props: CogLayerProps): Promise<any> => {

  // Load the COG image from the URL destination
  const cog = await CogImage.fromUrl(props.url);

  // Define the tile layer
  const layer = new TileLayer({

    // name of the layer
    id: props.id,

    // source of the tile data
    data: props.url,

    //size of the tile
    tileSize: props.tileSize ?? LAYER_DEFAULTS.tileSize,

    // Viewport/zoom range
    minZoom: props.minZoom ?? LAYER_DEFAULTS.minZoom,
    maxZoom: props.maxZoom ?? LAYER_DEFAULTS.maxZoom,

    // How to get the data for each tile
    getTileData: async (tile) => {

      const { index: { x, y, z } } = tile;

      // Fetch raster data for the given tile coordinates
      const rasterResults: Nullable<ReadRasterResult> = await cog.imageForXYZ([x, y, z]);
      const cogZoomInfo = cog.zoomMap.get(z);

      if (!cogZoomInfo) {
        return null;
      }

      const [width, height] = cogZoomInfo.pixelSize

      if (!rasterResults) {
        return null;
      }

      return {
        data: rasterResults[0],
        width,
        height

      };
    },

    renderSubLayers: (props) => {
      const {
        id,
        tile: { bbox },
        data: { data, width, height },

      } = props;

      if (!data) return null;


      // Convert raw raster data into an ImageBitmap or ImageData
      const imageData = new ImageData(new Uint8ClampedArray(data), width, height);

      const bitmap = createImageBitmap(imageData); // optional: wrap in async

      return new BitmapLayer({
        id: `tile-bitmap-${id}`,
        image: bitmap
      });
    }
  });

  return layer;
}


