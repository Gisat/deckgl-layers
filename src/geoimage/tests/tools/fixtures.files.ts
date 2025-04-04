import path from "path"

export enum TEST_FILES {
  DEM_COG = 'DEM_COP30_float32_wgs84_deflate_cog_float32.tif',
}

export const useTestCogFile = () => path.join(process.cwd(), "tests", 'fixtures', TEST_FILES.DEM_COG)