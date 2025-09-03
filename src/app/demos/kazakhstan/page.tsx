"use client"

import { useGeorgiaBands, useGeorgiaCogUrl, useGeorgiaRenderingDecider } from "@features/demos/georgia/cog.setup";
import { georgiaDefaultMapState } from "@features/demos/georgia/map.defaults";
import { CogMap } from "@features/shared/maps/components/CogMap";
import "./kazakhstan.css"
import { useKazakhstanBands, useKazakhstanCogUrl, useKazakhstanRenderingDecider } from "@features/demos/kazakhstan/cog.setup";


// is the demo in debug mode?
const IS_DEBUG_MODE = true

// demo page
export default function KazakhstanDemo() {
  return (
	  <CogMap
		  cogUrl={useKazakhstanCogUrl()}
		  renderingDecider={useKazakhstanRenderingDecider({debugMode: IS_DEBUG_MODE})}
		  debugMode={IS_DEBUG_MODE}
		  viewState={georgiaDefaultMapState()}
		  band={useKazakhstanBands()}
	  />
  );
}
