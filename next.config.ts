import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Permite qualquer domínio HTTPS
      { protocol: 'http', hostname: '**' },  // Permite qualquer domínio HTTP
    ]
  }
};

export default nextConfig;
