import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { CogImage } from '@geoimage/cogs/models.cog';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';


describe('COG and Tiles loading', () => {

    test('Resolutions mach with XYZ zoom resolutions', async () => {
        const checkedResolutions = [
            156500,
            78200,
            39100,
            19500,
            9700,
        ]

        const expectedZoomLevels = [0, 1, 2, 3, 4]

        const tileMagic = new TileMagicXYZ(256, 22)
        const check = checkedResolutions.map(resolution => tileMagic.bestZoomLevelForResolution(resolution).zoomLevel)

        expect(check).toEqual(expectedZoomLevels)
    });

    test("COG resolution match with XYZ tiles resolution", async () => {

        console.log("---Cog to XYZ resolution matching---")

        const COG = await CogImage.fromUrl(useTestCogUrl());
        const cogLevel = 0
        const cogLevelResolution = COG.mapCogImageByLevelIndex.get(cogLevel).zoomResolutionMetersPerPixel
        
        console.log("COG Level", cogLevel)
        console.log("COG Level Resolution", cogLevelResolution)

        const xyz = new TileMagicXYZ(256, 22)

        const {zoomLevel, resolution} = xyz.bestZoomLevelForResolution(cogLevelResolution)
        console.log("XYZ Level for cog", zoomLevel)
        console.log("XYZ Resolution for cog", resolution)

        expect(cogLevel).to.be.lt(zoomLevel)
        expect(cogLevelResolution).toEqual(resolution)
    });

    test("XYZ resolutuons match with COG level", async () => {
        console.log("---XYZ to Cog resolution matching---")

        const COG = await CogImage.fromUrl(useTestCogUrl());
        const xyz = new TileMagicXYZ(256, 22)

        const xyzLevel = 10
        const xyzResolution = xyz.tileZoomResolutionMap.get(xyzLevel)
        
        const {resolution: cogResoluion, zoomLevel: imageLevel} = COG.bestZoomLevelForResolution(xyzResolution)

        console.log("XYZ Level", xyzLevel)
        console.log("XYZ Resolution", xyzResolution)
        console.log("COG Level", imageLevel)
        console.log("COG Resolution", cogResoluion)

        expect(xyzLevel).to.be.gt(imageLevel)
        expect(xyzResolution).toEqual(cogResoluion)
    });

    test("XYZ indexes to BBOX", async () => {
        console.log("---XYZ to BBOX---")

        const coordinates: [number, number, number] = [1, 1, 1]

        const xyz = new TileMagicXYZ(256, 22)

        const bbox = xyz.tileXYToMercatorBBox(coordinates)
        
        console.log("TileXYZ to BBOX", bbox)
    });

    test("COG BBOX", async () => {
        console.log("---COG BBOX---")

        const COG = await CogImage.fromUrl(useTestCogUrl());

        const cogMainBbox = COG.mapCogImageByLevelIndex.get(0).bbox

        console.log("COG BBOX", cogMainBbox)
    });

    test("COG Rasters for XYZ", async () => {
        console.log("---COG Rasters---")

        const COG = await CogImage.fromUrl(useTestCogUrl());

        const rasters = await COG.imageForXYZ([44, 24, 6]);

        if (!rasters) {
            throw new Error("No rasters found for the given XYZ coordinates");
        }

        console.log("COG BBOX", rasters.length);

        expect(rasters.length).toBeGreaterThan(0);
    });
    
    test("COG Rasters miss XYZ coordinates", async () => {
        console.log("---COG Rasters---")

        const COG = await CogImage.fromUrl(useTestCogUrl());

        const rasters = await COG.imageForXYZ([43, 20, 6]);

        expect(rasters).toEqual(null)
    });

});