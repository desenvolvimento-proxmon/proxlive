export const PRIMARY_BLUE = "#0072ff";

export const whatsappUrl = "https://wa.me/5549920048536";

export const socialLinks = {
  whatsapp: whatsappUrl,
  instagram: "https://www.instagram.com/proxmon_tec"
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
  description: string;
  image: string;
  streamUrl?: string;
  latitude: number;
  longitude: number;
};

export type HorizontalAd = {
  id: string;
  title: string;
  image?: string;
  logoText?: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
};

export type SideAd = {
  id: string;
  title: string;
  image?: string;
  logoText?: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
};

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
    title: "SOFTWARE DE ANALÍTICO DE VÍDEOS  COM IA",
    subtitle:
      "Nosso software de analíticos de vídeo transforma um sistema de câmeras convencional em uma solução inteligente com IA.",
    image: "/images/hero/banners1.png",
    buttonText: "Fale no whatsapp",
    buttonUrl: whatsappUrl,
    cornerLogoImage: "/images/brand/proxvision-logo.png",
    cornerLogoAlt: "PROXVISION"
  },
  {
    id: "software-analitico-2",
    title: "SISTEMA COMPLETO PARA GESTÃO CONDOMINIAL",
    subtitle:
      "Aplicativo para condomínios com mais de 30 funcionalidades",
    image: "/images/hero/banners2.png",
    buttonText: "Fale no whatsapp",
    buttonUrl: whatsappUrl,
    cornerLogoImage: "/images/brand/proxcond-logo.png",
    cornerLogoAlt: "PROXCOND"
  }
];

const cameraDescription =
  ".";

export const cameras: Camera[] = [
  {
    id: "1",
    slug: "ponte-amizade-brasil",
    name: "Ponte da Amizade - Brasil",
    location: "BR-277, Foz do Iguaçu - PR",
    description: `A Ponte Internacional da Amizade é um dos principais pontos de ligação entre o Brasil e o Paraguai, conectando Foz do Iguaçu/PR a Ciudad del Este.
    
                  Localizada sobre o Rio Paraná, a ponte é uma rota essencial para turistas, trabalhadores, comerciantes e moradores da região de fronteira.

                  Por ser um ponto de grande movimento, o trânsito na ponte pode variar bastante ao longo do dia, principalmente em horários de pico, feriados e finais de semana. Acompanhe a câmera ao vivo da Ponte da Amizade no sentido Paraguai e veja em tempo real como está o fluxo de veículos antes de iniciar seu deslocamento até a fronteira.`,
    image: "/images/cameras/cam1.png",
    streamUrl: "https://video04.logicahost.com.br/portovelhomamore/fozpontedaamizadesentidoparaguai.stream/playlist.m3u8",
    latitude: -25.509444,
    longitude: -54.598314
  },

  {
    id: "2",
    slug: "ponte-amizade-paraguai",
    name: "Ponte da Amizade - Paraguai",
    location: "PY02, Cd. del Este 100134, Paraguai",
    description: `Acompanhe ao vivo a movimentação no lado paraguaio da Ponte Internacional da Amizade, em Ciudad del Este, na ligação com Foz do Iguaçu/PR. 
    
    A câmera mostra em tempo real o fluxo de veículos e pedestres que seguem em direção ao Brasil, ajudando turistas, trabalhadores e moradores da fronteira a verificarem as condições do trânsito antes de iniciar o deslocamento.`,
    image: "/images/cameras/cam2.png",
    streamUrl: "https://video04.logicahost.com.br/portovelhomamore/fozpontedaamizadesentidobrasil.stream/chunklist_w937410344.m3u8",
    latitude: -25.509334,
    longitude: -54.606988
  },
  {
    id: "3",
    slug: "camera-indisponivel-1",
    name: "Camera indisponivel",
    location: "Em breve",
    description: cameraDescription,
    image: "/images/cameras/indisponivel.png",
    streamUrl: "",
    latitude: -27.1082,
    longitude: -52.6069
  },
  {
    id: "4",
    slug: "camera-indisponivel-2",
    name: "Camera indisponivel",
    location: "Em breve",
    description: cameraDescription,
    image: "/images/cameras/indisponivel.png",
    streamUrl: "",
    latitude: -25.509444,
    longitude: -54.598314
  }
];

export const horizontalAds: HorizontalAd[] = [
  {
    id: "mhnet",
    title: "Propaganda MHnet",
    image: "/images/ads/banner-mhnet.png",
    backgroundColor: PRIMARY_BLUE,
    textColor: "#ffffff",
    link: "https://mhnet.com.br"
  }
];

export const sideAds: SideAd[] = [
  {
    id: "eletros",
    title: "Assinatura de câmeras",
    image: "/images/ads/side-ad-1.png",
    backgroundColor: "#051f44",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security"
  },
  {
    id: "turquesa",
    title: "Eletros Digital Security",
    image: "/images/ads/side-ad-2.png",
    backgroundColor: "#2b90a4",
    textColor: "#ffffff",
    link: "https://www.eletrosdigitalsolutec.com.br/security"
  },
  {
    id: "vermelha",
    title: "PROX Parking",
    image: "/images/ads/side-ad-3.png",
    backgroundColor: "#ff3131",
    textColor: "#ffffff",
    link: "https://www.proxmon.com.br/proxparking"
  }
];

export const cameraDetailHorizontalAd: HorizontalAd = {
  id: "camera-detail-mhnet",
  title: "Propaganda MHnet",
  image: "/images/ads/banner-mhnet.png",
  backgroundColor: PRIMARY_BLUE,
  textColor: "#ffffff",
  link: "https://mhnet.com.br"
};

export const cameraDetailSideAd: SideAd = {
  id: "camera-detail-side",
  title: "Anuncio detalhe",
  image: "/images/ads/side-ad-4.png",
  backgroundColor: "#051f44",
  textColor: "#ffffff"
};

export const softwareSection: SoftwareSection = {
  title: "PLATAFORMA WEB E APP",
  description:
    "Uma plataforma completa pensada para facilitar a vida de todos os usuários.",
  image: "/images/software/platform-mockup.png",
  buttonText: "Fale no whatsapp",
  buttonUrl: whatsappUrl
};

export function getCameraBySlug(slug: string) {
  return cameras.find((camera) => camera.slug === slug);
}
