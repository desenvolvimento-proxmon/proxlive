/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    // As miniaturas sao geradas na VPS a partir das proprias transmissoes,
    // entao ficam sempre atuais em vez de congeladas no repositorio.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stream.proxlive.com.br",
        pathname: "/thumbs/**"
      }
    ]
  },
  trailingSlash: true,
};

export default nextConfig;
