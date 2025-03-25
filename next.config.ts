import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.unshift({
      test: /\.(js|ts|tsx)$/,
      include: path.resolve(__dirname, 'src/geoimage'),
      use: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;
