import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';
import { convertBoundsToMercator } from '@geoimage/shared/helpers/gis.mercator';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';
import { bboxToBounds } from '@geoimage/shared/helpers/gis.transform';
import { ReadRasterResult } from 'geotiff';


describe('COG Georgia Rasters for tiles', () => {

    let COG: CogDynamicImage;
    let xyz: TileMagicXYZ;

    beforeAll(async () => {
        COG = await CogDynamicImage.fromUrl(useTestCogUrl());
        xyz = new TileMagicXYZ(256, 22);
    });

    test("COG Rasters for Georgia COG", async () => {
        const georgia = [39.9859, 41.0550, 46.6981, 43.5866]
        const asBounds = bboxToBounds(georgia)
        const { bbox } = convertBoundsToMercator(asBounds)
        const tileZoom = 7

        console.log("Projection: ", COG.projection)
        console.log("Bounds: ", COG.bounds)
        console.log("Origin: ", COG.origin)

        const rasters: ReadRasterResult = await COG.imageByBoundsForXYZ(tileZoom, bbox);

        const { height, width } = rasters;

        expect(height).toBe(256);
        expect(width).toBe(256);

    });

    test("COG Rasters for Georgia Miss BBOX", async () => {
        const georgia = [5.9559, 45.818, 10.4921, 47.8084] // ..nope, here is swisserland
        const asBounds = bboxToBounds(georgia)
        const { bbox } = convertBoundsToMercator(asBounds)
        const tileZoom = 7

        const rasters = await COG.imageByBoundsForXYZ(tileZoom, bbox);

        expect(rasters).toBeNull()

    });

    test("COG Rasters for Georgia Miss Zoom", async () => {
        const georgia = [39.9859, 41.0550, 46.6981, 43.5866]
        const asBounds = bboxToBounds(georgia)
        const { bbox } = convertBoundsToMercator(asBounds)
        const tileZoom = 2 // ..nope, too far from the COG

        const rasters = await COG.imageByBoundsForXYZ(tileZoom, bbox);

        expect(rasters).toBeNull()

    });


    afterAll(() => {
        COG.close()
    })

});