import { cogFromFile, cogFromUrl } from '@geoimage/shared/integration/sources.read';
import { beforeAll, describe, expect, it } from 'vitest';
import { useTestCogFile, useTestCogUrl } from '@test/tools/fixtures.cogs';
import GeoTIFF from 'geotiff';

let testCogFile: GeoTIFF
let testCogSource: GeoTIFF

describe('COG loading and analysis', () => {

    beforeAll(async () => {
        testCogFile = await cogFromFile(useTestCogFile())
        testCogSource = await cogFromUrl(useTestCogUrl())

    });

    it('COG from file', async () => {
        const imageCount = await testCogFile.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

    it('COG from URL', async () => {
        const imageCount = await testCogSource.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

});