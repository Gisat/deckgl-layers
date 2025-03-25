import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'index.ts',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.module, format: 'esm', sourcemap: true }
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    'react', 'react-dom'
  ],
  plugins: [
    json(),
    postcss({
      extract: true, // or false to inline styles
      modules: true, // if you use CSS modules
      minimize: true,
      sourceMap: true
    }),
    resolve({ extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'] }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' })
  ]
};
