"use client"

import React, { useEffect, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { defaultMapState, defaultMapView } from "../logic/map.defaults";
import { createOpenstreetMap } from "../logic/layers.basemaps";
import "../maps.css";
import { createCogLayer } from "@geoimage/layers/tile.cog";
import { TileLayer } from "@deck.gl/geo-layers";
import { CogDynamicImage } from "@geoimage/cogs/models.cog";
import { PathLayer } from "@deck.gl/layers";
import { createBoundingBoxLayer } from "@geoimage/layers/path.bbox";

export const useTestCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/bsadri/test_raster/COG/LC_2021_all_Georgia_WEST3940_ZOOM6_test1_defl_COG256.tif"
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
    const [bboxLayer, setBoxLayer] = useState<PathLayer | null>(null);

    useEffect(() => {
        const fetchCog = async () => {

            // Load the COG image from the URL
            const usedCog = await CogDynamicImage.fromUrl(useTestCogUrl());
            
            // Create the COG layer using the loaded image
            setCogLayer(createCogLayer({
                id: "cog-layer",
                cogImage: usedCog,
                tileSize: 256,
                minZoom: 0,
                maxZoom: 20
            }))

            setBoxLayer(createBoundingBoxLayer(usedCog.bbox, true))
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
                        cogLayer, 
                        bboxLayer
                    ]
                }
                controller={true}
                width="100%"
                height="100%"
            />
        </section>
    )
}