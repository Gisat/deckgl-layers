import { fromFile, fromUrl } from "geotiff";

/**
 * Fetches a GeoTIFF file from a provided URL.
 * 
 * @param url - The URL pointing to a GeoTIFF file. Can be a string or URL object.
 * @returns A Promise that resolves to a GeoTIFF object.
 * 
 * @example
 * ```typescript
 * const geoTiff = await cogFromUrl('https://example.com/image.tiff');
 * // or
 * const geoTiff = await cogFromUrl(new URL('https://example.com/image.tiff'));
 * ```
 */
export const cogFromUrl = async (url: string | URL) => fromUrl(url instanceof URL ? url.toString() : url);

/**
 * Creates a GeoTIFF object from a file path.
 * 
 * This function is an async wrapper around the `fromFile` function
 * that loads a Cloud Optimized GeoTIFF (COG) from the specified file path.
 *
 * @param path - The file path to the GeoTIFF file
 * @returns A Promise that resolves to a GeoTIFF object
 */
export const cogFromFile = async (path: string) => fromFile(path)