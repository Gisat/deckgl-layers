"use client"

import { useGeorgiaBands, useGeorgiaCogUrl, useGeorgiaRenderingDecider } from "@features/demos/georgia/cog.setup";
import { georgiaDefaultMapState } from "@features/demos/georgia/map.defaults";
import { CogMap } from "@features/shared/maps/components/CogMap";
import "./georgia.css"


// is the demo in debug mode?
const IS_DEBUG_MODE = true

// demo page
export default function GeorgiaDemo() {
  return (
      <main className="dgl-georgia-wrapper">
        <CogMap
          cogUrl={useGeorgiaCogUrl()}
          renderingDecider={useGeorgiaRenderingDecider({debugMode: IS_DEBUG_MODE})}
          debugMode={IS_DEBUG_MODE}
          viewState={georgiaDefaultMapState()}
          band={useGeorgiaBands()} 
        />
      </main>
  );
}
