import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { AnalyseCog } from '@geoimage/shared/cogs/analysis.cog';
import { cogFromUrl } from '@geoimage/shared/integration/sources.read';

interface CogTileLayerProps {
    id: string;
    url: string;
    tileSize?: number;
    minZoom?: number;
    maxZoom?: number;
}

export const CogTileLayer = async (props: CogTileLayerProps) => {
    
    const cog = await cogFromUrl(props.url);
    
    const {} = AnalyseCog(cog, {
        imageLevel: 0
    });

    const layer = new TileLayer({

        // name of the layer
        id: props.id,

        // source of the tile data
        data: props.url,

        //size of the tile
        tileSize: props.tileSize ?? 256,
      
        // Viewport/zoom range
        minZoom: props.minZoom ?? 0,
        maxZoom: props.maxZoom ?? 20,
      
        // How to get the data for each tile
        getTileData: async tile => {

            const {index: {x, y, z}, url } = tile

          const image = await cog.getImage();
      
          // Convert tile XYZ to pixel window
          const tileSize = 256;
          const tileWidth = image.getTileWidth?.() || tileSize;
          const tileHeight = image.getTileHeight?.() || tileSize;
      
        //   const window = [
        //     x * tileWidth,
        //     y * tileHeight,
        //     (x + 1) * tileWidth,
        //     (y + 1) * tileHeight
        //   ];
      
          const rasterData = await image.readRasters({ bbox: [x, y, x + 1, y + 1] });
      
          return {
            data: rasterData[0],
            width: tileWidth,
            height: tileHeight
          };
        },
      
        renderSubLayers: (props) => {
          const {
            tile: { bbox },
            data
          } = props;
      
          if (!data) return null;
      
          const { west, south, east, north } = bbox;
      
          // Convert raw raster data into an ImageBitmap or ImageData
          const imageData = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
      
          const bitmap = createImageBitmap(imageData); // optional: wrap in async
      
          return new BitmapLayer({
            id: `tile-bitmap-${props.index}`,
            bounds: [west, south, east, north],
            image: bitmap
          });
        }
      });
      
}


