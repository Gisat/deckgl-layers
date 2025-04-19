import { cogFromFile, cogFromUrl } from '@geoimage/shared/integration/sources.read';
import { beforeAll, describe, expect, it } from 'vitest';
import { useTestCogFile, useTestCogUrl } from '@test/tools/fixtures.cogs';
import GeoTIFF from 'geotiff';
import { CogImage } from '@geoimage/shared/cogs/models.cog';
import { TileMagicXYZ } from '@geoimage/shared/tiles/models.tileMagic';

let testCogFile: GeoTIFF
let testCogSource: GeoTIFF


describe('COG and Tiles loading', () => {

    beforeAll(async () => {
        testCogFile = await cogFromFile(useTestCogFile())
        testCogSource = await cogFromUrl(useTestCogUrl())
    });

    test('XYZ Tile zoom matching', async () => {
        const checkedResolutions = [
            156500,
            78200,
            39100,
            19500,
            9700,
        ]

        const expectedZoomLevels = [0, 1, 2, 3, 4]

        const tileMagic = new TileMagicXYZ(256, 22)
        const check = checkedResolutions.map(resolution => tileMagic.bestZoomLevelForResolution(resolution))

        expect(check).toEqual(expectedZoomLevels)
    });

    test("COG Object", async () => {
        const COG = await CogImage.fromUrl(useTestCogUrl());
        const cogLevel = 0
        const cogLevelResolution = COG.zoomMap.get(cogLevel).zoomResolutionMetersPerPixel
        const xyz = new TileMagicXYZ(256, 22)

        console.log("COG Level Resolution", cogLevelResolution)

        const xyzResolutionForZoom = xyz.bestZoomLevelForResolution(cogLevelResolution)

        console.log("XYZ Level Resolution", xyzResolutionForZoom)

        const checkXYZRes = xyz.resolutionForZoomLevel(xyzResolutionForZoom )
        console.log("XYZ Level Check", checkXYZRes)

        console.log("COG Level", COG.zoomMap.get(cogLevel).tileZoomLevel)
    });

});