import type { MetadataRoute } from "next";

// Fase de testes: nada é indexado.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
