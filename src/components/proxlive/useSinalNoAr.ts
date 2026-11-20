"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Consulta se a transmissao esta mesmo no ar.
 *
 * O site decide "ao vivo" olhando se a camera tem endereco configurado, o que
 * basta para camera fixa — ela transmite o tempo todo. Nao basta para camera
 * que so liga as vezes, como o drone: sem consultar, o selo vermelho piscaria
 * tambem nos dias em que o equipamento nem saiu do chao.
 *
 * Pede so a playlist: cerca de 200 bytes, sem abrir video. O servidor responde
 * 200 com a lista quando ha sinal e 404 quando nao ha.
 *
 * O `cookieCheck=1` vai na propria URL porque o MediaMTX, sem ele, devolve um
 * redirecionamento que pede cookie — e cookie entre dominios nao sobrevive a
 * uma consulta sem credencial.
 *
 * ATENCAO: so usar em caminho alimentado por publicacao. Num caminho sob
 * demanda a consulta ligaria a camera a cada visita; na veicular, isso gastaria
 * o chip 4G de quem so passou os olhos na pagina.
 *
 * `noAr` fica `null` enquanto a resposta nao chega, para a interface nao piscar
 * "fora do ar" antes de saber. `consultarDeNovo` repete a consulta, para quem
 * esta na pagina quando o equipamento entra no ar.
 */
export function useSinalNoAr(streamUrl: string | undefined, verificar: boolean) {
  const [noAr, setNoAr] = useState<boolean | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!verificar || !streamUrl) {
      return;
    }
    const abortar = new AbortController();
    const separador = streamUrl.includes("?") ? "&" : "?";

    fetch(`${streamUrl}${separador}cookieCheck=1`, { signal: abortar.signal })
      .then((resposta) => setNoAr(resposta.ok))
      .catch(() => {
        // Erro de rede tambem e "nao esta no ar" para quem olha a pagina.
        if (!abortar.signal.aborted) {
          setNoAr(false);
        }
      });

    return () => abortar.abort();
  }, [streamUrl, verificar, tentativa]);

  const consultarDeNovo = useCallback(() => {
    setNoAr(null);
    setTentativa((anterior) => anterior + 1);
  }, []);

  return { noAr, consultarDeNovo };
}
