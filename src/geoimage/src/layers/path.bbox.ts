import { PathLayer } from '@deck.gl/layers';
import { convertMercatorBoundsToCoordinates } from '@geoimage/shared/helpers/gis.mercator';
import { bboxToPath } from '@geoimage/shared/helpers/gis.bbox';
import { BoundingBox, TupleBBOX } from '@geoimage/shared/helpers/gis.types';

/**
 * Layer to draw a bounding box on the map
 * @param bounds // Bounding box coordinates
 * @param isInMeters // Optional: Are coordinates are in meters
 * @returns 
 */
export const createBoundingBoxLayer = (bounds: TupleBBOX | BoundingBox, isInMeters = false) => {

    const bboxLonLat = isInMeters && convertMercatorBoundsToCoordinates(bounds).bbox;

    const path = bboxToPath(bboxLonLat);

    return new PathLayer({
        id: 'bbox-path-layer',
        data: [{
            path: path
        }],
        getPath: d => d.path,
        getColor: [0, 0, 255], // blue outline
        widthMinPixels: 2,
        pickable: false,
    })
}