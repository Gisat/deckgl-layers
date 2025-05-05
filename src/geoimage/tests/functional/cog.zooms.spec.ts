import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';
import { CogDynamicImage } from '@geoimage/cogs/models.cog';

describe('COG and Tiles zoom synchronisation', () => {

    let COG: CogDynamicImage;
    let xyz: TileMagicXYZ;

    beforeAll(async () => {
        COG = await CogDynamicImage.fromUrl(useTestCogUrl());
        xyz = new TileMagicXYZ(256, 22);
    });

    test('XYZ zooms and levels', async () => {
        const checkedResolutions = [
            156500,
            78200,
            39100,
            19500,
            9700,
        ]

        const expectedZoomLevels = [0, 1, 2, 3, 4]

        const tileMagic = new TileMagicXYZ(256, 22)
        const check = checkedResolutions.map(resolution => tileMagic.bestTileZoomForResolution(resolution).zoomLevel)

        expect(check).toEqual(expectedZoomLevels)
    });

    test("COG level resolution match with XYZ tile resolution", async () => {

        console.log("---Cog to XYZ resolution matching---")

        const cogLevel = 0
        const cogLevelResolution = COG.expectedImageLevelResolution(cogLevel)

        console.log("COG Level", cogLevel)
        console.log("COG Level Resolution", cogLevelResolution)

        const { zoomLevel, resolution } = xyz.bestTileZoomForResolution(cogLevelResolution)
        console.log("XYZ Level for cog", zoomLevel)
        console.log("XYZ Resolution for cog", resolution)

        expect(cogLevel).to.be.lt(zoomLevel)
        expect(cogLevelResolution).toEqual(resolution)
    });

    test("XYZ resolutuons match with COG level", async () => {
        console.log("---XYZ to Cog resolution matching---")

        const xyzLevel = 10
        const xyzResolution = xyz.tileZoomResolutionMap.get(xyzLevel)

        const { imageLevel, imageResolution } = COG.expectedImageForResolution(xyzResolution)

        console.log("XYZ Level", xyzLevel)
        console.log("XYZ Resolution", xyzResolution)
        console.log("COG Level", imageLevel)
        console.log("COG Resolution", imageResolution)

        expect(xyzLevel).to.be.gt(imageLevel)
        expect(xyzResolution).toEqual(imageResolution)
    });

    test("COG origins to tile indexes", async () => {
        console.log("---COG origin to XYZ---")
        const [x, y, z] = xyz.metersToTile(COG.origin[0], COG.origin[1], COG.xyzMainImageZoom)

        expect(x).toEqual(9984)
        expect(y).toEqual(5888)
        expect(z).toEqual(14)

        console.log("COG origin", COG.origin)
        console.log("COG zoom", COG.xyzMainImageZoom)
        console.log("XYZ tile", x, y)
    })

    afterAll(() => {
        COG.close()
    })

});