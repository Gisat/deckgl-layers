import { RenderingDeciderKey, RenderingDeciderByValue } from "geoimage-dev";

// URL to the COG image for the demo
export const useKazakhstanCogUrl = () => "https://eu-central-1.linodeobjects.com/gisat-data/3DFlusCCN_GST-93/project/data_cog/WorldCereals/3857_17135_tc-maize-main_activecropland_2021-04-20_2021-10-06_classification.tif"

// Function to create a map for rendering RGBA colors based on pixel values for demo COG

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
export const useKazakhstanRenderingDecider = ({ debugMode = false }: { debugMode?: boolean }): RenderingDeciderByValue => {

    const alpha = 0;
    const deciderMap = new Map<RenderingDeciderKey, [number, number, number, number]>();

    if (debugMode) {
        deciderMap.set("unknown", [0, 0, 0, 20]); // Unknown value
    }
    deciderMap.set(0, [255, 0, 0, alpha]);
    deciderMap.set(100, [0, 255, 0, alpha]);
    deciderMap.set(255, [0, 0, 255, alpha]);

    const decider = new RenderingDeciderByValue(deciderMap);
    return decider;
}

/**
 * Returns bands for georgia demo as an array of numbers
 * @returns 
 */
export const useKazakhstanBands = () => 0