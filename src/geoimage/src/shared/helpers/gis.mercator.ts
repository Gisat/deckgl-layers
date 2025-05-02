import proj4 from 'proj4';
import { BoundingBox, TupleBBOX } from './gis.types';

/**
 * Mercator resolution for the level 0 in COG image
 * Each next level the resolution is divided by 2
 */
export const MERCATOR_ZERO_256_RESOLUTION = 156543.03125;


export const convertBoundsToMercator = (bounds: BoundingBox) => {

    const wgs84 = 'EPSG:4326';
    const webMerc = 'EPSG:3857';

    const bottomLeft = proj4(wgs84, webMerc, [bounds.west, bounds.south]);
    const topRight = proj4(wgs84, webMerc, [bounds.east, bounds.north]);

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
export const convertMercatorBoundsToCoordinates = (bounds: BoundingBox) => {

    const wgs84 = 'EPSG:4326';
    const webMerc = 'EPSG:3857';


    const bottomLeft = proj4(webMerc, wgs84, [bounds.west, bounds.south]);
    const topRight = proj4(webMerc, wgs84, [bounds.east, bounds.north]);

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