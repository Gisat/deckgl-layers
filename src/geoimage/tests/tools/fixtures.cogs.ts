import path from "path"

export enum TEST_FILES {
  DEM_COG = 'DEM_COP30_float32_wgs84_deflate_cog_float32.tif',
}

export const useTestCogFile = () => path.join(process.cwd(), "tests", 'fixtures', TEST_FILES.DEM_COG)

export const useTestCogUrl = () => "https://gisat-gis.eu-central-1.linodeobjects.com/eman/versions/v3/DEM/DEM_COP30_float32_wgs84_deflate_cog_float32.tif"