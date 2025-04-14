import { cogFromFile, cogFromUrl } from '@geoimage/shared/integration/sources.read';
import { beforeAll, describe, expect, it } from 'vitest';
import { useTestCogFile, useTestCogUrl } from '@test/tools/fixtures.cogs';
import GeoTIFF from 'geotiff';
import { CogImage } from '@geoimage/shared/cogs/models.cog';

let testCogFile: GeoTIFF
let testCogSource: GeoTIFF

describe('COG loading and analysis', () => {

    beforeAll(async () => {
        testCogFile = await cogFromFile(useTestCogFile())
        testCogSource = await cogFromUrl(useTestCogUrl())
    });

    test('COG from file', async () => {
        const imageCount = await testCogFile.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

    test('COG from URL', async () => {
        const imageCount = await testCogSource.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

    test("Reders COG stats for all files"), async () => {
        const cog = await CogImage.fromUrl(useTestCogUrl());
        cog.describeAllImages({ logToConsole: true });
    }

});