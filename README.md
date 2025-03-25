# Geoimage NPM (generation 2)
This repository contains source of Geoimage NPM and set of free sandbox demos for NPM ability demonstration.

Folders:
- app: NextJS route structure with demo presentations and data APIs
- features: Components and logic used in demos, but not included in NPM
- geoimage: Final NPM product
- tests: Test scenarios for any peice of code.


## Installation
- Install Node and NPM
- Clone the project and go to the project root
- Go into `/geoimage` and open a terminal there, keep also the root terminal
- Run `npm i` in the package terminal 
- Run `npm run build` or `npm run build:dev` in the package terminal
- Run `npm i` in root terminal
- Create an `.env` file in repository root by sample in `/doc` folder
- Run `npm run dev`in root terminal

## NPM Development

To see how to buid NPM output, please visit `/geoimage` and read `Readme.md` there.

### Dependency managemet
Root and `/geoimage` has separated NPM dependencies (own `package.json`, `tsconfig` etc.)

Changes must be mabe in relevant location:
- Changes for demo -> `/`
- Changes for npm product -> `/geoimage`

Imports into `/app` should be done from `/geoimage/index.ts` or as local NPM install