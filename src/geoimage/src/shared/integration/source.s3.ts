

/**
 * Fetches and retrieves a Cloud Optimized GeoTIFF (COG) from a public URL.
 * 
 * This function makes a GET request to the specified URL, expecting a binary response.
 * Upon successful retrieval, it creates a local object URL that can be used to access
 * the image data.
 * 
 * @param url - The URL of the public COG file to be fetched
 * @returns A Promise that resolves to an object containing the object URL for the fetched image blob
 *          and a cleanup function to revoke the object URL when it is no longer needed.
 * @throws Will throw an error if the fetch operation fails with details of the failure
 */
export const fetchForPublicImageSourceCOG = async (url: string) => {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/octet-stream",
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch COG: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Return the object URL along with a cleanup function
    return {
        objectUrl,
        cleanup: () => URL.revokeObjectURL(objectUrl),
    };
}