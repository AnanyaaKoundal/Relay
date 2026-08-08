import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/s3/**" },
      { pathname: "/thumbnail.avif" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/s3/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/s3/:path*`,
      },
    ];
  },
};

export default nextConfig;
