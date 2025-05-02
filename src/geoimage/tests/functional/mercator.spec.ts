import { differenceBetweenPointsInMercator } from "@geoimage/shared/helpers/gis.mercator";

describe('Helper functions for mercator projection', () => {

    test('Q1', async () => {
        const origins = [
            [-10, -5],
            [-5, 0],
            [0, 5],
        ]

        const declared = [
            [-5, -0],
            [0, 5],
            [5, 10],
        ]

        const expected = [
            [5, 5],
            [5, 5],
            [5, 5],
        ]

        origins.forEach((origin, index) => {
            const [expectedX, expectedY] = expected[index]

            const [xResult, yResult] = differenceBetweenPointsInMercator(origin as [number, number], declared[index] as [number, number])

            console.log("Result: ", xResult, yResult)
            expect(xResult).toBe(expectedX)
            expect(yResult).toBe(expectedY)
        })
    });

});