import { useTestCogUrl } from '@test/tools/fixtures.cogs';
import { CogImage } from '@geoimage/cogs/models.cog';
import { TileMagicXYZ } from '@geoimage/tiles/models.tileMagic';
import { convertBoundsToMercator, convertMercatorBoundsToCoordinates } from '@geoimage/shared/helpers/gis.mercator';
import { bboxToBounds } from '@geoimage/shared/helpers/gis.transform';


describe('COG and Tiles loading', () => {

    let COG: CogImage;
    let xyz: TileMagicXYZ;
    
    beforeAll(async () => {
        COG = await CogImage.fromUrl(useTestCogUrl());
        xyz = new TileMagicXYZ(256, 22);
    });

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

        const cogLevel = 0
        const cogLevelResolution = COG.mapCogImageByLevelIndex.get(cogLevel).zoomResolutionMetersPerPixel

        console.log("COG Level", cogLevel)
        console.log("COG Level Resolution", cogLevelResolution)

        const { zoomLevel, resolution } = xyz.bestZoomLevelForResolution(cogLevelResolution)
        console.log("XYZ Level for cog", zoomLevel)
        console.log("XYZ Resolution for cog", resolution)

        expect(cogLevel).to.be.lt(zoomLevel)
        expect(cogLevelResolution).toEqual(resolution)
    });

    test("XYZ resolutuons match with COG level", async () => {
        console.log("---XYZ to Cog resolution matching---")

        const xyzLevel = 10
        const xyzResolution = xyz.tileZoomResolutionMap.get(xyzLevel)

        const { resolution: cogResoluion, zoomLevel: imageLevel } = COG.bestZoomLevelForResolution(xyzResolution)

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

    // test("COG Rasters for XYZ", async () => {
    //     console.log("---COG Rasters---")

    //     const COG = await CogImage.fromUrl(useTestCogUrl());

    //     const rasters = await COG.imageForXYZ([44, 24, 6]);

    //     if (!rasters) {
    //         throw new Error("No rasters found for the given XYZ coordinates");
    //     }
    //     expect(rasters.length).toBeGreaterThan(0);
    // });

    test("COG Rasters XYZ coordinates", async () => {
        console.log("---COG Rasters Match---")

        const bbox = [76.4, 20.0, 98.28, 31.5]
        const bounds = bboxToBounds(bbox)
        const { bbox: mercatorBbox } = convertBoundsToMercator(bounds)

        const rasters = await COG.imageByBoundsForXYZ(2, mercatorBbox);

        const rasterValues = rasters as Float32Array
        // const hasData = rasterValues.some(value => value !== 0 && !isNaN(value));

        // console.log("COG Rasters", rasters)
        // console.log("COG Anyvalue", hasData)

        CogImage.readAllRasterValues(rasters)

        // expect(hasData).toBe(true);

    });
    
    test("COG Rasters miss XYZ coordinates", async () => {
        console.log("---COG Rasters Miss---")

        const bbox = [9.6, 36.1, 31.4, 45.8]

        const bounds = bboxToBounds(bbox)
        const { bbox: mercatorBbox } = convertBoundsToMercator(bounds)


        const rasters = await COG.imageByBoundsForXYZ(8, mercatorBbox);

        const rasterValues = rasters as Float32Array
        const hasData = rasterValues.some(value => value !== 0 && !isNaN(value));

        for (const value of rasterValues) {
            if (value !== 0 && !isNaN(value)) {
                console.log("COG Raster Value", value)
            }
        }

        console.log("COG Rasters", rasters)
        console.log("COG Anyvalue", hasData)


        expect(hasData).toBe(false);

    });

});