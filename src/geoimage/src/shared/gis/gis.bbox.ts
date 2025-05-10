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


/**
 * Determines whether two bounding boxes overlap.
 *
 * @param bboxA - The first bounding box, which can be either a `TupleBBOX` or a `BoundingBox`.
 *                If it is not a `TupleBBOX`, it will be converted using `boundsToBbox`.
 * @param bboxB - The second bounding box, which can be either a `TupleBBOX` or a `BoundingBox`.
 *                If it is not a `TupleBBOX`, it will be converted using `boundsToBbox`.
 * @returns A boolean indicating whether the two bounding boxes overlap.
 */
export const isBoundsOverlap = (bboxA: TupleBBOX | BoundingBox, bboxB: TupleBBOX | BoundingBox) => {

    // Convert to TupleBBOX if necessary
    if (!Array.isArray(bboxA))
        bboxA = boundsToBbox(bboxA);

    if (!Array.isArray(bboxB))
        bboxB = boundsToBbox(bboxB);

    // Check if the bounding boxes overlap
    return (
        bboxA[0] < bboxB[2] &&  // A.minX < B.maxX
        bboxA[2] > bboxB[0] &&  // A.maxX > B.minX
        bboxA[1] < bboxB[3] &&  // A.minY < B.maxY
        bboxA[3] > bboxB[1]     // A.maxY > B.minY
    );
}

/**
 * Determines whether one bounding box (inner) is fully contained within another bounding box (outer).
 *
 * @param outer - The outer bounding box represented as a tuple [minX, minY, maxX, maxY].
 * @param inner - The inner bounding box represented as a tuple [minX, minY, maxX, maxY].
 * @returns A boolean indicating whether the inner bounding box is fully contained within the outer bounding box.
 */
export const isBoundsContains = (outer: TupleBBOX, inner: TupleBBOX): boolean => {
    return (
        inner[0] >= outer[0] &&  // inner.minX >= outer.minX
        inner[1] >= outer[1] &&  // inner.minY >= outer.minY
        inner[2] <= outer[2] &&  // inner.maxX <= outer.maxX
        inner[3] <= outer[3]     // inner.maxY <= outer.maxY
    );
};

/**
 * Calculates the intersection of two bounding boxes (BBOX).
 * If the bounding boxes do not intersect, the function returns `null`.
 *
 * @param bboxA - The first bounding box represented as a tuple [minX, minY, maxX, maxY].
 * @param bboxB - The second bounding box represented as a tuple [minX, minY, maxX, maxY].
 * @returns An object containing:
 *   - `bbox`: The intersection bounding box as a tuple [minX, minY, maxX, maxY].
 *   - `boundingBox`: The intersection bounding box in a different format (converted using `bboxToBounds`).
 *   Returns `null` if there is no intersection.
 */
export const bboxIntersectionPart = (
    bboxA: TupleBBOX,
    bboxB: TupleBBOX
) => {
    const minX = Math.max(bboxA[0], bboxB[0]);
    const minY = Math.max(bboxA[1], bboxB[1]);
    const maxX = Math.min(bboxA[2], bboxB[2]);
    const maxY = Math.min(bboxA[3], bboxB[3]);

    if (maxX < minX || maxY < minY) {
        return null; // No intersection
    }

    const asTupleBox = [minX, minY, maxX, maxY];
    const asBoundingBox = bboxToBounds(asTupleBox);

    return { bbox: asTupleBox as TupleBBOX, boundingBox: asBoundingBox as BoundingBox };
};

/**
 * Converts a bounding box (bbox) into a path represented as an array of coordinate pairs.
 * The path forms a closed loop, starting and ending at the same point.
 *
 * @param bbox - The bounding box to convert. It can be either:
 *   - A `TupleBBOX` (an array of four numbers: [minLng, minLat, maxLng, maxLat]).
 *   - A `BoundingBox` object, which will be converted to a `TupleBBOX` using `boundsToBbox`.
 * 
 * @returns An array of coordinate pairs `[number, number][]` representing the path of the bounding box.
 *          The path includes the four corners of the bounding box and closes the loop by repeating the first point.
 */
export const bboxToPath = (bbox: TupleBBOX | BoundingBox): [number, number][] => {

    // Convert bounds to TupleBBOX if necessary
    if (!Array.isArray(bbox)) {
        bbox = boundsToBbox(bbox);
    }

    // Destructure the bounding box coordinates
    const [minLng, minLat, maxLng, maxLat] = bbox;

    // Create the path as an array of coordinate pairs
    const path = [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat] // close the loop
    ];

    return path as [number, number][];

}
