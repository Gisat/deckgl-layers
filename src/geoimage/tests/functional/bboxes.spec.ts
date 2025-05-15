import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';
import { convertMercatorBoundsToCoordinates } from '@geoimage/shared/gis/gis.mercator';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';

describe('BBoxes of the COG and XYZ operations', () => {

    let COG: CogDynamicImage;
    let xyz: TileMagicXYZ;
    
    beforeAll(async () => {
        COG = await CogDynamicImage.fromUrl(useTestCogUrl());
        xyz = new TileMagicXYZ(256, 22);
    });


    test("XYZ indexes to BBOX", async () => {
        console.log("---XYZ to BBOX---")

        const coordinates: [number, number, number] = [1, 1, 1]

        const bbox = xyz.tileXYToMercatorBBox(coordinates)

        console.log("TileXYZ to BBOX", bbox)
    });

    test("COG BBOX", async () => {
        console.log("---COG BBOX---")

        console.log("COG BBOX", COG.bbox)
        console.log("COG BBOX", COG.bounds)

        const { bbox, bounds } = convertMercatorBoundsToCoordinates(COG.bounds)

        console.log("COG Transformed BBOX", bbox)
        console.log("COG Transformed BBOX", bounds)
    });

    afterAll(() => {
        COG.close()
    })

});