"use client"

import React from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/layers.basemaps";
import "../maps.css";

/**
 * CogMap map component (client side)
 * This component is used to render the map with DeckGL
 * It's the DeckGL map wrapper with dynamic DeckGL map size
 * @returns {JSX.Element} Wrapped map component
 */
export const CogMap = () => {
    // list of layers to be rendered
    // TODO: Now its harcoded, but later might be dynamic
    const layers = [
        createOpenstreetMap()
    ];

    return (
        <section className="dgl-MapWrapper">
            <DeckGL
                views={defaultMapView()}
                initialViewState={defaultMapState()}
                layers={layers}
                controller={true}
                width="100%"
                height="100%"
            />
        </section>
    )
}