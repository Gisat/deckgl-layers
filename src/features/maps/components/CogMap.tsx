"use client"

import React from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/map.layers.basemaps";

export const CogMap = () => {

    const layers = [
        createOpenstreetMap()
    ]

    return (
        <section className="cog-map">
            <DeckGL
                views={defaultMapView()}
                initialViewState={defaultMapState()}
                layers={layers}
                style={{ width: "100vw", height: "50vh", display: "flex" }}
                controller={true}
            >
            </DeckGL>

        </section>
    )
}