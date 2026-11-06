import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Pin the project root: a stray lockfile higher up the folder tree otherwise confuses Next.
  outputFileTracingRoot: process.cwd(),
  // Put every page's title, description and share tags in the <head> for all
  // visitors. By default Next 15 streams them into the body for anything it
  // doesn't recognise as a limited bot, which Bing, social previews and
  // Lighthouse can miss. Metadata here is quick to build, so nothing slows down.
  htmlLimitedBots: /.*/,
  experimental: {
    viewTransition: true,
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
