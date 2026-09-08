const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: isGithubActions ? '/puffy-3d-ecom' : '',
  assetPrefix: isGithubActions ? '/puffy-3d-ecom' : '',
  images: {
    unoptimized: true,
  },
  turbopack: {},
};

export default nextConfig;
