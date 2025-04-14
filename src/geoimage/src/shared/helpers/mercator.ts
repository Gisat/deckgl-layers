
/**
 * Calculate an array of meters-per-pixel resolutions for each zoom level.
 * 
 * This function computes the ground resolution (meters per pixel) for each tile zoom level
 * based on the Web Mercator projection. It uses the formula:
 * resolution = (2 * π * Earth radius) / (2^zoom * tileSize)
 * 
 * @param options - Configuration options
 * @param options.numberOfTileLevels - The maximum number of zoom levels to calculate resolutions for (default: 30)
 * @param options.tileSize - The size of the tiles in pixels (default: 256)
 * @returns An array of resolutions in meters per pixel, where the index corresponds to the zoom level
 * 
 * @example
 * // Get resolutions for zoom levels 0-20 with 512px tiles
 * const resolutions = tileZoomsToMetersPerPixel({ numberOfTileLevels: 21, tileSize: 512 });
 */
export const tileZoomToMetersPerPixel =
    ({ numberOfTileLevels = 30, tileSize = 256 }: Partial<{ numberOfTileLevels: number, tileSize: 256 | 512 }>) => {
        const earthRadius = 6378137; // in meters
        const initialResolution = (2 * Math.PI * earthRadius) / tileSize;
        const resolutions = [];

        for (let tileZoomLevel = 0; tileZoomLevel < numberOfTileLevels; tileZoomLevel++) {
            const resolution = initialResolution / Math.pow(2, tileZoomLevel);
            resolutions.push(Number(resolution.toFixed(5)));
        }

        return resolutions;
    };