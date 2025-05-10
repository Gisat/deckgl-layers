import { BoundingBox } from "@geoimage/shared/gis/gis.types";
import { MERCATOR_ORIGIN_SHIFT, MERCATOR_ZERO_256_RESOLUTION } from "../shared/gis/gis.mercator";

/**
 * TileMagicXYZ class provides methods to work with XYZ tiles and their resolutions.
 * It includes functionality to convert tile coordinates to bounding boxes in Mercator projection,
 * and to find the best zoom level for a given resolution.
 */
export class TileMagicXYZ {

    /**
     * The tile resolution map for different zoom levels of XYZ tiles
     */
    readonly tileZoomResolutionMap: Map<number, number> = new Map<number, number>();

    constructor(readonly tileSize: number = 256, readonly zooms: number = 22) {
        this.tileSize = tileSize;
        this.zooms = zooms;
        this.tileZoomResolutionMap = TileMagicXYZ.buildTileZoomResolutionMap(tileSize, zooms);
    }

    /**
     * Builds a mapping between zoom levels and their corresponding resolutions.
     * 
     * This method creates a Map where the keys are zoom levels (0 to the specified maximum)
     * and the values are the resolutions at those zoom levels. The resolution is calculated
     * based on the standard Web Mercator projection, adjusted for the specified tile size.
     * 
     * @param tileSize - The size of the tiles in pixels. Default is 256.
     * @param zooms - The maximum zoom level to calculate. Default is 22.
     * @returns A Map where keys are zoom levels and values are the corresponding resolutions.
     */
    static buildTileZoomResolutionMap = (
        tileSize: number = 256,
        zooms: number = 22
    ): Map<number, number> => {

        // Map to store zoom level and resolution pairs
        const tileZoomResolutionMap = new Map<number, number>();

        // Adjust for non-standard tile sizes (e.g., 512)
        const baseResolution = MERCATOR_ZERO_256_RESOLUTION * (256 / tileSize);

        // For each zoom level, calculate the resolution
        for (let zoom = 0; zoom <= zooms; zoom++) {
            const resolution = +(baseResolution / Math.pow(2, zoom)).toFixed(3);
            tileZoomResolutionMap.set(zoom, resolution);
        }

        return tileZoomResolutionMap;
    };

    /**
     * Determines the best zoom level and its corresponding resolution for a given resolution in meters per pixel.
     *
     * @param resolutionMetersPerPixels - The target resolution in meters per pixel.
     * @returns An object containing:
     *   - `zoomLevel`: The index of the zoom level with the closest resolution.
     *   - `resolution`: The resolution value at the determined zoom level.
     */
    bestTileZoomForResolution = (resolutionMetersPerPixels: number) => {

        // resolution for each zoom level
        const tileZoomLevelResolutions = Array.from(this.tileZoomResolutionMap.values())

        // find the best XYZ tile zoom index for provided resolution
        let bestResolutionIndex = 0;

        for (let i = 0; i < tileZoomLevelResolutions.length; i++) {
            const closestResolution = tileZoomLevelResolutions[bestResolutionIndex];
            const currentResolution = tileZoomLevelResolutions[i];

            const bestDifference = Math.abs(closestResolution - resolutionMetersPerPixels);
            const currentDifference = Math.abs(currentResolution - resolutionMetersPerPixels);

            const hasThisCogLevelCloserResolution = currentDifference < bestDifference;


            if (hasThisCogLevelCloserResolution) {
                bestResolutionIndex = i;
            }
        }

        // response format
        const response = {
            zoomLevel: bestResolutionIndex,
            resolution: tileZoomLevelResolutions[bestResolutionIndex],
        }

        return response
    }

    /**
     * Converts XYZ tile coordinates to a bounding box in Mercator projection.
     * 
     * @param xyz - An array containing [x, y, z] coordinates of the tile
     * @returns A BoundingBox object with west, south, east, and north properties
     */
    tileXYToMercatorBBox = ([x, y, z]: [x: number, y: number, z: number], tileSize = 256): BoundingBox => {
        
        // move coordinates to the center of the world (0,0)
        const originShift = (tileSize / 2) * MERCATOR_ZERO_256_RESOLUTION; // 20037508.342789244

        // obtain the resolution for the given zoom level
        const resolution = this.tileZoomResolutionMap.get(z);
        if (!resolution) {
            throw new Error(`Resolution not found for zoom level ${z}`);
        }

        // Calculate the bounding box in meters
        const minx = x * tileSize * resolution - originShift;
        const maxx = (x + 1) * tileSize * resolution - originShift;
        const maxy = originShift - y * tileSize * resolution;
        const miny = originShift - (y + 1) * tileSize * resolution;

        return {
            west: minx, // left (west) in meters
            south: miny, // bottom (south) in meters
            east: maxx, // right (east) in meters
            north: maxy, // top (north) in meters
        };
    };

    /**
     * Converts coordinates in meters to tile coordinates at a specific zoom level.
     *
     * @param xMeters - The X coordinate in meters.
     * @param yMeters - The Y coordinate in meters.
     * @param zoom - The zoom level for the tile grid.
     * @param tileSize - The size of a single tile in pixels (default is 256).
     * @returns A tuple containing the tile X coordinate, tile Y coordinate, and the zoom level.
     */
    metersToTile(xMeters: number, yMeters: number, zoom: number, tileSize = 256): [number, number, number] {
        
        // move coordinates to the center of the world (0,0)
        const initialResolution = (2 * MERCATOR_ORIGIN_SHIFT) / tileSize;

        // calculate the resolution for the given zoom level
        const resolution = initialResolution / Math.pow(2, zoom);
      
        // calculate the pixel coordinates
        const pixelX = (xMeters + MERCATOR_ORIGIN_SHIFT) / resolution;
        const pixelY = (MERCATOR_ORIGIN_SHIFT - yMeters) / resolution;
      
        // calculate the tile coordinates
        const tileX = Math.floor(pixelX / tileSize);
        const tileY = Math.floor(pixelY / tileSize);
      
        return [tileX, tileY, zoom];
      }
}