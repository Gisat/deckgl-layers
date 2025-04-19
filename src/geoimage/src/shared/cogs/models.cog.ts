import GeoTIFF, { fromFile, fromUrl } from "geotiff";
import { TileMagicXYZ } from "../tiles/models.tileMagic";

interface CogZoom {
    zoom: number;
    pixelSize: [number, number];
    tileSize: [number, number];
    numberOfTiles: [number, number];
    origin: [number, number, number];
    bbox: [number, number, number, number];
    resolution: [number, number, number];
    zoomResolutionMetersPerPixel: number;
    tileZoomLevel: number;
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
    numberOfZoomsInCog: number = undefined;

    zoomMap: Map<number, Partial<CogZoom>>;

    private constructor(tiff: GeoTIFF) {
        this.tiff = tiff;
        this.zoomMap = new Map();
    }

    async initialize() {
        const zooms = await this.tiff.getImageCount();
        let tileMagicXYZ: TileMagicXYZ

        let mainResolutions: [number, number, number] = [0, 0, 0];
        let mainOrigins: [number, number, number] = [0, 0, 0];
        let mainBoundingBox: [number, number, number, number] = [0, 0, 0, 0];
        let mainWidth: number = 0;

        let resolutionPyramid: Map<number, number> = new Map();

        for (let cogZoom = 0; cogZoom < zooms; cogZoom++) {

            // read the COG image at the current zoom level
            const cogLevelImage = await this.tiff.getImage(cogZoom);

            // setup main image level properties
            // at lower image levels the COG hasn't those values
            const isMainImage = cogZoom === 0;

            if (isMainImage) {
                mainOrigins = cogLevelImage.getOrigin() as [number, number, number];
                mainResolutions = cogLevelImage.getResolution() as [number, number, number];
                mainBoundingBox = cogLevelImage.getBoundingBox() as [number, number, number, number];
                mainWidth = cogLevelImage.getWidth();

                resolutionPyramid = this.buildCogResolutionPyramid(mainResolutions[0], zooms);
                tileMagicXYZ = new TileMagicXYZ(cogLevelImage.getTileWidth());
            }

            // get the tile width and height in pixels
            const [tileWidth, tileHeight] = [cogLevelImage.getTileWidth(), cogLevelImage.getTileHeight()];

            // get the pixel width and height in pixels
            const [pixelWidth, pixelHeight] = [cogLevelImage.getWidth(), cogLevelImage.getHeight()];

            // get the number of tiles in the image
            const numberOfTilesX = Math.round(pixelWidth / tileWidth);

            // get the number of tiles in the image
            const numberOfTilesY = Math.round(pixelHeight / tileHeight);

            // get resolution for this image level


            // Similarly, we can calculate the origin and bounding box for this level if needed
            // This is optional as we're using mainOrigins and mainBoundingBox currently

            this.zoomMap.set(cogZoom, {
                zoom: cogZoom,
                pixelSize: [pixelWidth, pixelHeight],
                tileSize: [tileWidth, tileHeight],
                numberOfTiles: [numberOfTilesX, numberOfTilesY],

                // TODO: change
                origin: mainOrigins,
                resolution: mainResolutions,
                bbox: mainBoundingBox,
                zoomResolutionMetersPerPixel: resolutionPyramid.get(cogZoom),
                tileZoomLevel: tileMagicXYZ.bestZoomLevelForResolution(resolutionPyramid.get(cogZoom)),
            });

        }
    }

    buildCogResolutionPyramid = (
        levelZeroXResolution: number,
        levels: number // total number of COG levels including level 0
    ): Map<number, number> => {
        const resolutionMap = new Map<number, number>();

        for (let level = 0; level < levels; level++) {
            const resolutionMetersPerPixel = +(levelZeroXResolution * Math.pow(2, level)).toFixed(5);
            resolutionMap.set(level, resolutionMetersPerPixel);
        }

        return resolutionMap;
    };


    bestCogLevelForResolution = (resolutionMetersPerPixels: number): number => {
        const cogLevels = Array.from(this.zoomMap.keys());
        const cogResolutions = Array.from(this.zoomMap.values()).map((cogLevel) => cogLevel.zoomResolutionMetersPerPixel);

        // find the closest resolution to the requested resolution
        const closestResolutionIndex = cogResolutions.reduce((previousResolution, currentResolution, index) => {
            const hasThisCogLevelCloserResolution = Math.abs(currentResolution - resolutionMetersPerPixels) < Math.abs(cogResolutions[previousResolution] - resolutionMetersPerPixels)
            return hasThisCogLevelCloserResolution ? index : previousResolution;
        }, 0);

        return cogLevels[closestResolutionIndex];
    }

    static async fromUrl(url: string | URL) {
        const tiff = await fromUrl(url instanceof URL ? url.toString() : url);
        const cogInstance = new CogImage(tiff);
        await cogInstance.initialize();
        return cogInstance;
    }

    static async fromFile(path: string) {
        const tiff = await fromFile(path);
        const cogInstance = new CogImage(tiff);
        await cogInstance.initialize();
        return cogInstance;
    }

}