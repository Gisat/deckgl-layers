import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';
import { ReadRasterResult } from 'geotiff';
import { bboxToBounds } from '@geoimage/shared/gis/gis.bbox';


describe('COG Georgia Rasters for tiles', () => {

    let COG: CogDynamicImage;
    let xyz: TileMagicXYZ;

    beforeAll(async () => {
        COG = await CogDynamicImage.fromUrl(useTestCogUrl());
        xyz = new TileMagicXYZ(256, 22);
    });

    test("COG Rasters for Georgia COG", async () => {
        const georgia = [39.9859, 41.0550, 46.6981, 43.5866] // from XYZ layer
        const asBounds = bboxToBounds(georgia) // from XYZ layer
        const tileZoom = 7 // from XYZ layer

        const rasters: ReadRasterResult = await COG.imageByBoundsForXYZ({
            zoom: tileZoom,
            boundOfTheTile: asBounds,
            tileSize: xyz.tileSize,
        });

        const { height, width } = rasters;

        expect(height).toBe(256);
        expect(width).toBe(256);

    });

    test("COG Rasters miss Georgia bbox", async () => {
        const georgiaIsNotThere = [5.9559, 45.818, 10.4921, 47.8084] // ..nope, here is swisserland
        const asBounds = bboxToBounds(georgiaIsNotThere) // from XYZ layer
        const tileZoom = 7 // from XYZ layer

        const rasters: ReadRasterResult = await COG.imageByBoundsForXYZ({
            zoom: tileZoom,
            boundOfTheTile: asBounds,
            tileSize: xyz.tileSize,
        });

        expect(rasters).toBeNull()

    });

    test("Georgia, but zoom is wrong", async () => {
        const georgia = [39.9859, 41.0550, 46.6981, 43.5866] // from XYZ layer
        const asBounds = bboxToBounds(georgia) // from XYZ layer
        const tileZoom = 1 // nope, there is no image for such zoom

        const rasters: ReadRasterResult = await COG.imageByBoundsForXYZ({
            zoom: tileZoom,
            boundOfTheTile: asBounds,
            tileSize: xyz.tileSize,
        });

        expect(rasters).toBeNull()

    });


    afterAll(() => {
        COG.close()
    })

});