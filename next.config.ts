import type { NextConfig } from "next";

module.exports = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
