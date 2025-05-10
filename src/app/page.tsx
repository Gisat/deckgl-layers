import { CogMap } from "@features/maps/components/CogMap";
import { RenderByValueDecider } from "@geoimage/shared/rendering/rendering.types";

// is the demo in debug mode?
const IS_DEBUG_MODE = true

// URL to the COG image for the demo
const useTestCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/bsadri/test_raster/COG/LC_2021_all_Georgia_WEST3940_ZOOM6_test1_defl_COG256.tif"

// Function to create a map for rendering RGBA colors based on pixel values for demo COG

// TODO: more precise styling for later (maybe some specific demo, like specified data with color palethe?)
const useTestRenderingMapLogic = (): RenderByValueDecider => {

    const randomR = Math.floor(Math.random() * 255);
    const randomG = Math.floor(Math.random() * 255);
    const randomB = Math.floor(Math.random() * 255);
    const alpha = 170;

    const decider = new Map<number | "unknown", [number, number, number, number]>();

    if (IS_DEBUG_MODE) {
        decider.set("unknown", [randomR, randomG, randomB, alpha]); // Unknown value
        decider.set(0, [0, 0, 0, alpha]); // Empty pixels value
        decider.set(255, [50, 50, 50, alpha]); // Outer box value
    }

    decider.set(11, [255, 0, 0, 255]); // Red for 11
    decider.set(12, [0, 255, 0, 255]); // Green for 12
    decider.set(13, [0, 0, 255, 255]); // Blue for 13

    return decider;
}

// demo page
export default function Home() {
  return (
    <div>
      <main>
        <CogMap
          cogUrl={useTestCogUrl()}
          renderLogicMap={useTestRenderingMapLogic()}
          debugMode={IS_DEBUG_MODE}
        />
      </main>
    </div>
  );
}
