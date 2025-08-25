import { RenderingDeciderByScale, RenderingDeciderKey } from "geoimage-dev";

// URL to the COG image for the demo
export const useAfricaUrl = () => "https://eu-central-1.linodeobjects.com/gisat-data/LUISA_GST-66/app-esaLuisa/dev/rasters/continental/npp_act_2000-2020_cog_band.tif"

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
export const useAfricaRenderingScaleDecider = ({ debugMode = false }: { debugMode?: boolean }): RenderingDeciderByScale => {

    const randomColor = (): [number, number, number, number] => {
        return [
            Math.floor(Math.random() * 255), // Random red value
            Math.floor(Math.random() * 255), // Random green value
            Math.floor(Math.random() * 255), // Random blue value
            170 // Alpha value
        ];
    }

    const deciderMap = new Map<RenderingDeciderKey, [number, number, number, number]>();

    deciderMap.set("unknown", [0, 0, 0, 0]); // Unknown value

    const step = 100; // Step for the scale
    for (let scaleBound = 1; scaleBound <= 5000; scaleBound += step) {
        deciderMap.set(scaleBound, randomColor()); // Assign random color to each scale
    }

    const decider = new RenderingDeciderByScale(deciderMap);
    return decider;
}

/**
 * Returns bands for africa demo as an array of numbers
 * @returns 
 */
export const useAfricaBands = () => 2