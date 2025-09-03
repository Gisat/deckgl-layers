"use client"

import { CogMap } from "@features/shared/maps/components/CogMap";
import "./kazakhstan.css"
import { useKazakhstanBands, useKazakhstanCogUrl, useKazakhstanRenderingDecider } from "@features/demos/kazakhstan/cog.setup";
import { kazakhstanDefaultMapState } from "@features/demos/kazakhstan/map.defaults";


// is the demo in debug mode?
const IS_DEBUG_MODE = true

// demo page
export default function KazakhstanDemo() {
  return (
	  <CogMap
		  cogUrl={useKazakhstanCogUrl()}
		  renderingDecider={useKazakhstanRenderingDecider({debugMode: IS_DEBUG_MODE})}
		  debugMode={IS_DEBUG_MODE}
		  viewState={kazakhstanDefaultMapState()}
		  band={0}
	  />
  );
}
