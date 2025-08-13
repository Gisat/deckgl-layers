import "../africa.css"

import { CogMap } from "@features/shared/maps/components/CogMap";
import { useAfricaRenderingScaleDecider, useAfricaSmallUrl } from "@features/demos/africa/cog.setup";
import { useAfricaMapDefaults } from "@features/demos/africa/map.defaults";

// is the demo in debug mode?
const IS_DEBUG_MODE = false

// demo page
export default function AfricaSmallDemo() {
  return (
      <main>
        <CogMap
          cogUrl={useAfricaSmallUrl()}
          renderingDecider={useAfricaRenderingScaleDecider({debugMode: IS_DEBUG_MODE})}
          debugMode={IS_DEBUG_MODE}
          viewState={useAfricaMapDefaults()}
        />
      </main>
  );
}
