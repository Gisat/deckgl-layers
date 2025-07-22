import { useTestCogUrl, useTestRenderingMapLogic } from "@features/demos/georgia/cog.setup";
import { georgiaDefaultMapState } from "@features/demos/georgia/map.defaults";
import { CogMap } from "@features/shared/maps/components/CogMap";

// is the demo in debug mode?
const IS_DEBUG_MODE = true

// demo page
export default function GeorgiaDemo() {
  return (
      <main>
        <CogMap
          cogUrl={useTestCogUrl()}
          renderLogicMap={useTestRenderingMapLogic({debugMode: IS_DEBUG_MODE})}
          debugMode={IS_DEBUG_MODE}
          viewState={georgiaDefaultMapState()}
        />
      </main>
  );
}
