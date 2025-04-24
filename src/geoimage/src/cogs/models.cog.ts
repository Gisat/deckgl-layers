import GeoTIFF, { fromFile, fromUrl, ReadRasterResult } from "geotiff";
import { TileMagicXYZ } from "../tiles/models.tileMagic";
import type { BoundingBox, TupleBBOX } from "@geoimage/shared/helpers/gis.types";
import { boundsOverlapCheck, boundsToBbox } from "@geoimage/shared/helpers/gis.transform";
import { NullablePromise } from "@geoimage/shared/helpers/code.types";

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

    /**
     * Initializes the COG (Cloud Optimized GeoTIFF) image processing by iterating through
     * all zoom levels of the TIFF file and setting up the necessary metadata for each level.
     * 
     * This method performs the following tasks:
     * - Reads the number of zoom levels in the TIFF file.
     * - Extracts and sets the main image properties (origin, resolution, bounding box) from the highest resolution level.
     * - Builds a resolution pyramid for the COG levels.
     * - Calculates tile and pixel dimensions, number of tiles, and resolutions for each zoom level.
     * - Maps COG zoom levels to XYZ tile zoom levels for compatibility with tile-based systems.
     * - Stores metadata for each zoom level in `zoomMap` and maps XYZ zoom levels to COG levels in `tileZoomToCogLevelMap`.
     * 
     * @async
     * @returns {Promise<void>} Resolves when the initialization process is complete.
     * 
     * @throws {Error} If there is an issue reading the TIFF file or processing the zoom levels.
     */
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

            // setup main image level properties (COG level 0)
            // at lower image levels the COG hasn't those values
            if (cogZoom === 0) {
                
                // get the main image properties
                mainOrigins = cogLevelImage.getOrigin() as [number, number, number];
                mainResolutions = cogLevelImage.getResolution() as [number, number, number];
                mainBoundingBox = cogLevelImage.getBoundingBox() as [number, number, number, number];

                // build the resolution pyramid for the COG levels
                resolutionPyramid = CogImage.buildCogResolutionPyramid(mainResolutions[0], zooms);

                // initialise XYZ tile helper
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
            const resolutionMetersPerPixel = +(levelZeroXResolution * Math.pow(2, level)).toFixed(4);
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

    /**
     * Asynchronously retrieves raster data for a given XYZ tile from a Cloud Optimized GeoTIFF (COG).
     *
     * @param xyz - A tuple containing the X, Y, and Z coordinates of the XYZ tile.
     * @param tileSize - The size of the tile in pixels. Defaults to 256.
     * @param xyzMaxZoom - The maximum zoom level for the XYZ tile system. Defaults to 26.
     * @returns A promise that resolves to the raster data (`ReadRasterResult`) for the specified tile,
     *          or `null` if the tile does not overlap with the COG image bounding box or no raster data is available.
     *
     * @remarks
     * - This function uses a helper class (`TileMagicXYZ`) to calculate the bounding box of the XYZ tile in Mercator projection.
     * - It determines the appropriate COG image level based on the XYZ zoom level using a mapping.
     * - If the bounding box of the XYZ tile does not overlap with the COG image bounding box, the function returns `null`.
     * - The function reads raster data from the COG image for the overlapping area and returns it.
     * - If no raster data is available, the function returns `null`.
     */
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

    /**
     * Creates a new instance of `CogImage` from a given URL.
     *
     * This method fetches a Cloud Optimized GeoTIFF (COG) from the specified URL,
     * initializes it, and returns an instance of `CogImage`.
     *
     * @param url - The URL or string representing the location of the COG file.
     *              If a `URL` object is provided, it will be converted to a string.
     * @returns A promise that resolves to an initialized `CogImage` instance.
     * @throws Will throw an error if the URL is invalid or the COG file cannot be fetched or initialized.
     */
    static async fromUrl(url: string | URL) {
        const tiff = await fromUrl(url instanceof URL ? url.toString() : url);
        const cogInstance = new CogImage(tiff);
        await cogInstance.initialize();
        return cogInstance;
    }

    /**
     * Creates an instance of `CogImage` from a given file path.
     *
     * @param path - The file path to the COG (Cloud Optimized GeoTIFF) file.
     * @returns A promise that resolves to an initialized `CogImage` instance.
     * @throws Will throw an error if the file cannot be read or the initialization fails.
     */
    static async fromFile(path: string) {
        const tiff = await fromFile(path);
        const cogInstance = new CogImage(tiff);
        await cogInstance.initialize();
        return cogInstance;
    }

}