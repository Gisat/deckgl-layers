

/**
 * Special map to decide about render RGBA color by value
 * Key is expected value from COG raster
 * Value is RGBA color (0 - 255)
 */
type RenderByValueDecider = Map<number | "unknown", D4>

type D2 = [number, number]
type D3 = [number, number, number]
type D4 = [number, number, number, number]

export type {
    D2,
    D3,
    D4,
    RenderByValueDecider
}