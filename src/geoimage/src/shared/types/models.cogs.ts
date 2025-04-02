import { ReadRasterResult } from "geotiff";

    /**
     * Interface representing the processed data from a COG (Cloud Optimized GeoTIFF) source
     */
    export interface CogLayerData {
        /** Bounding box in [west, south, east, north] format */
        bbox: [number, number, number, number];
        /** Array of corner coordinates forming a closed polygon */
        bounds: [number, number][];
        /** Raster data containing pixel values with interleaved bands */
        rasters: ReadRasterResult
        /** Width of the image in pixels */
        width: number;
        /** Height of the image in pixels */
        height: number;
        /** Resolution in the X direction (degrees or units per pixel) */
        resX: number;
        /** Resolution in the Y direction (degrees or units per pixel, usually negative) */
        resY: number;
        /** Points representing the bounding box corners */
        bboxPoints: {
            west: number;
            south: number;
            east: number;
            north: number;
        };
    }
