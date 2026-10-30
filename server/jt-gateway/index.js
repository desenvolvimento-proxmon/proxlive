/**
 * Ponte JT/T 808 + 1078 → MediaMTX do PROXLIVE.
 *
 * Serve para câmeras veiculares em chip 4G (ex.: Hikvision AE-DI5052-G40 PRO),
 * que ficam atrás de CGNAT e não podem ser "puxadas" por RTSP. Aqui é o
 * contrário: a câmera liga para nós.
 *
 *   Câmera ──JT808 (comandos, porta 7611)──▶ esta ponte
 *   Câmera ──JT1078 (vídeo, porta 7612)────▶ esta ponte ──ffmpeg──▶ MediaMTX
 *
 * O vídeo só é pedido quando alguém está assistindo: o MediaMTX roda o
 * `demanda.js` (runOnDemand) quando chega o primeiro espectador, e ele chama
 * POST /iniciar/:slug aqui. Quando o último sai, o MediaMTX encerra o
 * `demanda.js`, que chama POST /parar/:slug. Isso poupa o plano de dados.
 *
 * Sem dependências: só Node 18+ e ffmpeg instalado.
 */

const net = require("net");
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");

const jt808 = require("./jt808");
const { LeitorJT1078 } = require("./jt1078");

const CFG = {
  portaComandos: Number(process.env.JT808_PORTA || 7611),
  portaVideo: Number(process.env.JT1078_PORTA || 7612),
  // Endereço que a câmera usa para chegar no servidor de vídeo (IP público ou domínio).
  hostPublico: process.env.JT1078_HOST_PUBLICO || "",
  portaControle: Number(process.env.CONTROLE_PORTA || 3002),
  arquivoCameras: process.env.DATA_FILE || "/opt/proxlive-api/data/cameras.json",
  // {slug} e {senha} são trocados na hora. Padrão: o mesmo RTMP de publicação do site.
  urlPublicar:
    process.env.PUBLICAR_URL || "rtmp://127.0.0.1:1935/{slug}?user=publisher&pass={senha}",
  senhaPublicar: process.env.PUBLICAR_SENHA || "",
  ffmpeg: process.env.FFMPEG || "ffmpeg",
  // Sem quadro por este tempo, a transmissão é dada como morta.
  silencioMaxMs: Number(process.env.SILENCIO_MAX_MS || 20000),
  log: (process.env.LOG || "info").toLowerCase()
};

const log = (...a) => console.log(new Date().toISOString(), ...a);
const debug = (...a) => CFG.log === "debug" && log("[debug]", ...a);

if (!CFG.hostPublico) {
  console.error("Falta JT1078_HOST_PUBLICO no .env (IP público ou domínio desta VPS).");
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Cadastro                                                             */
/* ------------------------------------------------------------------ */

/** Lê a câmera do mesmo cameras.json da API do PROXLIVE. */
function acharCamera(slug) {
  let lista = [];
  try {
    lista = JSON.parse(fs.readFileSync(CFG.arquivoCameras, "utf-8"));
  } catch (e) {
    log("Não consegui ler", CFG.arquivoCameras, "-", e.message);
  }
  const c = lista.find((x) => x.slug === slug && x.tipo === "jt1078");
  if (!c) return null;
  return {
    slug: c.slug,
    terminal: jt808.normalizarTerminal(c.terminal),
    canal: Number(c.canal || 1),
    fluxo: Number(c.fluxo ?? 1)
  };
}

/* ------------------------------------------------------------------ */
/* Canal de comandos (JT808)                                           */
/* ------------------------------------------------------------------ */

const sessoes = new Map(); // terminal normalizado → sessão

function enviar(sessao, id, corpo) {
  sessao.serialSaida = (sessao.serialSaida + 1) & 0xffff;
  sessao.socket.write(jt808.codificar(id, corpo, sessao, sessao.serialSaida));
}

const servidorComandos = net.createServer((socket) => {
  const origem = `${socket.remoteAddress}:${socket.remotePort}`;
  let buffer = Buffer.alloc(0);
  let sessao = null;

  socket.setKeepAlive(true, 30000);
  socket.setTimeout(5 * 60 * 1000); // sem nada por 5 min: derruba

  socket.on("data", (dados) => {
    buffer = Buffer.concat([buffer, dados]);
    if (buffer.length > 64 * 1024) buffer = Buffer.alloc(0); // proteção contra lixo

    const { mensagens, resto } = jt808.extrairPacotes(buffer);
    buffer = Buffer.from(resto);

    for (const m of mensagens) {
      const chave = jt808.normalizarTerminal(m.terminal);

      if (!sessao || sessao.terminal !== chave) {
        const antiga = sessoes.get(chave);
        if (antiga && antiga.socket !== socket) antiga.socket.destroy();
        sessao = {
          terminal: chave,
          terminalBruto: m.terminal,
          socket,
          v2019: m.v2019,
          versao: m.versao,
          telBruto: m.telBruto,
          serialSaida: 0,
          posicao: null,
          desde: new Date().toISOString()
        };
        sessoes.set(chave, sessao);
        log(`Câmera ${m.terminal} conectou de ${origem} (JT808 ${m.v2019 ? "2019" : "2013"})`);
      }
      sessao.ultimaMensagem = Date.now();

      tratarMensagem(sessao, m);
    }
  });

  socket.on("timeout", () => socket.destroy());
  socket.on("error", (e) => debug("erro no socket de comandos", origem, e.message));
  socket.on("close", () => {
    if (sessao && sessoes.get(sessao.terminal)?.socket === socket) {
      sessoes.delete(sessao.terminal);
      log(`Câmera ${sessao.terminalBruto} desconectou`);
    }
  });
});

function tratarMensagem(sessao, m) {
  const { ID } = jt808;
  debug(`<- 0x${m.id.toString(16).padStart(4, "0")} de ${sessao.terminalBruto}`);

  switch (m.id) {
    case ID.REGISTRO:
      // Aceita o registro e devolve um código; a câmera usa ele na autenticação.
      enviar(sessao, ID.RESPOSTA_REGISTRO, jt808.corpoRespostaRegistro(m.serial, sessao.terminal || "proxlive"));
      return;

    case ID.POSICAO: {
      const pos = jt808.lerPosicao(m.corpo);
      if (pos) sessao.posicao = pos;
      break;
    }

    case ID.RESPOSTA_TERMINAL: {
      // A câmera respondendo a um pedido nosso (ex.: 0x9101).
      if (m.corpo.length >= 5) {
        const idResp = m.corpo.readUInt16BE(2);
        const resultado = m.corpo[4];
        if (resultado !== 0) {
          log(`Câmera ${sessao.terminalBruto} recusou 0x${idResp.toString(16)} (resultado ${resultado})`);
        } else {
          debug(`Câmera ${sessao.terminalBruto} aceitou 0x${idResp.toString(16)}`);
        }
      }
      return; // resposta não se responde
    }
  }

  // Todo o resto (autenticação, heartbeat, posição...) recebe "ok".
  enviar(sessao, ID.RESPOSTA_PLATAFORMA, jt808.corpoRespostaGeral(m.serial, m.id, 0));
}

/* ------------------------------------------------------------------ */
/* Transmissões                                                         */
/* ------------------------------------------------------------------ */

const transmissoes = new Map(); // slug → transmissão

function iniciar(slug) {
  const camera = acharCamera(slug);
  if (!camera) return { ok: false, status: 404, erro: "Câmera jt1078 não cadastrada." };

  const sessao = sessoes.get(camera.terminal);
  if (!sessao) return { ok: false, status: 409, erro: "Câmera offline (não conectada no JT808)." };

  const atual = transmissoes.get(slug);
  if (atual && (atual.ffmpeg || Date.now() - atual.pedidoEm < 15000)) {
    return { ok: true, status: 200, estado: atual.ffmpeg ? "no ar" : "aguardando a câmera" };
  }
  if (atual) encerrar(slug, "novo pedido");

  transmissoes.set(slug, {
    slug,
    camera,
    pedidoEm: Date.now(),
    ultimoQuadro: 0,
    ffmpeg: null,
    socketVideo: null
  });

  jt808Iniciar(sessao, camera);
  log(`Pedido de vídeo ao vivo: ${slug} (terminal ${sessao.terminalBruto}, canal ${camera.canal})`);
  return { ok: true, status: 202, estado: "aguardando a câmera" };
}

function jt808Iniciar(sessao, camera) {
  enviar(
    sessao,
    jt808.ID.INICIAR_AO_VIVO,
    jt808.corpoIniciarAoVivo({
      host: CFG.hostPublico,
      portaTcp: CFG.portaVideo,
      canal: camera.canal,
      tipoDados: 1, // só vídeo: o site toca sem áudio e economiza dados
      fluxo: camera.fluxo
    })
  );
}

function encerrar(slug, motivo) {
  const t = transmissoes.get(slug);
  if (!t) return false;
  transmissoes.delete(slug);

  const sessao = sessoes.get(t.camera.terminal);
  if (sessao) enviar(sessao, jt808.ID.CONTROLAR_AO_VIVO, jt808.corpoPararAoVivo(t.camera.canal));

  if (t.ffmpeg) {
    t.ffmpeg.stdin.end();
    const proc = t.ffmpeg;
    setTimeout(() => proc.kill("SIGKILL"), 3000).unref();
  }
  if (t.socketVideo) t.socketVideo.destroy();
  log(`Transmissão encerrada: ${slug} (${motivo})`);
  return true;
}

function abrirFfmpeg(t, codec) {
  const url = CFG.urlPublicar
    .replace("{slug}", encodeURIComponent(t.slug))
    .replace("{senha}", encodeURIComponent(CFG.senhaPublicar));
  const formato = url.startsWith("rtsp") ? ["-f", "rtsp", "-rtsp_transport", "tcp"] : ["-f", "flv"];

  const args = [
    "-hide_banner", "-loglevel", "warning",
    "-fflags", "+genpts+nobuffer",
    // O vídeo chega cru (sem contêiner): o relógio da chegada vira o tempo de
    // cada quadro, assim quadro perdido no 4G não acelera nem atrasa a imagem.
    "-use_wallclock_as_timestamps", "1",
    "-f", codec, "-i", "pipe:0",
    "-c:v", "copy", "-an",
    ...formato, url
  ];

  const proc = spawn(CFG.ffmpeg, args, { stdio: ["pipe", "ignore", "pipe"] });
  proc.stdin.on("error", () => {}); // EPIPE se o ffmpeg cair; tratado no "exit"
  proc.stderr.on("data", (d) => log(`[ffmpeg ${t.slug}]`, d.toString().trim()));
  proc.on("exit", (code) => {
    if (transmissoes.get(t.slug)?.ffmpeg === proc) {
      log(`ffmpeg de ${t.slug} saiu (código ${code})`);
      encerrar(t.slug, "ffmpeg saiu");
    }
  });
  log(`Publicando ${t.slug} (${codec}) no MediaMTX`);
  return proc;
}

/* ------------------------------------------------------------------ */
/* Canal de vídeo (JT1078)                                             */
/* ------------------------------------------------------------------ */

const servidorVideo = net.createServer((socket) => {
  const origem = `${socket.remoteAddress}:${socket.remotePort}`;
  let t = null;
  let esperandoChave = true;

  const leitor = new LeitorJT1078((q) => {
    if (!t) {
      const terminal = jt808.normalizarTerminal(q.sim);
      t = [...transmissoes.values()].find(
        (x) => x.camera.terminal === terminal && x.camera.canal === q.canal
      );
      if (!t) {
        // Ninguém pediu esse vídeo: não aceita.
        log(`Vídeo não solicitado de ${q.sim} canal ${q.canal} (${origem}); fechando`);
        socket.destroy();
        return;
      }
      if (t.socketVideo && t.socketVideo !== socket) t.socketVideo.destroy();
      t.socketVideo = socket;
      log(`Vídeo de ${t.slug} chegando de ${origem}`);
    }
    if (q.canal !== t.camera.canal) return;

    t.ultimoQuadro = Date.now();

    // O ffmpeg precisa começar num quadro-chave (I), senão descarta tudo até lá.
    if (esperandoChave) {
      if (!q.chave) return;
      if (!q.codec) {
        log(`Codec desconhecido (PT ${q.pt}) em ${t.slug}; use H.264 na câmera`);
        encerrar(t.slug, "codec desconhecido");
        return;
      }
      esperandoChave = false;
      if (!t.ffmpeg) t.ffmpeg = abrirFfmpeg(t, q.codec);
    }

    if (t.ffmpeg && t.ffmpeg.stdin.writable) t.ffmpeg.stdin.write(q.dados);
  });

  socket.on("data", (d) => leitor.alimentar(d));
  socket.on("error", (e) => debug("erro no socket de vídeo", origem, e.message));
  socket.on("close", () => {
    if (t && t.socketVideo === socket && transmissoes.get(t.slug) === t) {
      encerrar(t.slug, "câmera fechou a conexão de vídeo");
    }
  });
});

// Vigia: transmissão sem quadro há muito tempo (ou que nunca começou) é encerrada.
// Se ainda houver espectador, o demanda.js pede de novo.
setInterval(() => {
  const agora = Date.now();
  for (const t of transmissoes.values()) {
    const referencia = t.ultimoQuadro || t.pedidoEm;
    if (agora - referencia > CFG.silencioMaxMs) {
      encerrar(t.slug, t.ultimoQuadro ? "câmera parou de mandar vídeo" : "câmera não abriu o vídeo");
    }
  }
}, 5000).unref();

/* ------------------------------------------------------------------ */
/* Controle local (só 127.0.0.1)                                       */
/* ------------------------------------------------------------------ */

function responder(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

const servidorControle = http.createServer((req, res) => {
  const url = new URL(req.url, "http://local");
  const [, acao, slug] = url.pathname.split("/");

  if (req.method === "GET" && acao === "saude") return responder(res, 200, { ok: true });

  if (req.method === "GET" && acao === "estado") {
    return responder(res, 200, {
      cameras: [...sessoes.values()].map((s) => ({
        terminal: s.terminalBruto,
        desde: s.desde,
        protocolo: s.v2019 ? "2019" : "2013",
        posicao: s.posicao
      })),
      transmissoes: [...transmissoes.values()].map((t) => ({
        slug: t.slug,
        noAr: Boolean(t.ffmpeg),
        ultimoQuadro: t.ultimoQuadro ? new Date(t.ultimoQuadro).toISOString() : null
      }))
    });
  }

  if (req.method === "POST" && acao === "iniciar" && slug) {
    const r = iniciar(decodeURIComponent(slug));
    return responder(res, r.status, r);
  }

  if (req.method === "POST" && acao === "parar" && slug) {
    const ok = encerrar(decodeURIComponent(slug), "sem espectadores");
    return responder(res, ok ? 200 : 404, { ok });
  }

  responder(res, 404, { erro: "Rota inexistente." });
});

servidorComandos.listen(CFG.portaComandos, "0.0.0.0", () =>
  log(`JT808 (comandos) ouvindo na porta ${CFG.portaComandos}`)
);
servidorVideo.listen(CFG.portaVideo, "0.0.0.0", () =>
  log(`JT1078 (vídeo) ouvindo na porta ${CFG.portaVideo}; câmeras vão usar ${CFG.hostPublico}`)
);
servidorControle.listen(CFG.portaControle, "127.0.0.1", () =>
  log(`Controle local em 127.0.0.1:${CFG.portaControle}`)
);

for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    for (const slug of [...transmissoes.keys()]) encerrar(slug, "ponte desligando");
    setTimeout(() => process.exit(0), 300);
  });
}
