import { useTestCogUrl, useTestRenderingMapLogic } from "@features/demos/georgia/cog.setup";
import { CogMap } from "@features/maps/components/CogMap";

// is the demo in debug mode?
const IS_DEBUG_MODE = true

// demo page
export default function Home() {
  return (
    <div>
      <main>
        <CogMap
          cogUrl={useTestCogUrl()}
          renderLogicMap={useTestRenderingMapLogic({debugMode: IS_DEBUG_MODE})}
          debugMode={IS_DEBUG_MODE}
        />
      </main>
    </div>
  );
}
