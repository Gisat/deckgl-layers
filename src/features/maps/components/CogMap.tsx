import React from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/map.layers.basemaps";

export const CogMap = () => {

    const layers = [
        createOpenstreetMap()
    ]

    return (
        <section className="ptr-mapRender">
            <DeckGL
                views={defaultMapView()}
                initialViewState={defaultMapState()}
                layers={layers}
                style={{ position: "relative", width: "500px", height: "500 px" }}
            >
            </DeckGL>

        </section>
    )
}