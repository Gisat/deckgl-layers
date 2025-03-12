import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration = {
  mode: 'production',
  entry: './index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
    },
    clean: true,
  },
  externals: {
    '@deck.gl/core': '@deck.gl/core',
    '@deck.gl/layers': '@deck.gl/layers',
  },
};

export default config;