import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers";

export const createOpenstreetMap = () => {
    const layer = new TileLayer<ImageBitmap>({
        id: "openstreetmap",
        data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        maxRequests: 20,
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