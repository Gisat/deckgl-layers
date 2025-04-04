import path from "path"

export enum TEST_FILES {
  DEM_COG = 'test_image.jpg',
}

export const useTestCogFile = () => path.join(__dirname, '..', '..', 'fixtures', TEST_FILES.DEM_COG)