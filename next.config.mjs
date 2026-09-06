const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === "true";

/**
 * O GitHub Pages deste repositório serve o site em
 * https://<usuário>.github.io/Mare/ (subpasta "/Mare"), então o basePath só
 * é aplicado no build de deploy do GitHub Pages (ver
 * .github/workflows/deploy-pages.yml). Um `next build` normal (local, ou
 * futuramente na Vercel) continua servindo a partir da raiz.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGithubPagesBuild && {
    output: "export",
    basePath: "/Mare",
    assetPrefix: "/Mare/",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
