export const PRIMARY_BLUE = "#0072ff";

export const whatsappUrl = "https://wa.me/5549920048536";

export const socialLinks = {
  whatsapp: whatsappUrl,
  instagram: "https://www.instagram.com/proxmon_tec"
};

export const siteConfig = {
  name: "PROXLIVE",
  url: "https://proxlive.com.br",
  description:
    "Assista de graça às câmeras ao vivo do PROXLIVE e veja em tempo real o trânsito na Ponte da Amizade, entre Foz do Iguaçu e Ciudad del Este, antes de sair de casa.",
  ogImage: "https://stream.proxlive.com.br/thumbs/autodromo-pano.jpg",
  email: "atendimento@proxmon.com.br"
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  cornerLogoText?: string;
  cornerLogoImage?: string;
  cornerLogoAlt?: string;
};

export type Camera = {
  id: string;
  slug: string;
  name: string;
  location: string;
  /** Cidade curta, usada em chips e filtros. */
  city: string;
  /** Categoria curta, usada em chips e filtros. */
  category: string;
  description: string;
  /** Resumo de uma linha para meta description e cards. */
  summary: string;
  image: string;
  streamUrl?: string;
  latitude: number;
  longitude: number;
};

/** Criativo de anúncio, comum aos formatos horizontal e lateral. */
export type AdCreative = {
  id: string;
  title: string;
  image?: string;
  logoText?: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
  /** Nome do anunciante, usado no relatório de impressões e cliques. */
  advertiser?: string;
};

export type HorizontalAd = AdCreative;
export type SideAd = AdCreative;

export type SoftwareSection = {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "SOFTWARE DE ANALÍTICO DE VÍDEOS COM IA",
    subtitle:
      "Nosso software de analíticos de vídeo transforma um sistema de câmeras convencional em uma solução inteligente com IA.",
    image: "/images/hero/banners1.png",
    buttonText: "Fale no WhatsApp",
    buttonUrl: whatsappUrl,
    cornerLogoImage: "/images/brand/proxvision-logo.png",
    cornerLogoAlt: "PROXVISION"
  },
  {
    id: "2",
    title: "SISTEMA COMPLETO PARA GESTÃO CONDOMINIAL",
    subtitle: "Aplicativo para condomínios com mais de 30 funcionalidades.",
    image: "/images/hero/banners2.png",
    buttonText: "Fale no WhatsApp",
    buttonUrl: whatsappUrl,
    cornerLogoImage: "/images/brand/proxcond-logo.png",
    cornerLogoAlt: "PROXCOND"
  }
];


export const cameras: Camera[] = [
  {
    id: "3",
    slug: "autodromo-ptz",
    name: "Autódromo PTZ",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Lente móvel do autódromo de Chapecó, ao vivo.",
    description: `Câmera com lente móvel instalada no Autódromo de Chapecó.

Acompanhe ao vivo a movimentação na pista.`,
    image: "https://stream.proxlive.com.br/thumbs/autodromo-fixa.jpg",
    streamUrl: "https://stream.proxlive.com.br/autodromo-fixa/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  },
  {
    id: "4",
    slug: "autodromo-panoramica",
    name: "Autódromo Panorâmica",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Visão panorâmica do autódromo de Chapecó, ao vivo.",
    description: `Câmera panorâmica instalada no Autódromo de Chapecó.

A lente grande-angular cobre uma faixa ampla da pista num único enquadramento.`,
    image: "https://stream.proxlive.com.br/thumbs/autodromo-pano.jpg",
    streamUrl: "https://stream.proxlive.com.br/autodromo-pano/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  }
];

export const horizontalAds: AdCreative[] = [
  {
    id: "5",
    title: "MHnet Telecom",
    image: "/images/ads/banner-mhnet.png",
    backgroundColor: PRIMARY_BLUE,
    textColor: "#ffffff",
    link: "https://mhnet.com.br",
    advertiser: "MHnet"
  }
];

export const sideAds: AdCreative[] = [
  {
    id: "6",
    title: "Assinatura de câmeras",
    image: "/images/ads/side-ad-1.png",
    backgroundColor: "#051f44",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "7",
    title: "Eletros Digital Security",
    image: "/images/ads/side-ad-2.png",
    backgroundColor: "#2b90a4",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "8",
    title: "PROX Parking",
    image: "/images/ads/side-ad-3.png",
    backgroundColor: "#ff3131",
    textColor: "#ffffff",
    link: "https://www.proxmon.com.br/proxparking",
    advertiser: "PROXMON"
  }
];

export const cameraDetailHorizontalAd: AdCreative = {
    id: "9",
  title: "MHnet Telecom",
  image: "/images/ads/banner-mhnet.png",
  backgroundColor: PRIMARY_BLUE,
  textColor: "#ffffff",
  link: "https://mhnet.com.br",
  advertiser: "MHnet"
};

/** Coluna lateral da página de câmera, ao lado da descrição. */
export const cameraDetailSideAds: AdCreative[] = [
  {
    id: "10",
    title: "Eletros Digital Security",
    image: "/images/ads/side-ad-4.png",
    backgroundColor: "#051f44",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "11",
    title: "PROX Parking",
    image: "/images/ads/side-ad-3.png",
    backgroundColor: "#ff3131",
    textColor: "#ffffff",
    link: "https://www.proxmon.com.br/proxparking",
    advertiser: "PROXMON"
  }
];

export const softwareSection: SoftwareSection = {
  title: "PLATAFORMA WEB E APP",
  description:
    "Uma plataforma completa pensada para facilitar a vida de todos os usuários.",
  image: "/images/software/platform-mockup.png",
  buttonText: "Fale no WhatsApp",
  buttonUrl: whatsappUrl
};

export function getCameraBySlug(slug: string) {
  return cameras.find((camera) => camera.slug === slug);
}

export function isLive(camera: Camera) {
  return Boolean(camera.streamUrl?.trim());
}

export function getLiveCameras() {
  return cameras.filter(isLive);
}

/** Câmera destacada no topo da Home. */
export function getFeaturedCamera() {
  return getLiveCameras()[0] ?? cameras[0];
}

/* ------------------------------------------------------------------ */
/* Lugares                                                             */
/* ------------------------------------------------------------------ */

/**
 * Um lugar e o protagonista do site: ele reune as cameras daquele ponto e o
 * conteudo que so faz sentido ali — agenda, o projeto, a tecnologia instalada.
 * As cameras sozinhas nao sustentam uma pagina; o lugar sustenta.
 */
export type AgendaItem = {
  id: string;
  date: string;
  title: string;
  detail?: string;
};

export type TechItem = {
  id: string;
  title: string;
  description: string;
};

export type Place = {
  slug: string;
  name: string;
  /** Usado no tipo fantasma do fundo — curto funciona melhor. */
  shortName: string;
  location: string;
  city: string;
  state: string;
  tagline: string;
  about: string;
  /** Camera que aparece como imagem heroica do hub. */
  heroCamera: string;
  cameraSlugs: string[];
  agenda: AgendaItem[];
  tech: TechItem[];
};

export const places: Place[] = [
  {
    slug: "autodromo",
    name: "Autódromo de Chapecó",
    shortName: "Autódromo",
    location: "Chapecó - SC",
    city: "Chapecó",
    state: "SC",
    tagline: "A pista ao vivo, 24 horas por dia.",
    // CONTEUDO PROVISORIO — substituir pelo texto real do projeto
    about: `Câmeras instaladas no Autódromo de Chapecó transmitem a pista ao vivo, sem custo e sem cadastro.

Acompanhe o movimento em tempo real, de qualquer lugar, pelo computador ou pelo celular.`,
    heroCamera: "autodromo-panoramica",
    cameraSlugs: ["autodromo-panoramica", "autodromo-ptz"],
    // CONTEUDO PROVISORIO — substituir pelo calendario real
    agenda: [],
    // CONTEUDO PROVISORIO — substituir pela tecnologia realmente instalada
    tech: [
      {
        id: "ao-vivo",
        title: "Transmissão ao vivo",
        description:
          "Duas lentes cobrindo a pista, com sinal entregue em tempo real pelo nosso próprio servidor de mídia."
      },
      {
        id: "panoramica",
        title: "Visão panorâmica",
        description:
          "Lente grande-angular que cobre uma faixa ampla do traçado num único enquadramento."
      },
      {
        id: "movel",
        title: "Lente móvel",
        description:
          "Câmera com movimento, para acompanhar pontos específicos da pista."
      }
    ]
  }
];

export function getPlaceBySlug(slug: string) {
  return places.find((place) => place.slug === slug);
}

export function getPlaceCameras(place: Place) {
  return place.cameraSlugs
    .map((slug) => getCameraBySlug(slug))
    .filter((camera): camera is Camera => Boolean(camera));
}

export function getPlaceOfCamera(slug: string) {
  return places.find((place) => place.cameraSlugs.includes(slug));
}
