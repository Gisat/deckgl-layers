import { TupleBBOX, BoundingBox } from "./gis.types"

/**
 * Converts a tuple representing a bounding box to a BoundingBox object.
 *
 * @param {TupleBBOX} bboxTuple - A tuple containing [west, south, east, north] coordinates
 * @returns {BoundingBox} An object with west, south, east, and north properties
 */
export const bboxToBounds = ([west, south, east, north]: TupleBBOX | number[] | [number, number, number, number]): BoundingBox => {
    return {
        west,
        south,
        east,
        north
    }
}

/**
 * Converts a BoundingBox object to a TupleBBOX array.
 * 
 * @param bounds - The bounding box object containing west, south, east, and north coordinates
 * @returns A tuple array in the format [west, south, east, north]
 */
export const boundsToBbox = (bounds: BoundingBox): TupleBBOX => {
    return [
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north
    ]
}