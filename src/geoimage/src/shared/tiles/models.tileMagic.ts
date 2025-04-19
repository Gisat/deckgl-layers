import { MERCATOR_ZERO_256_RESOLUTION } from "../cogs/mercator";

export class TileMagicXYZ {

    readonly tileZoomResolutionMap: Map<number, number> = new Map<number, number>();

    constructor(readonly tileSize: number = 256, readonly zooms: number = 22) {
        this.tileSize = tileSize;
        this.zooms = zooms;
        this.tileZoomResolutionMap = TileMagicXYZ.buildTileZoomResolutionMap(tileSize, zooms);
    }

    static buildTileZoomResolutionMap = (
        tileSize: number = 256,
        zooms: number = 22
    ): Map<number, number> => {

        const tileZoomResolutionMap = new Map<number, number>();

        // Adjust for non-standard tile sizes (e.g., 512)
        const baseResolution = MERCATOR_ZERO_256_RESOLUTION * (256 / tileSize);

        for (let zoom = 0; zoom <= zooms; zoom++) {
            const resolution = +(baseResolution / Math.pow(2, zoom)).toFixed(5);
            tileZoomResolutionMap.set(zoom, resolution);
        }

        return tileZoomResolutionMap;
    };

    resolutionForZoomLevel = (zoomLevel: number): number => {
        if (this.tileZoomResolutionMap.has(zoomLevel)) {
            return this.tileZoomResolutionMap.get(zoomLevel);
        } else {
            throw new Error(`Zoom level ${zoomLevel} not found in tile zoom resolution map.`);
        }
    }

    bestZoomLevelForResolution = (resolutionMetersPerPixels: number): number => {
        const tileZoomLevelIndexes = Array.from(this.tileZoomResolutionMap.keys());
        const tileZoomLevelResolutions = Array.from(this.tileZoomResolutionMap.values())

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

        return tileZoomLevelIndexes[bestResolutionIndex];
    }
}