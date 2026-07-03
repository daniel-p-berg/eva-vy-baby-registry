import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [{ pathname: "/products/**" }, { pathname: "/payment/**" }],
  },
};

export default nextConfig;
