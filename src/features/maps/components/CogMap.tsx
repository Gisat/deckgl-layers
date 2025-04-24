"use client"

import React from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/layers.basemaps";
import { createCogLayer } from "@geoimage/layers/tile.cog"
import "../maps.css";

/**
 * CogMap map component (client side)
 * This component is used to render the map with DeckGL
 * It's the DeckGL map wrapper with dynamic DeckGL map size
 * @returns {JSX.Element} Wrapped map component
 */
export const CogMap = async () => {
    // list of layers to be rendered
    // TODO: Now its harcoded, but later might be dynamic

    const cogImage = await createCogLayer({
        id: "cog-layer", 
        url: "https://gisat-gis.eu-central-1.linodeobjects.com/eman/versions/v3/DEM/DEM_COP30_float32_wgs84_deflate_cog_float32.tif"
    })

    const layers = [
        createOpenstreetMap(),
        cogImage
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