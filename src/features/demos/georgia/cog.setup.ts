import { RenderingDecider, RenderingDeciderKey } from "geoimage-dev";


// URL to the COG image for the demo
export const useGeorgiaCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/bsadri/test_raster/COG/LC_2021_all_Georgia_WEST3940_ZOOM6_test1_defl_COG256.tif"

// Function to create a map for rendering RGBA colors based on pixel values for demo COG

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
export const useGeorgiaRenderingDecider = ({ debugMode = false }: { debugMode?: boolean }): RenderingDecider => {

    const alpha = 170;

    const randomR = Math.floor(Math.random() * 255);
    const randomG = Math.floor(Math.random() * 255);
    const randomB = Math.floor(Math.random() * 255);

    const decider = new Map<RenderingDeciderKey, [number, number, number, number]>();

    if (debugMode) {
        decider.set("unknown", [randomR, randomG, randomB, alpha]); // Unknown value
        decider.set(0, [0, 0, 0, alpha]); // Empty pixels value
        decider.set(255, [50, 50, 50, alpha]); // Outer box value
    }

    decider.set(11, [255, 232, 117, alpha]);
    decider.set(12, [216, 255, 146, alpha]);
    decider.set(13, [237, 130, 0, alpha]);
    decider.set(22, [0, 150, 40, alpha]);

    return decider;
}