import type { MetadataRoute } from "next";
import { cameras, isLive, siteConfig } from "@/lib/proxlive-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${siteConfig.url}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    ...cameras.map((camera) => ({
      url: `${siteConfig.url}/camera/${camera.slug}/`,
      lastModified: now,
      // Página de câmera ao vivo muda de conteúdo o tempo todo.
      changeFrequency: isLive(camera)
        ? ("hourly" as const)
        : ("monthly" as const),
      priority: isLive(camera) ? 0.9 : 0.3
    }))
  ];
}
