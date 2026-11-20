"use client";

import type { Camera } from "@/lib/proxlive-data";
import { useSinalNoAr } from "./useSinalNoAr";

/**
 * Selo de estado no topo da pagina da camera.
 *
 * Existe separado porque `CameraDetail` roda no servidor: a camera
 * intermitente precisa consultar o sinal no navegador antes de dizer
 * "ao vivo agora", e so um componente de cliente pode fazer isso.
 */
export function SeloSinal({ camera }: { camera: Camera }) {
  const configurada = Boolean(camera.streamUrl?.trim());
  const { noAr } = useSinalNoAr(
    camera.streamUrl,
    configurada && !!camera.intermitente
  );

  const live = camera.intermitente ? noAr === true : configurada;
  const verificando = camera.intermitente && noAr === null;

  if (verificando) {
    // Espaco reservado: evita o texto trocar debaixo do olho de quem le.
    return <span className="eyebrow flex items-center gap-2.5">&nbsp;</span>;
  }

  return (
    <span className="eyebrow flex items-center gap-2.5">
      {live ? (
        <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
      ) : null}
      {live
        ? "Ao vivo agora"
        : camera.intermitente
          ? // A camera existe e funciona; so nao esta transmitindo agora.
            "Fora do ar"
          : "Em breve"}
    </span>
  );
}
