import { resolve as _resolve } from 'path';

export const entry = './src/index.ts';
export const mode = 'production';
export const moduleRules = {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        
    ]
};
export const resolve = {
    extensions: ['.tsx', '.ts', '.js'],
};
export const output = {
    filename: 'index.js',
    path: _resolve(__dirname, 'dist'),
    library: {
        type: 'umd',
    },
    clean: true,
};
export const externals = {
    react: 'react',
    'react-dom': 'react-dom',
};