

/**
 * Special map to decide about render RGBA color by value
 * Key is expected value from COG raster
 * Value is RGBA color (0 - 255)
 */
type RenderByValueDecider = Map<number | "unknown", [number, number, number, number]>

export type {
    RenderByValueDecider
}