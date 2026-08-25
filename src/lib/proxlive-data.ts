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
  ogImage: "/images/cameras/cam1.png",
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
    id: "software-analitico-1",
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
    id: "software-analitico-2",
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
    id: "1",
    slug: "ponte-amizade-brasil",
    name: "Ponte da Amizade - Brasil",
    location: "BR-277, Foz do Iguaçu - PR",
    city: "Foz do Iguaçu",
    category: "Trânsito",
    summary:
      "Veja ao vivo o trânsito na Ponte da Amizade no sentido Paraguai, saindo de Foz do Iguaçu.",
    description: `A Ponte Internacional da Amizade é um dos principais pontos de ligação entre o Brasil e o Paraguai, conectando Foz do Iguaçu/PR a Ciudad del Este.

Localizada sobre o Rio Paraná, a ponte é uma rota essencial para turistas, trabalhadores, comerciantes e moradores da região de fronteira.

Por ser um ponto de grande movimento, o trânsito na ponte pode variar bastante ao longo do dia, principalmente em horários de pico, feriados e finais de semana. Acompanhe a câmera ao vivo da Ponte da Amizade no sentido Paraguai e veja em tempo real como está o fluxo de veículos antes de iniciar seu deslocamento até a fronteira.`,
    image: "/images/cameras/cam1.png",
    streamUrl:
      "https://video04.logicahost.com.br/portovelhomamore/fozpontedaamizadesentidoparaguai.stream/playlist.m3u8",
    latitude: -25.509444,
    longitude: -54.598314
  },
  {
    id: "2",
    slug: "ponte-amizade-paraguai",
    name: "Ponte da Amizade - Paraguai",
    location: "PY02, Cd. del Este 100134, Paraguai",
    city: "Ciudad del Este",
    category: "Trânsito",
    summary:
      "Acompanhe ao vivo o fluxo no lado paraguaio da Ponte da Amizade, no sentido Brasil.",
    description: `Acompanhe ao vivo a movimentação no lado paraguaio da Ponte Internacional da Amizade, em Ciudad del Este, na ligação com Foz do Iguaçu/PR.

A câmera mostra em tempo real o fluxo de veículos e pedestres que seguem em direção ao Brasil, ajudando turistas, trabalhadores e moradores da fronteira a verificarem as condições do trânsito antes de iniciar o deslocamento.`,
    image: "/images/cameras/cam2.png",
    // Sempre apontar para o playlist mestre: o chunklist carrega um id de
    // sessao que muda quando o encoder reinicia e quebraria o player.
    streamUrl:
      "https://video04.logicahost.com.br/portovelhomamore/fozpontedaamizadesentidobrasil.stream/playlist.m3u8",
    latitude: -25.509334,
    longitude: -54.606988
  },
  {
    id: "3",
    slug: "drone",
    name: "Autódromo Drone",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Drone",
    summary: "Imagem aérea ao vivo transmitida por drone.",
    description: `Transmissão aérea ao vivo enviada por drone.

O sinal chega ao PROXLIVE em tempo real, direto do equipamento em voo.`,
    image: "/images/cameras/indisponivel.png",
    streamUrl: "https://stream.proxlive.com.br/drone/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  },
  {
    id: "4",
    slug: "autodromo-ptz",
    name: "Autódromo PTZ",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Lente móvel do autódromo de Chapecó, ao vivo.",
    description: `Câmera com lente móvel instalada no Autódromo de Chapecó.

Acompanhe ao vivo a movimentação na pista.`,
    image: "/images/cameras/indisponivel.png",
    streamUrl: "https://stream.proxlive.com.br/autodromo-fixa/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  },
  {
    id: "5",
    slug: "autodromo-panoramica",
    name: "Autódromo Panorâmica",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Visão panorâmica do autódromo de Chapecó, ao vivo.",
    description: `Câmera panorâmica instalada no Autódromo de Chapecó.

A lente grande-angular cobre uma faixa ampla da pista num único enquadramento.`,
    image: "/images/cameras/indisponivel.png",
    streamUrl: "https://stream.proxlive.com.br/autodromo-pano/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  }
];

export const horizontalAds: AdCreative[] = [
  {
    id: "mhnet",
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
    id: "eletros",
    title: "Assinatura de câmeras",
    image: "/images/ads/side-ad-1.png",
    backgroundColor: "#051f44",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "turquesa",
    title: "Eletros Digital Security",
    image: "/images/ads/side-ad-2.png",
    backgroundColor: "#2b90a4",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "vermelha",
    title: "PROX Parking",
    image: "/images/ads/side-ad-3.png",
    backgroundColor: "#ff3131",
    textColor: "#ffffff",
    link: "https://www.proxmon.com.br/proxparking",
    advertiser: "PROXMON"
  }
];

export const cameraDetailHorizontalAd: AdCreative = {
  id: "camera-detail-mhnet",
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
    id: "camera-detail-side",
    title: "Eletros Digital Security",
    image: "/images/ads/side-ad-4.png",
    backgroundColor: "#051f44",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security",
    advertiser: "Eletros Digital"
  },
  {
    id: "camera-detail-side-2",
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
