import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dir }) => {
    // Resolve modules from admin-panel only (fixes resolve in parent 'admin' folder)
    config.resolve.modules = [
      path.join(dir, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
