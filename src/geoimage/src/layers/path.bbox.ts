import { PathLayer } from '@deck.gl/layers';
import { convertMercatorBoundsToCoordinates } from '@geoimage/shared/helpers/gis.mercator';
import { bboxToPath } from '@geoimage/shared/helpers/gis.transform';
import { BoundingBox, TupleBBOX } from '@geoimage/shared/helpers/gis.types';

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