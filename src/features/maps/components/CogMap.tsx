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

const IS_DEBUG_MODE = true

const useTestCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/bsadri/test_raster/COG/LC_2021_all_Georgia_WEST3940_ZOOM6_test1_defl_COG256.tif"


const useTestRenderingMapLogic = (): RenderByValueDecider => {

    const randomR = Math.floor(Math.random() * 255);
    const randomG = Math.floor(Math.random() * 255);
    const randomB = Math.floor(Math.random() * 255);
    const alpha = 170;

    const decider = new Map<number | "unknown", [number, number, number, number]>();

    if (!IS_DEBUG_MODE) {
        decider.set("unknown", [randomR, randomG, randomB, alpha]); // Unknown value
    }

    decider.set(11, [255, 0, 0, 255]); // Red for 11
    decider.set(12, [0, 255, 0, 255]); // Green for 12
    decider.set(13, [0, 0, 255, 255]); // Blue for 13

    decider.set(0, [0, 0, 0, alpha]); // Empty pixels value
    decider.set(255, [50, 50, 50, alpha]); // Outer box value

    return decider;
}

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
                maxZoom: 20,
                renderLogicMap: useTestRenderingMapLogic(),
                debugMode: IS_DEBUG_MODE
            }))

            IS_DEBUG_MODE && setBoxLayer(createBoundingBoxLayer(usedCog.bbox, true))
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