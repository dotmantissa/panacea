/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore optional client side peer dependencies that cause webpack errors by mapping them to null
      config.externals.push({
        '@stripe/crypto': 'null',
        '@farcaster/mini-app-solana': 'null',
      });
    }
    return config;
  },
};

export default nextConfig;
