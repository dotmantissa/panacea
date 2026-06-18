/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore optional client side peer dependencies that cause webpack errors
      config.externals.push(
        '@stripe/crypto',
        '@farcaster/mini-app-solana'
      );
    }
    return config;
  },
};

export default nextConfig;
