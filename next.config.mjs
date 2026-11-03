// BASE_PATH permite rodar em outro repositório ou domínio sem mexer no código.
const basePath = process.env.BASE_PATH ?? "/radar-olimpico";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};

export default nextConfig;
