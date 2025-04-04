import { sortStringArray } from '@geoimage/shared/helpers/code.formating';
import { cogFromFile } from '@geoimage/shared/integration/sources.read';
import { describe, expect } from '@jest/globals';
import { useTestCogFile } from 'tests/tools/fixtures.files';

let testCogFile: any

describe('COG loading and analysis', () => {

    beforeAll(async () => {
        testCogFile = await cogFromFile(useTestCogFile())

    });

    test('Sorts strings in an array alphabetically', () => {
        const unsortedArray = ['c', 'a', 'b'];
        const sortedArray = sortStringArray(unsortedArray);
        expect(sortedArray).toEqual(['a', 'b', 'c']);
    });
    

    test('Do we have COG from file', async () => {
        const imageCount = await testCogFile.getImageCount();
        expect(imageCount).toBeGreaterThan(0);
    });

});