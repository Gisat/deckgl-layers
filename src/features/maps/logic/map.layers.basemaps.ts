import { TileLayer } from "@deck.gl/geo-layers"

export const createOpenstreetMap = () => {
    const layer = new TileLayer<ImageBitmap>({
        id: "openstreetmap",
        data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
    })
    return layer
}