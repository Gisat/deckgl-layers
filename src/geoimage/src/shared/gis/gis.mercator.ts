import proj4 from 'proj4';
import { BoundingBox, TupleBBOX } from './gis.types';
import { bboxToBounds, boundsToBbox } from './gis.bbox';

const WGS84 = 'EPSG:4326';
const WEB_MERCATOR = 'EPSG:3857';

/**
 * Mercator resolution for the level 0 in COG image
 * Each next level the resolution is divided by 2
 */
export const MERCATOR_ZERO_256_RESOLUTION = 156543.03125;


/**
 * Converts geographic bounds to Web Mercator projection bounds.
 *
 * This function takes a bounding box in geographic coordinates (WGS84) and converts it
 * to the Web Mercator projection. The result includes both a `BoundingBox` object and
 * a `TupleBBOX` array representation of the bounds in Web Mercator coordinates.
 *
 * @param bounds - The input bounding box, which can be either a `BoundingBox` object
 *                 or a `TupleBBOX` array. If it is a `TupleBBOX`, it will be converted
 *                 to a `BoundingBox` internally.
 * @returns An object containing:
 *          - `bounds`: A `BoundingBox` object with the converted Web Mercator coordinates.
 *          - `bbox`: A `TupleBBOX` array with the converted Web Mercator coordinates.
 */
export const convertBoundsToMercator = (bounds: BoundingBox | TupleBBOX) => {

    // Check if the input is an array (TupleBBOX) and convert it to a BoundingBox
    if(Array.isArray(bounds)) 
        bounds = bboxToBounds(bounds);

    // Convert the geographic coordinates (WGS84) to Web Mercator coordinates
    const bottomLeft = proj4(WGS84, WEB_MERCATOR, [bounds.west, bounds.south]).map(value => Math.floor(value));
    const topRight = proj4(WGS84, WEB_MERCATOR, [bounds.east, bounds.north]).map(value => Math.floor(value));

    // Create a bounding box in Web Mercator coordinates
    const mercatorBBox = {
        minX: bottomLeft[0],
        minY: bottomLeft[1],
        maxX: topRight[0],
        maxY: topRight[1]
    };

    return {
        // Bounds format (west, south, east, north)
        bounds: {
            west: mercatorBBox.minX,
            south: mercatorBBox.minY,
            east: mercatorBBox.maxX,
            north: mercatorBBox.maxY
        } as BoundingBox,

        // TupleBBOX format (minX, minY, maxX, maxY)
        bbox: [
            mercatorBBox.minX,
            mercatorBBox.minY,
            mercatorBBox.maxX,
            mercatorBBox.maxY
        ] as TupleBBOX
    }
}
/**
 * Converts a bounding box in Web Mercator projection to geographic coordinates (WGS84).
 *
 * @param bounds - The bounding box to convert. It can be either a `BoundingBox` object
 *                 or a `TupleBBOX` array. If it is a `TupleBBOX`, it will be converted
 *                 to a `BoundingBox` internally.
 * 
 * @returns An object containing:
 *          - `bounds`: A `BoundingBox` object with geographic coordinates (WGS84).
 *          - `bbox`: A `TupleBBOX` array with geographic coordinates (WGS84).
 */
export const convertMercatorBoundsToCoordinates = (bounds: BoundingBox | TupleBBOX) => {

    // Check if the input is an array (TupleBBOX) and convert it to a BoundingBox
    if(Array.isArray(bounds)) 
        bounds = bboxToBounds(bounds);

    // Convert the Web Mercator coordinates to geographic coordinates (WGS84)
    const bottomLeft = proj4(WEB_MERCATOR, WGS84, [bounds.west, bounds.south])
    const topRight = proj4(WEB_MERCATOR, WGS84, [bounds.east, bounds.north])

    const mercatorBBox = {
        minX: bottomLeft[0],
        minY: bottomLeft[1],
        maxX: topRight[0],
        maxY: topRight[1]
    };

    // Create a bounding box in Web Mercator coordinates
    return {
        // Bounds format (west, south, east, north)
        bounds: {
            west: mercatorBBox.minX,
            south: mercatorBBox.minY,
            east: mercatorBBox.maxX,
            north: mercatorBBox.maxY
        } as BoundingBox,
        
        // TupleBBOX format (minX, minY, maxX, maxY)
        bbox: [
            mercatorBBox.minX,
            mercatorBBox.minY,
            mercatorBBox.maxX,
            mercatorBBox.maxY
        ] as TupleBBOX
    }
}


/**
 * Calculates the difference between two points in the Mercator projection (in meters).
 *
 * @param originPointMeters - The origin point in meters as a tuple [x, y].
 * @param movePointMeters - The destination point in meters as a tuple [x, y].
 * @returns A tuple [deltaX, deltaY] representing the difference in meters
 *          between the two points along the x and y axes.
 */
export const differenceBetweenPointsInMercator =
    (originPointMeters: [number, number], movePointMeters: [number, number]): [number, number] => {
        const [oX, oY] = originPointMeters;
        const [mX, mY] = movePointMeters;

        const deltaX = mX - oX;
        const deltaY = mY - oY;

        return [deltaX, deltaY];
    }