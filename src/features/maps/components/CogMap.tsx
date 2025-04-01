"use client"

import React, { useRef, useEffect, useState } from "react";
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

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

    // Capture the dimensions of the wrapper and make DeckGL Map flexible by JS
    useEffect(() => {
        if (!wrapperRef.current) return;

        /**
         * Update the dimensions of the DeckGL map
         * @returns {void}
         */
        const updateDimensions = () => {
            if (wrapperRef.current) {
                const { width, height } = wrapperRef.current.getBoundingClientRect();
                setDimensions({ width: `${width}px`, height: `${height}px` });
            }
        };

        // Set dimensions by the wrapper
        // This will be called once when the component mounts
        updateDimensions();

        // Also update when window resizes
        window.addEventListener('resize', updateDimensions);

        // Returning a React cleanup function
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Style that will exactly match the wrapper's dimensions
    const mapStyle = {
        position: 'absolute',
        width: dimensions.width,
        height: dimensions.height,
        top: '0px',
        left: '0px'
    };

    // list of layers to be rendered
    // TODO: Now its harcoded, but later might be dynamic
    const layers = [
        createOpenstreetMap()
    ];

    return (
        <section className="cog-map-wrapper" ref={wrapperRef}>
            <DeckGL
                views={defaultMapView()}
                initialViewState={defaultMapState()}
                layers={layers}
                style={mapStyle}
                controller={true}
                width={dimensions.width}
                height={dimensions.height}
            />
        </section>
    )
}