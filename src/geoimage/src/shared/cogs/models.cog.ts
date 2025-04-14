import GeoTIFF, { fromFile, fromUrl } from "geotiff";

interface CogZoom {
    zoom: number;
    pixelSize: [number, number];
    tileSize: [number, number];
    numberOfTiles: [number, number];
    origin: [number, number, number];
    bbox: [number, number, number, number];
    resolution: [number, number, number];
    // tileZoomLevel: number;
}

export class CogImage {

    // source of the COG analyse data
    tiff: GeoTIFF;

    /* 
    * COG is a TIFF composed of multiple images, each representing a zoom level
    * the number of zooms in the COG
    * zoom 0 is the full resolution image (max zoom)
    * zoom 1 is the first zoom level (half resolution)
    * zoom 2 is the second zoom level (quarter resolution)
    * and so on... 
    * */
    numberOfZoomsInCog: number = 0;

    zoomMap: Map<number, CogZoom>;

    private constructor(tiff: GeoTIFF) {
        this.tiff = tiff;
        this.zoomMap = new Map();
        this.initialize();
    }

    private async initialize() {
        this.numberOfZoomsInCog = await this.tiff.getImageCount();

        for (let cogZoomIndex = 0; cogZoomIndex < this.numberOfZoomsInCog; cogZoomIndex++) {
            const cogLevelImage = await this.tiff.getImage(cogZoomIndex);

            const [tileWidth, tileHeight] = [cogLevelImage.getTileWidth(), cogLevelImage.getTileHeight()];

            const [pixelWidth, pixelHeight] = [cogLevelImage.getWidth(), cogLevelImage.getHeight()];

            const [originX, originY, originZ] = cogLevelImage.getOrigin()

            const [resX, resY, resZ] = cogLevelImage.getResolution();

            const [bboxWest, bboxSouth, bboxEast, bboxNorth] = cogLevelImage.getBoundingBox();

            const numberOfTilesX = Math.round(pixelWidth / tileWidth);

            const numberOfTilesY = Math.round(pixelHeight / tileHeight);

            this.zoomMap.set(cogZoomIndex, {
                zoom: cogZoomIndex,
                pixelSize: [resX, resY],
                tileSize: [tileWidth, tileHeight],
                origin: [originX, originY, originZ],
                bbox: [bboxWest, bboxSouth, bboxEast, bboxNorth],
                numberOfTiles: [numberOfTilesX, numberOfTilesY],
                resolution: [resX, resY, resZ]
            });

        }
    }

    *describeAllImages({ logToConsole = false }: { logToConsole: boolean }): Generator<CogZoom> {
        for (const imageInCog of this.zoomMap.values()) {
            
            if (logToConsole)
                console.log(`Cog Image at Zoom: ${imageInCog.zoom} - ${imageInCog.pixelSize} - ${imageInCog.tileSize} - ${imageInCog.numberOfTiles} - ${imageInCog.origin} - ${imageInCog.bbox} - ${imageInCog.resolution}`);

            yield {
                zoom: imageInCog.zoom,
                pixelSize: imageInCog.pixelSize,
                tileSize: imageInCog.tileSize,
                numberOfTiles: imageInCog.numberOfTiles,
                origin: imageInCog.origin,
                bbox: imageInCog.bbox,
                resolution: imageInCog.resolution
            };
        }
    }

    // /**
    //  * Get the tile size in pixels for a given tile zoom level.
    //  * @param tileZoomLevel The zoom level of the XYZ indexing tile.
    //  * @returns The tile size in pixels.
    //  */
    // imageForTileZoomLevel = (tileZoomLevel: number) => {

    // }

    static async fromUrl(url: string | URL) {
        const tiff = await fromUrl(url instanceof URL ? url.toString() : url);
        return new CogImage(tiff);
    }
    static async fromFile(path: string) {
        const tiff = await fromFile(path);
        return new CogImage(tiff);
    }

}