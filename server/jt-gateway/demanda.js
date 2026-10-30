/**
 * Chamado pelo MediaMTX (runOnDemand) quando alguém abre uma câmera jt1078.
 *
 * Pede o vídeo à ponte e fica vivo enquanto houver espectador. A cada 10 s
 * repete o pedido — se o 4G caiu no meio, a ponte pede de novo à câmera.
 * Quando o último espectador sai, o MediaMTX encerra este processo, e aí
 * avisamos a ponte para mandar a câmera parar (poupa o plano de dados).
 *
 *   runOnDemand: node /opt/proxlive-jt/demanda.js $MTX_PATH
 */

const slug = process.argv[2] || process.env.MTX_PATH;
const base = process.env.CONTROLE_URL || "http://127.0.0.1:3002";

if (!slug) {
  console.error("Uso: node demanda.js <slug>");
  process.exit(1);
}

async function chamar(acao) {
  try {
    const r = await fetch(`${base}/${acao}/${encodeURIComponent(slug)}`, { method: "POST" });
    const corpo = await r.json().catch(() => ({}));
    if (!r.ok) console.error(`[demanda ${slug}] ${acao}: ${r.status} ${corpo.erro || ""}`);
    return r.ok;
  } catch (e) {
    console.error(`[demanda ${slug}] ponte inacessível: ${e.message}`);
    return false;
  }
}

let saindo = false;
async function sair() {
  if (saindo) return;
  saindo = true;
  await chamar("parar");
  process.exit(0);
}

process.on("SIGINT", sair);
process.on("SIGTERM", sair);

chamar("iniciar");
setInterval(() => chamar("iniciar"), 10000);
