import GeoTIFF, { fromFile, fromUrl, ReadRasterResult } from "geotiff";
import { TileMagicXYZ } from "../tiles/models.tileMagic";
import type { BoundingBox, TupleBBOX } from "@geoimage/shared/helpers/gis.types";
import { boundsOverlapCheck, boundsToBbox } from "@geoimage/shared/helpers/gis.transform";
import { Nullable, NullablePromise } from "@geoimage/shared/helpers/code.types";

/**
 * Information about COG image zoom levels
 * The COG image is composed of multiple images, each representing a zoom level
 * Level 0 is the full resolution image (max zoom)
 * Level 1 is the first zoom level (half resolution)
 * Level 2 is the second zoom level (quarter resolution)
 * and so on...
 */
interface CogZoom {
    zoomLevelImage: number;
    pixelSize: [number, number];
    tileSize: [number, number];
    numberOfTiles: [number, number];
    origin: [number, number, number];
    bbox: TupleBBOX;
    bounds: BoundingBox
    resolution: [number, number, number];
    zoomResolutionMetersPerPixel: number;
    xyzZoomLevel: number;
    xyzResolution: number;
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

    // map of zoom levels with their properties
    zoomMap: Map<number, Partial<CogZoom>>;

    // map of tile zoom levels to COG levels
    // when we need to map XYZ tile to COG level
    // we need to find the best COG level for the given XYZ tile
    tileZoomToCogLevelMap: Map<number, number>;

    private constructor(tiff: GeoTIFF) {
        this.tiff = tiff;
        this.zoomMap = new Map();
        this.tileZoomToCogLevelMap = new Map();
    }

    async initialize() {
        const zooms = await this.tiff.getImageCount();
        let tileMagicXYZ: TileMagicXYZ

        let mainResolutions: [number, number, number] = [0, 0, 0];
        let mainOrigins: [number, number, number] = [0, 0, 0];
        let mainBoundingBox: [number, number, number, number] = [0, 0, 0, 0];

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

                resolutionPyramid = CogImage.buildCogResolutionPyramid(mainResolutions[0], zooms);
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

            // get the closest XYZ tile resolution for the current COG level
            const {
                resolution: xyzResolution, zoomLevel: xyzZoomLevel
            } = tileMagicXYZ.bestZoomLevelForResolution(resolutionPyramid.get(cogZoom))

            // set informations about the COG level
            this.zoomMap.set(cogZoom, {
                zoomLevelImage: cogZoom,
                pixelSize: [pixelWidth, pixelHeight],
                tileSize: [tileWidth, tileHeight],
                numberOfTiles: [numberOfTilesX, numberOfTilesY],
                origin: mainOrigins, // TODO: calculate this for each level
                resolution: mainResolutions, // TODO: calculate this for each level
                bbox: mainBoundingBox, // TODO: calculate this for each level
                zoomResolutionMetersPerPixel: resolutionPyramid.get(cogZoom),
                xyzZoomLevel,
                xyzResolution
            });

            // mape XYZ tile level to COG level
            this.tileZoomToCogLevelMap.set(xyzZoomLevel, cogZoom);
        }
    }

    /**
     * Builds a resolution pyramid for COG (Cloud Optimized GeoTIFF) tiles.
     * 
     * @param levelZeroXResolution - The resolution (in meters per pixel) of the highest resolution level (level 0)
     * @param levels - The total number of resolution levels to generate, including level 0
     * @returns A Map where keys are level numbers (0 to levels-1) and values are the corresponding resolutions in meters per pixel
     * 
     * @example
     * // Create a pyramid with 4 levels starting from 0.5 meters per pixel resolution
     * const pyramid = CogModel.buildCogResolutionPyramid(0.5, 4);
     * // Result: Map { 0 => 0.5, 1 => 1, 2 => 2, 3 => 4 }
     */
    static buildCogResolutionPyramid = (
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

    /**
     * Finds the best COG zoom level based on a given resolution in meters per pixel.
     * 
     * This method compares the input resolution with the available COG resolutions
     * and returns the zoom level that has the closest resolution match.
     * 
     * @param resolutionMetersPerPixels - The target resolution in meters per pixel
     * @returns An object containing the best matching zoom level and its resolution
     * @returns {Object} result
     * @returns {number} result.zoomLevel - The index of the best zoom level
     * @returns {number} result.resolution - The resolution of the best zoom level in meters per pixel
     */
    bestZoomLevelForResolution = (resolutionMetersPerPixels: number) => {

        // list of all COG level resolutions from the zoomMap
        const cogResolutions = Array.from(this.zoomMap.values()).map((cogLevel) => cogLevel.zoomResolutionMetersPerPixel);

        // current best resolution index
        let bestResolutionIndex = 0;

        // find the closest resolution to the requested resolution
        for (let i = 0; i < cogResolutions.length; i++) {

            // first compare the current best resolution with the current resolution
            const closestResolution = cogResolutions[bestResolutionIndex];

            // ..with the current resolution
            const currentResolution = cogResolutions[i];

            // count the difference between the two resolutions
            // ...the actually best
            const bestDifference = Math.abs(closestResolution - resolutionMetersPerPixels);

            // ...and the current one
            const currentDifference = Math.abs(currentResolution - resolutionMetersPerPixels);

            // is the current resolution closer to the requested resolution than the best one?
            const hasThisCogLevelCloserResolution = currentDifference < bestDifference;

            // if so, set the current resolution as the best one
            if (hasThisCogLevelCloserResolution) {
                bestResolutionIndex = i;
            }
        }

        // return the best resolution index and the resolution itself
        const response = {
            zoomLevel: bestResolutionIndex,
            resolution: cogResolutions[bestResolutionIndex],
        }

        return response
    }

    imageForXYZ = async ([x, y, z]: [number, number, number], tileSize = 256, xyzMaxZoom = 26): NullablePromise<ReadRasterResult> => {

        // prepare XYZ tile helper
        const xyzHelper = new TileMagicXYZ(tileSize, xyzMaxZoom);
        const xyzBoundingBox = xyzHelper.tileXYToMercatorBBox([x, y, z]);

        // get the COG level for the given XYZ tile
        const cogImageLevel = this.tileZoomToCogLevelMap.get(z);
        const imageZoomInfo = this.zoomMap.get(cogImageLevel);
        const imageBoundingBox = imageZoomInfo.bbox;

        // check if the COG image bounding box overlaps with the XYZ tile bounding box
        // if not, return null
        // we need to o this as the Geotiff returns a rester always, but not with values
        const bboxOverlap = boundsOverlapCheck(xyzBoundingBox, imageBoundingBox);
        
        if (!bboxOverlap) {
            return null
        }

        // get the COG image at the given level
        const image = await this.tiff.getImage(cogImageLevel);

        // get the bounding box of the rendered area
        const requiredAreaFromImage = boundsToBbox(xyzBoundingBox)

        const rasters = await image.readRasters({
            bbox: requiredAreaFromImage,
            // TODO: bands etc.
        })

        // no rasters mean null return
        if (!rasters) {
            return null
        }

        // return the rasters
        return rasters
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