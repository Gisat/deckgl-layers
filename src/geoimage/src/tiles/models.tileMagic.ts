import { BoundingBox } from "@geoimage/shared/helpers/gis.types";
import { MERCATOR_ZERO_256_RESOLUTION } from "../shared/helpers/gis.mercator";

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

        const tileZoomResolutionMap = new Map<number, number>();

        // Adjust for non-standard tile sizes (e.g., 512)
        const baseResolution = MERCATOR_ZERO_256_RESOLUTION * (256 / tileSize);

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
        
        const originShift = (tileSize / 2) * MERCATOR_ZERO_256_RESOLUTION; // 20037508.342789244

        const resolution = this.tileZoomResolutionMap.get(z);
        if (!resolution) {
            throw new Error(`Resolution not found for zoom level ${z}`);
        }

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

    tileXYToTopLeftMercator = ([x, y, z]: [x: number, y: number, z: number], tileSize = 256): { x: number, y: number } => {
        const originShift = (tileSize / 2) * MERCATOR_ZERO_256_RESOLUTION;
    
        const resolution = this.tileZoomResolutionMap.get(z);
        if (!resolution) {
            throw new Error(`Resolution not found for zoom level ${z}`);
        }
    
        const topLeftX = x * tileSize * resolution - originShift;
        const topLeftY = originShift - y * tileSize * resolution;
    
        return {
            x: topLeftX,
            y: topLeftY,
        };
    };

    metersToTile(xMeters: number, yMeters: number, zoom: number, tileSize = 256): [number, number, number] {
        const originShiftMeters = 20037508.342789244;
        const initialResolution = (2 * originShiftMeters) / tileSize;
        const resolution = initialResolution / Math.pow(2, zoom);
      
        const pixelX = (xMeters + originShiftMeters) / resolution;
        const pixelY = (originShiftMeters - yMeters) / resolution;
      
        const tileX = Math.floor(pixelX / tileSize);
        const tileY = Math.floor(pixelY / tileSize);
      
        return [tileX, tileY, zoom];
      }
}