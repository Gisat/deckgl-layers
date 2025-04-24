"use client"

import React, { useEffect, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/layers.basemaps";
import "../maps.css";
import { createCogLayer } from "@geoimage/layers/tile.cog";
import { CogImage } from "@geoimage/cogs/models.cog";
import { TileLayer } from "@deck.gl/geo-layers";

const useTestCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/eman/versions/v3/DEM/DEM_COP30_float32_wgs84_deflate_cog_float32.tif"

/**
 * CogMap map component (client side)
 * This component is used to render the map with DeckGL
 * It's the DeckGL map wrapper with dynamic DeckGL map size
 * @returns {JSX.Element} Wrapped map component
 */
export const CogMap = () => {
    // list of layers to be rendered
    // TODO: Now its harcoded, but later might be dynamic

    const [cogLayer, setCogLayer] = useState<TileLayer | null>(null);

    useEffect(() => {
        const fetchCog = async () => {

            // Load the COG image from the URL
            const usedCog = await CogImage.fromUrl(useTestCogUrl());
            
            // Create the COG layer using the loaded image
            setCogLayer(createCogLayer({
                id: "cog-layer",
                cogImage: usedCog,
                tileSize: 256,
                minZoom: 0,
                maxZoom: 20
            }))
        };
        fetchCog();
    }, []);

    return (
        <section className="dgl-MapWrapper">
            <DeckGL
                views={defaultMapView()}
                initialViewState={defaultMapState()}
                layers={
                    [
                        createOpenstreetMap(),
                        cogLayer
                    ]
                }
                controller={true}
                width="100%"
                height="100%"
            />
        </section>
    )
}