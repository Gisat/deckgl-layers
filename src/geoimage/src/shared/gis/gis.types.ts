

/**
 * Four coordinates of a bounding box
 * [minX, minY, maxX, maxY]
 * or [west, south, east, north]
 */
type TupleBBOX = [number, number, number, number];

/**
 * Three coordinates of a tile
 * [x, y, z]
 * or [tileX, tileY, zoomLevel]
 */
type TupleXYZ = [number, number, number];

/**
 * Four coordinates of a bounding box
 */
type BoundingBox = {
    west: number;  // min x
    south: number; // min y
    east: number; // max x
    north: number; // max y
}

export type { TupleBBOX, TupleXYZ, BoundingBox };