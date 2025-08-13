"use client"

import React, { useEffect, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { createOpenstreetMap } from "@features/shared/maps/layers/layers.basemaps";
import "../maps.css";
import { TileLayer } from "@deck.gl/geo-layers";
import { PathLayer } from "@deck.gl/layers";
import { RenderingDecider, CogDynamicImage, createCogLayer, createBoundingBoxLayer } from "geoimage-dev";
import { MapViewState } from "@deck.gl/core";
import { defaultMapView } from "@features/shared/setup/defaults.view";

interface CogMapProps {
    cogUrl: string;
    renderingDecider: RenderingDecider;
    viewState: MapViewState;
    debugMode?: boolean;
}

export const CogMap = ({cogUrl, renderingDecider, debugMode, viewState} : CogMapProps) => {

    // TODO: custom hook?
    const [cogLayer, setCogLayer] = useState<TileLayer | null>(null);
    const [bboxLayer, setBoxLayer] = useState<PathLayer | null>(null);

    useEffect(() => {
        const fetchCog = async () => {

            // Load the COG image from the URL
            const dynamicCog = await CogDynamicImage.fromUrl(cogUrl);

            // Create the COG layer using the loaded image
            const cogLayer = createCogLayer({
                id: "cog-layer",
                cogImage: dynamicCog,
                renderingDecider,
                debugMode,
                maxZoom: 30,
                minZoom: 0,
                tileSize: 256,
            });
            setCogLayer(cogLayer);

            // Create bbox layer to see image bounds in debug mode
            if (debugMode) 
                setBoxLayer(createBoundingBoxLayer(dynamicCog.bbox, true))

            };
        fetchCog();
    }, []);

    return (
        <section className="dgl-MapWrapper">
            <DeckGL
                views={defaultMapView()}
                initialViewState={viewState}
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