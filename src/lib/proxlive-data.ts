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
  /**
   * Ausentes em câmera que se move — veicular, por exemplo. Sem coordenada a
   * câmera fica fora do mapa e sem `geo` nos dados estruturados, em vez de
   * ganhar um pino parado onde ela não está.
   */
  latitude?: number;
  longitude?: number;
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
  },
  {
    id: "6",
    slug: "autodromo-chegada",
    name: "Chegada",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Reta de chegada do autódromo de Chapecó, ao vivo.",
    description: `Câmera voltada para a reta de chegada do Autódromo de Chapecó.

Acompanhe ao vivo o momento em que os carros cruzam a linha.`,
    image: "/images/cameras/autodromo-chegada.jpg",
    streamUrl: "https://stream.proxlive.com.br/autodromo-chegada/index.m3u8",
    latitude: -27.1082,
    longitude: -52.6069
  },
  {
    id: "5",
    slug: "carro-01",
    name: "Carro 01",
    location: "Autódromo de Chapecó - SC",
    city: "Chapecó",
    category: "Autódromo",
    summary: "Câmera veicular ao vivo no autódromo de Chapecó.",
    description: `Câmera embarcada em veículo, transmitindo por chip 4G.

O sinal só é pedido ao veículo enquanto alguém está assistindo.`,
    // Quadro congelado da própria câmera: ela é sob demanda, então não existe
    // miniatura contínua em /thumbs como nas câmeras fixas.
    image: "/images/cameras/carro-01.jpg",
    streamUrl: "https://stream.proxlive.com.br/carro-01/index.m3u8"
    // Sem latitude/longitude de propósito: a câmera se move, então fica fora
    // do mapa em vez de ganhar um pino parado onde ela não está.
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
  /** Camera que aparece como imagem heroica do hub. Vazio = ainda sem sinal. */
  heroCamera?: string;
  /**
   * Tom do lugar, usado em opacidade baixa no card. Da identidade a cada
   * cenario sem quebrar a paleta monocromatica do site.
   */
  tint: string;
  /** Foto do lugar. E ela que aparece no card da home. */
  cover: string;
  /**
   * Topo do hub: um frame congelado da propria camera, guardado no repo.
   * Mostra o enquadramento real de quem chega sem abrir nenhum stream — o
   * video ao vivo so comeca quando a pessoa escolhe uma camera.
   * Sem camera no lugar, o hub cai na `cover`.
   */
  heroImage?: string;
  cameraSlugs: string[];
  agenda: AgendaItem[];
  tech: TechItem[];
  /** Proximo evento no lugar. Provisorio ate termos a agenda completa. */
  nextEvent?: { date: string; title: string };
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
    tint: "#c2410c",
    cover: "/images/places/autodromo.jpg",
    heroImage: "/images/places/autodromo-hero.jpg",
    // CONTEUDO PROVISORIO — substituir pelo texto real do projeto
    about: `A Proxmon, em conjunto com o Grupo MHNET Telecom, conduziu o projeto do autódromo de ponta a ponta, do levantamento técnico à implantação.

A pista passou a ser monitorada por torres equipadas com câmeras, que fornecem imagens em tempo real ao Race Control, onde os dirigentes tomam as decisões da prova, e também alimentam a transmissão ao vivo nos canais.

O sistema conta com inteligência artificial capaz de identificar automaticamente carros parados ou acidentados, animais e pessoas na pista e aglomerações, além de realizar reconhecimento facial.

Para integrar toda a operação, foi desenvolvido um software exclusivo para o autódromo, com mapeamento da pista, monitoramento de ativos e eventos e dashboards, operado a partir de uma central de controle dedicada.`,
    heroCamera: "autodromo-panoramica",
    cameraSlugs: [
      "autodromo-panoramica",
      "autodromo-ptz",
      "autodromo-chegada",
      "carro-01"
    ],
    // CONTEUDO PROVISORIO — substituir pelo calendario real
    agenda: [],
    tech: [],
    // CONTEUDO PROVISORIO — o nome da etapa ainda precisa ser confirmado
    nextEvent: { date: "01/11", title: "Próxima etapa" },
  },
  {
    slug: "cataratas",
    name: "Cataratas do Iguaçu",
    shortName: "Cataratas",
    location: "Foz do Iguaçu - PR",
    city: "Foz do Iguaçu",
    state: "PR",
    tagline: "Em breve, ao vivo.",
    tint: "#0d7f8c",
    cover: "/images/places/cataratas.jpg",
    // CONTEUDO PROVISORIO
    about: `Estamos preparando a transmissão ao vivo das Cataratas do Iguaçu.

Em breve você vai acompanhar em tempo real, de graça e sem cadastro.`,
    cameraSlugs: [],
    agenda: [],
    tech: []
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

/* ------------------------------------------------------------------ */
/* Empresas parceiras                                                  */
/* ------------------------------------------------------------------ */

export type Partner = {
  id: string;
  name: string;
  logo: string;
  url?: string;
};

/** A ordem aqui e a ordem exibida no rodape. */
export const partners: Partner[] = [
  { id: "proxmon", name: "PROXMON", logo: "/images/partners/proxmon.webp", url: "https://www.proxmon.com.br" },
  { id: "eletros", name: "Eletros Digital", logo: "/images/partners/eletros-digital.png", url: "https://www.eletrosdigitalsolutec.com.br" },
  { id: "mhnet", name: "MHNET Telecom", logo: "/images/partners/mhnet.png", url: "https://mhnet.com.br" },
  { id: "accron", name: "Accron", logo: "/images/partners/accron.webp" }
];
