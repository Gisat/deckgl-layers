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
import { RenderByValueDecider } from "@geoimage/shared/helpers/rendering.types";

interface CogMapProps {
    cogUrl: string;
    renderLogicMap: RenderByValueDecider;
    debugMode?: boolean;
}

export const CogMap = ({cogUrl, renderLogicMap, debugMode} : CogMapProps) => {

    // TODO: custom hook?
    const [cogLayer, setCogLayer] = useState<TileLayer | null>(null);
    const [bboxLayer, setBoxLayer] = useState<PathLayer | null>(null);

    useEffect(() => {
        const fetchCog = async () => {

            // Load the COG image from the URL
            const usedCog = await CogDynamicImage.fromUrl(cogUrl);

            // Create the COG layer using the loaded image
            setCogLayer(createCogLayer({
                id: "cog-layer",
                cogImage: usedCog,
                tileSize: 256,
                minZoom: 0,
                maxZoom: 20,
                renderLogicMap,
                debugMode
            }))

            debugMode && setBoxLayer(createBoundingBoxLayer(usedCog.bbox, true))
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