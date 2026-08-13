import { siteConfig, socialLinks, type Camera } from "./proxlive-data";

type Schema = Record<string, unknown>;

/**
 * Injeta JSON-LD. O Google le esse bloco para gerar rich results —
 * no caso das cameras, o card de video na busca.
 */
export function JsonLd({ data }: { data: Schema }) {
  return (
    <script
      type="application/ld+json"
      // O conteudo vem de dados estaticos do proprio projeto, nao de entrada de usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PROXMON",
    url: siteConfig.url,
    logo: absoluteUrl("/images/brand/proxmon-logo-colorida.png"),
    email: siteConfig.email,
    sameAs: [socialLinks.instagram, socialLinks.whatsapp]
  };
}

export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pt-BR",
    description: siteConfig.description,
    publisher: { "@type": "Organization", name: "PROXMON" }
  };
}

/**
 * VideoObject com `isLiveBroadcast`, que e o schema que o Google usa
 * para marcar resultados como transmissao ao vivo.
 */
export function liveCameraSchema(camera: Camera): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${camera.name} — câmera ao vivo`,
    description: camera.summary,
    thumbnailUrl: [absoluteUrl(camera.image)],
    uploadDate: "2025-01-01T00:00:00-03:00",
    contentUrl: camera.streamUrl,
    embedUrl: absoluteUrl(`/camera/${camera.slug}/`),
    isLiveBroadcast: true,
    isFamilyFriendly: true,
    inLanguage: "pt-BR",
    publication: {
      "@type": "BroadcastEvent",
      isLiveBroadcast: true,
      startDate: "2025-01-01T00:00:00-03:00"
    },
    contentLocation: {
      "@type": "Place",
      name: camera.location,
      geo: {
        "@type": "GeoCoordinates",
        latitude: camera.latitude,
        longitude: camera.longitude
      }
    }
  };
}

export function breadcrumbSchema(camera: Camera): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Câmeras ao vivo",
        item: siteConfig.url
      },
      {
        "@type": "ListItem",
        position: 2,
        name: camera.name,
        item: absoluteUrl(`/camera/${camera.slug}/`)
      }
    ]
  };
}
