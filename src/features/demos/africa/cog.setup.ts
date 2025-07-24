import { RenderingDecider, RenderingDeciderKey, renderingDeciderKeyFromScale } from "geoimage-dev";

// URL to the COG image for the demo
export const useAfricaSmallUrl = () => "https://eu-central-1.linodeobjects.com/gisat-data/LUISA_GST-66/app-esaLuisa/prod/v1/rasters/continental/npp_act/openEO_2000-01-01Z_cog.tif"

// Function to create a map for rendering RGBA colors based on pixel values for demo COG

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
export const useAfricaRenderingScaleDecider = ({ debugMode = false }: { debugMode?: boolean }): RenderingDecider => {

    const randomColor = (): [number, number, number, number] => {
        return [
            Math.floor(Math.random() * 255), // Random red value
            Math.floor(Math.random() * 255), // Random green value
            Math.floor(Math.random() * 255), // Random blue value
            170 // Alpha value
        ];
    }

    const decider = new Map<RenderingDeciderKey | "unknown", [number, number, number, number]>();

    if (debugMode) {
        decider.set("unknown", [0, 0, 0, 0]); // Unknown value
    }

    const step = 100; // Step for the scale
    for (let i = 0; i < 3000; i += 100) {
        const key = renderingDeciderKeyFromScale([i, i + step]); // Create a key for the scale
        decider.set(key, randomColor()); // Assign random color to each scale

    }

    return decider;
}