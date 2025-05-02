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

export const isBoundsContains = (outer: TupleBBOX, inner: TupleBBOX): boolean => {
    return (
        inner[0] >= outer[0] &&  // inner.minX >= outer.minX
        inner[1] >= outer[1] &&  // inner.minY >= outer.minY
        inner[2] <= outer[2] &&  // inner.maxX <= outer.maxX
        inner[3] <= outer[3]     // inner.maxY <= outer.maxY
    );
};

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

export const bboxToPath = (bbox: TupleBBOX | BoundingBox): [number, number][] => {

    if (!Array.isArray(bbox)) {
        bbox = boundsToBbox(bbox);
    }

    const [minLng, minLat, maxLng, maxLat] = bbox;

    const path = [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat] // close the loop
    ];

    return path as [number, number][];

}
