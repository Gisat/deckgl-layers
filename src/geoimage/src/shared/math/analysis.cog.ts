import { fromUrl } from 'geotiff';
import { CogLayerData } from '@geoimage/shared/types/models.cogs';

/**
 * Analyzes a Cloud Optimized GeoTIFF (COG) image from a URL and extracts its data.
 * 
 * @param url - The URL of the COG image to analyze
 * @param options - Configuration options for the analysis
 * @param options.interleave - Whether to interleave the raster bands. If true, 
 *                             pixels are returned as [R, G, B, R, G, B, ...] 
 *                             instead of separate arrays per band.
 * @param options.band - The band index to read from the TIFF. Default is 0.
 * 
 * @returns A Promise that resolves to a CogLayerData object containing:
 *   - bbox: Bounding box coordinates [west, south, east, north]
 *   - bounds: Array of coordinate pairs forming a closed polygon around the image
 *   - rasters: The pixel data from the image
 *   - width: Width of the image in pixels
 *   - height: Height of the image in pixels
 *   - resX: Resolution in the X direction (units per pixel)
 *   - resY: Resolution in the Y direction (units per pixel)
 *   - bboxPoints: Object with west, south, east, north coordinates
 * 
 * @example
 * const cogData = await AnalyseCogFromUrl('https://example.com/sample.tif');
 * // Access the raster data and geographic information
 * const { rasters, bbox, width, height } = cogData;
 */
export const AnalyseCogFromUrl = async (url: string, options: {
  interleave: boolean
  band: number
} = { band: 0, interleave: false }): Promise<CogLayerData> => {

  const tiff = await fromUrl(url)

  // Get the first image from the TIFF file or can be added index
  // we can have multiple images in a tiff file with different bands
  const firstOfImagesInTiff = await tiff.getImage(options.band)

  // Get the rasters from the image
  // Notice: with { interleave: true }, 
  // instead of getting one array per band (e.g., [Red[], Green[], Blue[]]), 
  // you get a single typed array where pixels are like [R, G, B, R, G, B, ...].
  const rasters = await firstOfImagesInTiff.readRasters({ interleave: options.interleave })
  
  // Returns the top-left geographic coordinate (longitude, latitude or easting/northing depending on projection).
  // This is the "anchor point" for positioning the image on the map.
  const [originX, originY] = firstOfImagesInTiff.getOrigin()

  // Returns how much each pixel represents in real-world units.
  // For example: resX = 0.0001 degrees/pixel = 1 pixel is ~11 meters wide.
  // Note: resY is usually negative, because images are top-down but maps go bottom-up.
  const [resX, resY] = firstOfImagesInTiff.getResolution()

  // Returns the width and height of the image in pixels.
  const width = firstOfImagesInTiff.getWidth()
  const height = firstOfImagesInTiff.getHeight()


  // Convert bounds from array to object form
  const bboxPoints = {
    west: originX, // anchor point top left as X coordinate
    south: originY + (resY * height), // start from top left and go down
    east: originX + resX * width, // start from top left and go right
    north: originY // anchor point top left as Y coordinate
  }

  // The bounding box is a rectangle defined by the coordinates of its corners.
  // The order of the coordinates is important: [west, south, east, north].
  // This is a common format for representing geographic bounding boxes.
  const bbox: [number, number, number, number] = [
    bboxPoints.west,
    bboxPoints.south,
    bboxPoints.east,
    bboxPoints.north
  ]

  // The bounds are the coordinates of the corners of the bounding box.
  // They are represented as an array of points, where each point is a pair of coordinates [longitude, latitude].
  // The order of the points is important: they should form a closed polygon.
  // The first and last points should be the same to close the polygon.
  // This is useful for drawing the bounding box on a map or for other geometric operations.
  const bounds: [number, number][] = [
    [bboxPoints.west, bboxPoints.south],
    [bboxPoints.east, bboxPoints.south],
    [bboxPoints.east, bboxPoints.north],
    [bboxPoints.west, bboxPoints.north],
    [bboxPoints.west, bboxPoints.south]
  ]

  // The result is an object containing all the relevant information about the COG.
  // This includes the bounding box, bounds, width, height, resolutions, and bounding box points.
  // This object can be used for further processing, visualization, or analysis.
  const result: CogLayerData = {
    bbox,
    bounds,
    rasters,
    width,
    height,
    resX,
    resY,
    bboxPoints
  };

  return result
}