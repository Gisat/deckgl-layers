import resolve from '@rollup/plugin-node-resolve'; // Resolves node_modules imports
import typescript from '@rollup/plugin-typescript'; // Compiles TypeScript files
import json from '@rollup/plugin-json'; // Allows importing JSON files
import commonjs from '@rollup/plugin-commonjs'; // Converts CommonJS modules to ES6
import postcss from 'rollup-plugin-postcss'; // Processes CSS files

import { createRequire } from 'module'; // Enables using require in ES modules

const require = createRequire(import.meta.url); // Creates a require function
const pkg = require('./package.json'); // Loads package.json for configuration

export default {
  input: 'index.ts', // Entry point of the library
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true, inlineDynamicImports: true }, // CommonJS output
    { file: pkg.module, format: 'esm', sourcemap: true, inlineDynamicImports: true } // ES module output
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}) // Excludes peer dependencies from the bundle
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}), // Excludes peer dependencies from the bundle
    './jest.config.js' // Add the file path you want to exclude from bundling
  ],
  plugins: [
    json(), // Enables JSON imports
    postcss({
      extract: true, // Extracts CSS into a separate file
      modules: true, // Enables CSS modules
      minimize: true, // Minifies CSS
      sourceMap: true // Generates source maps for CSS
    }),
    resolve({ extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'] }), // Resolves file extensions
    commonjs(), // Converts CommonJS to ES6
    typescript({ tsconfig: './tsconfig.json' }) // Uses the specified TypeScript configuration
  ]
};
