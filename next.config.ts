import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [
      { pathname: "/products/**" },
      { pathname: "/payment/**" },
      { pathname: "/story/**" },
    ],
  },
};

export default nextConfig;
