import proj4 from 'proj4';
import { BoundingBox, TupleBBOX } from './gis.types';
import { bboxToBounds, boundsToBbox } from './gis.transform';

const WGS84 = 'EPSG:4326';
const WEB_MERCATOR = 'EPSG:3857';

/**
 * Mercator resolution for the level 0 in COG image
 * Each next level the resolution is divided by 2
 */
export const MERCATOR_ZERO_256_RESOLUTION = 156543.03125;


export const convertBoundsToMercator = (bounds: BoundingBox | TupleBBOX) => {

    if(Array.isArray(bounds)) 
        bounds = bboxToBounds(bounds);

    const bottomLeft = proj4(WGS84, WEB_MERCATOR, [bounds.west, bounds.south]).map(value => Math.floor(value));
    const topRight = proj4(WGS84, WEB_MERCATOR, [bounds.east, bounds.north]).map(value => Math.floor(value));

    const mercatorBBox = {
        minX: bottomLeft[0],
        minY: bottomLeft[1],
        maxX: topRight[0],
        maxY: topRight[1]
    };

    return {
        bounds: {
            west: mercatorBBox.minX,
            south: mercatorBBox.minY,
            east: mercatorBBox.maxX,
            north: mercatorBBox.maxY
        } as BoundingBox,
        bbox: [
            mercatorBBox.minX,
            mercatorBBox.minY,
            mercatorBBox.maxX,
            mercatorBBox.maxY
        ] as TupleBBOX
    }
}
export const convertMercatorBoundsToCoordinates = (bounds: BoundingBox | TupleBBOX) => {

    if(Array.isArray(bounds)) 
        bounds = bboxToBounds(bounds);


    const bottomLeft = proj4(WEB_MERCATOR, WGS84, [bounds.west, bounds.south])
    const topRight = proj4(WEB_MERCATOR, WGS84, [bounds.east, bounds.north])

    const mercatorBBox = {
        minX: bottomLeft[0],
        minY: bottomLeft[1],
        maxX: topRight[0],
        maxY: topRight[1]
    };

    return {
        bounds: {
            west: mercatorBBox.minX,
            south: mercatorBBox.minY,
            east: mercatorBBox.maxX,
            north: mercatorBBox.maxY
        } as BoundingBox,
        bbox: [
            mercatorBBox.minX,
            mercatorBBox.minY,
            mercatorBBox.maxX,
            mercatorBBox.maxY
        ] as TupleBBOX
    }
}


export const differenceBetweenPointsInMercator =
    (originPointMeters: [number, number], movePointMeters: [number, number]): [number, number] => {
        const [oX, oY] = originPointMeters;
        const [mX, mY] = movePointMeters;

        const deltaX = mX - oX;
        const deltaY = mY - oY;

        return [deltaX, deltaY];
    }