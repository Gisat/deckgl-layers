import { RenderingDeciderKey, RenderingDeciderByValue } from "geoimage-dev";

// URL to the COG image for the demo
export const useKazakhstanCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/bsadri/test_raster/COG/LC_2021_all_Georgia_WEST3940_ZOOM6_test1_defl_COG256.tif"

// Function to create a map for rendering RGBA colors based on pixel values for demo COG

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
export const useKazakhstanRenderingDecider = ({ debugMode = false }: { debugMode?: boolean }): RenderingDeciderByValue => {

    const alpha = 170;

    const randomR = Math.floor(Math.random() * 255);
    const randomG = Math.floor(Math.random() * 255);
    const randomB = Math.floor(Math.random() * 255);

    const deciderMap = new Map<RenderingDeciderKey, [number, number, number, number]>();

    if (debugMode) {
        deciderMap.set("unknown", [randomR, randomG, randomB, alpha]); // Unknown value
        deciderMap.set(0, [0, 0, 0, alpha]); // Empty pixels value
        deciderMap.set(255, [50, 50, 50, alpha]); // Outer box value
    }

    deciderMap.set(11, [255, 232, 117, alpha]);
    deciderMap.set(12, [216, 255, 146, alpha]);
    deciderMap.set(13, [237, 130, 0, alpha]);
    deciderMap.set(20, [0, 150, 40, alpha]);
    deciderMap.set(21, [0, 150, 40, alpha]);
    deciderMap.set(22, [0, 150, 40, alpha]);
    deciderMap.set(23, [0, 150, 40, alpha]);
    deciderMap.set(24, [0, 150, 40, alpha]);

    const decider = new RenderingDeciderByValue(deciderMap);
    return decider;
}

/**
 * Returns bands for georgia demo as an array of numbers
 * @returns 
 */
export const useKazakhstanBands = () => 0