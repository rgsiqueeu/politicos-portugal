/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fase de testes: o site não deve aparecer em motores de busca.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
