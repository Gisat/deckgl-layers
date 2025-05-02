import GeoTIFF, { fromFile, fromUrl, GeoTIFFImage, ReadRasterResult } from "geotiff";
import { TileMagicXYZ } from "../tiles/models.tileMagic";
import type { BoundingBox, TupleBBOX } from "@geoimage/shared/helpers/gis.types";
import { bboxIntersectionPart, bboxToBounds, isBoundsOverlap, boundsToBbox } from "@geoimage/shared/helpers/gis.transform";
import { convertBoundsToMercator, differenceBetweenPointsInMercator } from "@geoimage/shared/helpers/gis.mercator";

/**
 * Represents a mapping between an image level and its corresponding resolution.
 *
 * @property imageLevel - The level of the image, typically representing a zoom or detail level.
 * @property imageResolution - The resolution of the image at the specified level, usually in pixels per unit.
 */
type ImageLevelWithResolution = {
    imageLevel: number;
    imageResolution: number;
}

/**
 * Class representing a Cloud Optimized GeoTIFF (COG) image.
 * This class provides methods to read and manipulate COG images, including
 * retrieving image levels, resolutions, and raster data.
 * 
 * We do not load or count all images at once, but only the one we need.
 * This is because the COG image can be very slow to load and can be very large.
 * 
 * .. so we guess them!
 * In fact COG can be predicted, tiled ones works similar to XYZ tiles.
 */
export class CogDynamicImage {

    // source of the COG data
    // the top level of the TIFF with all IPRs
    tiff: GeoTIFF;

    // origin of the COG image in meters
    // top left corner of the image
    // it is the same for all levels
    origin: [number, number, number];

    // bbox of the COG image in meters
    // it is the same for all levels
    bbox: TupleBBOX;

    // the COG image is in projected CRS
    projection: string;


    // bounds of the COG image in meters
    // it is the same for all levels
    bounds: BoundingBox

    // resolution of the COG level 0 image in meters
    // than the COG has no info about the levels
    // so we need to count them from known COG leveling logic
    // each level is number of meters in single pixel doubled as the image describes bigger area
    // tasken from the image width
    mainResolutionMetersPerPixel: number

    // XYZ zoom level of the main image
    // we need to catch the first tile zoom to predict each image level for 
    xyzMainImageZoom: number

    xyzMainImageIndexes: [number, number, number]

    // helper for XYZ tiles, like for comparing resolutions
    tileMagicXYZ: TileMagicXYZ;

    /**
     * Contructor is private, use fromUrl or fromFile methods
     * It's because the GeoTIFF library is async
     * @param tiff 
     */
    private constructor(tiff: GeoTIFF) {
        this.tiff = tiff;
        this.tileMagicXYZ = new TileMagicXYZ();
    }

    /**
     * Initializes the COG (Cloud Optimized GeoTIFF) image by loading the main image at level 0
     * and extracting its properties such as origin, bounding box, bounds, and resolution.
     * Additionally, determines the best zoom level for the main image resolution.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     *
     * @remarks
     * - The main image at level 0 is considered the highest resolution image and is used
     *   to derive the origin, bounding box, and resolution for all levels.
     * - The `tileMagicXYZ.bestZoomLevelForResolution` method is used to calculate the
     *   appropriate zoom level for the main image resolution.
     *
     * @throws {Error} If there is an issue retrieving the main image or its properties.
     */
    async initialize(): Promise<void> {

        // image at level 0 is the main image
        // it has the same origin and bounding box for all levels
        // it is the image with the highest resolution
        const mainImage = await this.tiff.getImage(0);


        // origin and bounding box of the COG image are same for all levels
        this.origin = mainImage.getOrigin() as [number, number, number];
        this.bbox = mainImage.getBoundingBox() as [number, number, number, number];
        this.bounds = bboxToBounds(this.bbox);

        // projection of the COG image is same for all levels
        const geoKeys = mainImage.getGeoKeys();
        this.projection = geoKeys.ProjectedCSTypeGeoKey || geoKeys.GeographicTypeGeoKey
        if (!this.projection)
            throw new Error("No projection found in the COG image");

        // COG image resolution
        // tiled COGs has same re
        const resolutions = mainImage.getResolution();
        this.mainResolutionMetersPerPixel = resolutions[0];

        const {
            zoomLevel: xyzZoomLevel
        } = this.tileMagicXYZ.bestTileZoomForResolution(this.mainResolutionMetersPerPixel)

        this.xyzMainImageZoom = xyzZoomLevel;

        this.xyzMainImageIndexes = this.tileMagicXYZ.metersToTile(this.origin[0], this.origin[1], xyzZoomLevel);
    }

    /**
     * Calculates the expected image level and resolution for a given tile zoom level.
     * The point is o find the match between the COG level 0 image and the XYZ tile zoom level.
     * From that point we assume, that the change of XYZ is the same as the COG image level, but in reverse.
     * 
     * @param tileZoom - The zoom level of the XYZ tile for which the image level and resolution are calculated.
     * @returns An object containing:
     *   - `imageLevel`: The calculated image level, ensuring it is not less than 0.
     *   - `imageResolution`: The resolution of the image at the calculated level.
     */
    expectedImageForTileZoom = (tileZoom: number): ImageLevelWithResolution => {

        // how far is this XYZ zoom from the image level 0 zoom
        const xyzZoomDifference = this.xyzMainImageZoom - tileZoom;

        // the value can be negative, so we need to set it to 0 in that case
        // this COG image level is predicted for the XYZ zoom
        const imageLevel = Math.max(0, xyzZoomDifference);

        // now can expect the image resolution for the level
        const imageResolution = CogDynamicImage.imgageResolutionForLevel(imageLevel, this.mainResolutionMetersPerPixel);

        // return the image level and resolution
        return {
            imageLevel,
            imageResolution
        };
    }

    /**
     * Determines the best image level and its resolution that most closely matches
     * the requested resolution in meters per pixel. Iterates through a specified
     * number of levels to find the closest match.
     *
     * @param resolutionMetersPerPixel - The desired resolution in meters per pixel.
     * @param numberOfIteratedLevels - The number of levels to iterate through to find the best match.
     *                                  Defaults to 30 if not specified.
     * @returns An object containing the best image level and its corresponding resolution.
     */
    expectedImageForResolution = (resolutionMetersPerPixel: number, numberOfIteratedLevels = 30): ImageLevelWithResolution => {

        // define the best results
        let bestResult: { imageLevel: number, imageResolution: number };

        // iterate over expected levels to find the best match
        for (let level = 0; level < numberOfIteratedLevels; level++) {

            // level should have this resolution
            const levelResolution = CogDynamicImage.imgageResolutionForLevel(level, this.mainResolutionMetersPerPixel);

            // if this is the COG level 0, set it as the best one defaultly
            if (level === 0) {
                bestResult = {
                    imageLevel: level,
                    imageResolution: levelResolution
                }
            }

            // count the difference between the two resolutions
            // ...the actually best
            const bestDifference = Math.abs(bestResult.imageResolution - resolutionMetersPerPixel);

            // ...and the current one
            const currentDifference = Math.abs(levelResolution - resolutionMetersPerPixel);

            // is the current resolution closer to the requested resolution than the best one?
            const hasThisCogLevelCloserResolution = currentDifference < bestDifference;

            // if so, set the current resolution as the best one
            if (hasThisCogLevelCloserResolution) {
                bestResult = {
                    imageLevel: level,
                    imageResolution: levelResolution
                }
            }
        }

        // and here we have a winner
        return bestResult;
    }

    /**
     * Attempts to read an image at the specified level from the TIFF file.
     *
     * @param imageLevel - The level of the image to read.
     * @returns A promise that resolves to the image if it exists, or `null` if no image is available at the specified level.
     * @throws Logs an informational message if the image cannot be retrieved.
     */
    tryToReadImage = async (imageLevel: number) => {
        // we dont know how many levels are in the COG
        // so we try it...
        try {
            // there is a level, yay!
            const image = await this.tiff.getImage(imageLevel);
            return image;
        } catch (error) {
            // ...or not :(
            console.info(`No image at level ${imageLevel}:`, imageLevel);
            return null;
        }
    }

    /**
     * Calculates the expected resolution of an COG image for a given image level.
     *
     * @param imageLevel - The level of the image for which the resolution is being calculated.
     * @returns The resolution of the image at the specified level. Resolution is in meters per pixel.
     */
    expectedImageLevelResolution = (imageLevel: number) =>
        CogDynamicImage.imgageResolutionForLevel(imageLevel, this.mainResolutionMetersPerPixel);


    /**
     * Retrieves raster data for a specific zoom level and bounding box.
     *
     * @param zoom - The zoom level for which the raster data is requested.
     * @param bboxWebCoordinates - The bounding box defining the area of interest, represented as a tuple. Declared in web mercator (longitude, latitude).
     * @returns A promise that resolves to the raster data (`ReadRasterResult`) for the specified zoom level and bounding box.
     * @throws An error if no image is found for the specified zoom level.
     */
    imageByBoundsForXYZ = async (zoom: number, bboxWebCoordinates: TupleBBOX, flatStructure = true, tileSize = 256): Promise<ReadRasterResult | null> => {


        const renderingIndex = Math.floor(Math.random() * 10000)

        /**
         * Checks if the provided GeoTIFF image is tiled.
         * 
         * @param image - The GeoTIFF image to check.
         * @throws {Error} Throws an error if the image is not tiled.
         */
        const checkCogIsTiled = (image: GeoTIFFImage) => {
            if (!image.isTiled)
                throw new Error("The image is not tiled");
        }

        const bounds = bboxToBounds(bboxWebCoordinates);
        const { bbox: bboxTileMercator } = convertBoundsToMercator(bounds)

        // check if the COG image bounding box overlaps with the XYZ tile bounding box
        // the Geotiff library always returns a result
        // but we don't need it in the case of no overlap
        const bboxOverlap = isBoundsOverlap(bboxTileMercator, this.bbox);

        if (!bboxOverlap) {
            return null
        }

        console.log("Tile bbox", bboxTileMercator, renderingIndex)
        console.log("Image bbox", this.bbox, renderingIndex)

        const { bbox: bboxImageSection } = bboxIntersectionPart(bboxTileMercator, this.bbox);

        console.log("Shared Section bbox", bboxImageSection, renderingIndex)

        // guess the image level for the requested XYZ tile zoom level
        const { imageLevel } = this.expectedImageForTileZoom(zoom);

        // try to read image for the requested level
        const image = await this.tryToReadImage(imageLevel);

        // no image at the level? Than return null
        if (!image)
            return null;

        // we need tiled COGs only
        checkCogIsTiled(image)

        const expectedResolution = this.expectedImageLevelResolution(imageLevel);
        
        const windowSelection = CogDynamicImage.bboxToWindow(
            bboxImageSection, 
            this.origin, 
            [expectedResolution, expectedResolution]
        );

        console.log("Window selection", windowSelection, renderingIndex)

        // select and read rasters from the image
        // using interleave = raster result one long array of values
        // with false it is an array of arrays (array per band)
        // TODO: make interleave optional
        // TODO: bands etc.
        const rastersRead = await image.readRasters({
            // bbox: bboxMercator, // INFO: Not working for some reason
            window: windowSelection,
            interleave: flatStructure,
            height: tileSize,
            width: tileSize,
        })

        // return the raster result
        return rastersRead
    }

    static bboxToWindow(imagePartBox: TupleBBOX, origin: [number, number, number], resolution: [number, number]) {
        
        // COG image origin
        const [originX, originY] = origin;

        // COG level 0 resolution (max zoom)
        const [resX, resY] = resolution;

        /**
         * Counts difference in meters between the COG image origin and the given coordinates
         * Than it divides the difference by the resolution (m /px), so we get the pixel number 
         * @param xMercator x coordinate in meters
         * @param yMercator y coordinate in meters
         * @returns 
         */
        const mercatorToPixel = (xMercator: number, yMercator: number) => {
            const pixelX = Math.floor((xMercator - originX) / resX);
            const pixelY = Math.floor((yMercator - originY) / resY);
            return [pixelX, pixelY];
        };

        // decompose bbox of shared part between the COG image and the XYZ tile
        const [minX, minY, maxX, maxY] = imagePartBox;

        // convert meters to pixel coordinates
        // and abs them to get the positive values (TODO: is that ok?)
        const [px0, py0] = mercatorToPixel(minX, maxY).map(val => Math.abs(val));
        const [px1, py1] = mercatorToPixel(maxX, minY).map(val => Math.abs(val));

        //... but the coordinates can be reversed
        // so we need to find the min and max values
        // to start and end the window

        // X axis of the image
        const pxOriginX = Math.min(px0, px1) // from the left
        const pxEndX = Math.max(px0, px1) // to the right

        // Y axis of the image
        const pxOriginY = Math.min(py0, py1) // from the top
        const pxEndY = Math.max(py0, py1) // to the bottom


        // return as a window selection for COG rater reading
        return [pxOriginX, pxOriginY, pxEndX, pxEndY]
    }

    /**
     * Closes the underlying TIFF file and releases any associated resources.
     * This method should be called when the TIFF file is no longer needed
     * to ensure proper cleanup and avoid resource leaks.
     */
    close() {
        this.tiff.close()
    }

    /**
     * Counts image level resolution in meters per pixel for the given level
     * The level zero is the highest resolution (max zoom)
     * Each next level the resolution is divided by 2
     * @param actualImageLevel Actual image level
     * @param cogLevelZeroResolution Resolution of the level zero in meters per pixel
     * @returns Resolution in meters per pixel for the given level
     */
    static imgageResolutionForLevel = (actualImageLevel: number, cogLevelZeroResolution: number) => {

        // level zero has max resolution (max zoom)
        // max zoom means we are closest to the image
        // it means pixel represents lowest number of meters
        // as we go out of the image each pixel represents more meters
        // diffferences are in powers of 2
        const resolutionMetersPerPixel = +(cogLevelZeroResolution * Math.pow(2, actualImageLevel)).toFixed(3);

        return resolutionMetersPerPixel
    }



    /**
     * More for testing and debugging. 
     * Reads all raster values from the given raster result.
     * This method iterates through the raster result and logs each value to the console.
     * It can be useful for debugging purposes to see the values of the raster data.
     * @param rasterResult Result given by the readRasters method
     */
    static debugAllRasterValues = (rasterResult: ReadRasterResult) => {
        for (let i = 0; i < rasterResult.length; i++) {
            const value = rasterResult[i];
            console.log(`Value at index ${i}: ${value}`);
        }
    }

    static debugAnyValueInRaster = (rasterResult: any) => {
        // check if the raster result is empty
        if (!rasterResult || rasterResult.length === 0) {
            console.log("No rasters found for the given XYZ coordinates");
            return false;
        }

        const arr = Array.from(rasterResult);
        // check if the raster result is an array
        if (!Array.isArray(arr)) {
            console.log("Raster result is not an array");
            return false;
        }

        // check if the raster result has any values
        const hasData = rasterResult.some(value => value !== 0 && !isNaN(value));
        if (!hasData) {
            console.log("No data found in the raster result");
            return false;
        }

        return true;
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
        const cogInstance = new CogDynamicImage(tiff);
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
        const cogInstance = new CogDynamicImage(tiff);
        await cogInstance.initialize();
        return cogInstance;
    }

}