import { sortStringArray } from '@geoimage/shared/helpers/code.formating';
import { cogFromFile } from '@geoimage/shared/integration/sources.read';
import { beforeAll, describe, expect, it } from 'vitest';
import { useTestCogFile } from 'tests/tools/fixtures.files';

let testCogFile: any

describe('COG loading and analysis', () => {

    beforeAll(async () => {
        testCogFile = await cogFromFile(useTestCogFile())

    });

    it('Sorts strings in an array alphabetically', () => {
        const unsortedArray = ['c', 'a', 'b'];
        const sortedArray = sortStringArray(unsortedArray);
        expect(sortedArray).toEqual(['a', 'b', 'c']);
    });
    

    it('Do we have COG from file', async () => {
        const imageCount = await testCogFile.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

});