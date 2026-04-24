/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@birthday-surprise/shared"],
  // Ensure server-only packages don't leak to client bundle
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk", "stripe"],
  },
  async headers() {
    return [
      {
        source: "/e/:id*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
