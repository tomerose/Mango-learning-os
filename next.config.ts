import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // V1 → V2 重定向 (301)
  async redirects() {
    return [
      { source: "/dashboard", destination: "/hub", permanent: true },
      { source: "/ai-tutor", destination: "/agent", permanent: true },
      { source: "/ai-tutor/:path*", destination: "/agent", permanent: true },
      { source: "/study-planner", destination: "/planner", permanent: true },
      { source: "/knowledge-hub", destination: "/agent", permanent: true },
      { source: "/knowledge-hub/:path*", destination: "/agent", permanent: true },
      { source: "/knowledge-tree", destination: "/agent", permanent: true },
      { source: "/knowledge-tree/:path*", destination: "/agent", permanent: true },
      { source: "/exam-mode", destination: "/pack", permanent: true },
      { source: "/exam-mode/:path*", destination: "/pack", permanent: true },
      { source: "/exam-master", destination: "/pack", permanent: true },
      { source: "/exam-master/:path*", destination: "/pack", permanent: true },
      { source: "/exam", destination: "/pack", permanent: true },
      { source: "/exam/:path*", destination: "/pack", permanent: true },
      { source: "/mind-garden", destination: "/grow", permanent: true },
      { source: "/mind-garden/:path*", destination: "/grow", permanent: true },
      { source: "/mind", destination: "/grow", permanent: true },
      { source: "/mind/:path*", destination: "/grow", permanent: true },
      { source: "/projects", destination: "/grow", permanent: true },
      { source: "/projects/:path*", destination: "/grow", permanent: true },
      { source: "/mango-dna", destination: "/dna", permanent: true },
      { source: "/mango-dna/:path*", destination: "/dna", permanent: true },
      { source: "/analytics", destination: "/hub", permanent: true },
      { source: "/analytics/:path*", destination: "/hub", permanent: true },
    ];
  },
};

export default nextConfig;
