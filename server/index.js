/**
 * API de administracao do PROXLIVE.
 *
 * Fica na mesma VPS do MediaMTX e e a unica coisa que fala com a Control API
 * dele (127.0.0.1:9997). O navegador nunca alcanca o MediaMTX diretamente —
 * se alcancasse, qualquer pessoa cadastraria e apagaria cameras sem senha.
 *
 * Guarda os metadados das cameras (nome, local, coordenadas, descricao) num
 * arquivo JSON. E pouco dado e muda pouco; um banco seria peso sem ganho.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3001);
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const MEDIAMTX_API = process.env.MEDIAMTX_API || "http://127.0.0.1:9997";
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://proxlive.net.br";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "cameras.json");

if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
  console.error(
    "Faltam ADMIN_PASSWORD_HASH e/ou JWT_SECRET no .env. Veja o README."
  );
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "128kb" }));

// Só o site pode chamar esta API pelo navegador.
app.use(
  cors({
    origin: [SITE_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "DELETE"]
  })
);

/* ------------------------------------------------------------------ */
/* Armazenamento                                                       */
/* ------------------------------------------------------------------ */

function lerCameras() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function gravarCameras(lista) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  // Escreve em arquivo temporário e move: se cair no meio, o original fica intacto.
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(lista, null, 2), "utf-8");
  fs.renameSync(tmp, DATA_FILE);
}

/* ------------------------------------------------------------------ */
/* Autenticação                                                        */
/* ------------------------------------------------------------------ */

// Freio simples contra tentativa de força bruta no login.
const tentativas = new Map();
const MAX_TENTATIVAS = 8;
const JANELA_MS = 10 * 60 * 1000;

function limitarLogin(req, res, next) {
  const ip = req.ip;
  const agora = Date.now();
  const registro = tentativas.get(ip);

  if (registro && agora - registro.desde < JANELA_MS && registro.n >= MAX_TENTATIVAS) {
    return res.status(429).json({ erro: "Muitas tentativas. Aguarde 10 minutos." });
  }

  if (!registro || agora - registro.desde >= JANELA_MS) {
    tentativas.set(ip, { n: 0, desde: agora });
  }

  next();
}

function exigirToken(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado." });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão expirada. Entre de novo." });
  }
}

app.post("/api/login", limitarLogin, async (req, res) => {
  const { usuario, senha } = req.body || {};
  const registro = tentativas.get(req.ip);

  const usuarioOk = usuario === ADMIN_USER;
  const senhaOk = usuarioOk && (await bcrypt.compare(String(senha || ""), ADMIN_PASSWORD_HASH));

  if (!senhaOk) {
    if (registro) registro.n += 1;
    // Mensagem única: não revela se foi o usuário ou a senha que errou.
    return res.status(401).json({ erro: "Usuário ou senha inválidos." });
  }

  tentativas.delete(req.ip);
  const token = jwt.sign({ sub: ADMIN_USER }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

function validarCamera(c) {
  const erros = [];

  if (!SLUG_RE.test(c.slug || "")) {
    erros.push("slug: use minúsculas, números e hífen (3 a 50 caracteres).");
  }
  if (!c.name || c.name.length > 80) erros.push("name: obrigatório, até 80 caracteres.");
  if (!c.location || c.location.length > 120) erros.push("location: obrigatório.");

  const lat = Number(c.latitude);
  const lon = Number(c.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) erros.push("latitude inválida.");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) erros.push("longitude inválida.");

  if (!["rtsp", "rtmp"].includes(c.tipo)) erros.push("tipo: use 'rtsp' ou 'rtmp'.");

  if (c.tipo === "rtsp") {
    // Só RTSP: impede que alguém use este campo para apontar a outro protocolo.
    if (!/^rtsps?:\/\//i.test(c.sourceUrl || "")) {
      erros.push("sourceUrl: deve começar com rtsp:// ou rtsps://");
    }
  }

  return erros;
}

/* ------------------------------------------------------------------ */
/* MediaMTX                                                            */
/* ------------------------------------------------------------------ */

async function mediamtx(metodo, rota, corpo) {
  const resposta = await fetch(`${MEDIAMTX_API}${rota}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined
  });

  if (!resposta.ok && resposta.status !== 404) {
    const texto = await resposta.text().catch(() => "");
    throw new Error(`MediaMTX ${resposta.status}: ${texto.slice(0, 200)}`);
  }

  return resposta;
}

/* ------------------------------------------------------------------ */
/* Rebuild do site                                                     */
/* ------------------------------------------------------------------ */

async function dispararRebuild() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { disparado: false, motivo: "GITHUB_TOKEN/GITHUB_REPO não configurados" };
  }

  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ event_type: "cameras-atualizadas" })
    });

    return { disparado: r.status === 204, status: r.status };
  } catch (e) {
    return { disparado: false, motivo: String(e.message) };
  }
}

/* ------------------------------------------------------------------ */
/* Rotas de câmera                                                     */
/* ------------------------------------------------------------------ */

/** Público: é daqui que o site lê as câmeras durante o build. */
app.get("/api/cameras", (_req, res) => {
  // Nunca devolve a URL de origem: ela carrega a senha da câmera.
  const publicas = lerCameras().map(({ sourceUrl, ...resto }) => resto);
  res.json(publicas);
});

/** Admin: inclui a URL de origem, para edição. */
app.get("/api/admin/cameras", exigirToken, (_req, res) => {
  res.json(lerCameras());
});

app.post("/api/cameras", exigirToken, async (req, res) => {
  const c = req.body || {};
  const erros = validarCamera(c);

  if (erros.length) {
    return res.status(400).json({ erro: "Dados inválidos.", detalhes: erros });
  }

  const lista = lerCameras();

  if (lista.some((x) => x.slug === c.slug)) {
    return res.status(409).json({ erro: "Já existe uma câmera com esse identificador." });
  }

  // 1) Cria o path no MediaMTX.
  const config =
    c.tipo === "rtsp"
      ? { source: c.sourceUrl, sourceOnDemand: true, rtspTransport: "tcp" }
      : { source: "publisher" };

  try {
    await mediamtx("POST", `/v3/config/paths/add/${encodeURIComponent(c.slug)}`, config);
  } catch (e) {
    return res.status(502).json({ erro: "Falha ao criar no MediaMTX.", detalhe: String(e.message) });
  }

  // 2) Só então guarda os metadados.
  const nova = {
    slug: c.slug,
    name: c.name,
    location: c.location,
    city: c.city || "",
    category: c.category || "Câmeras",
    summary: c.summary || "",
    description: c.description || "",
    latitude: Number(c.latitude),
    longitude: Number(c.longitude),
    tipo: c.tipo,
    sourceUrl: c.tipo === "rtsp" ? c.sourceUrl : "",
    streamUrl: `https://stream.proxlive.net.br/${c.slug}/index.m3u8`,
    criadaEm: new Date().toISOString()
  };

  lista.push(nova);
  gravarCameras(lista);

  const rebuild = await dispararRebuild();

  res.status(201).json({
    camera: nova,
    rebuild,
    // Para câmeras RTMP, o painel mostra isso para configurar no equipamento.
    publishUrl:
      c.tipo === "rtmp"
        ? `rtmp://stream.proxlive.net.br:1935/${c.slug}?user=publisher&pass=SENHA_DE_PUBLICACAO`
        : null
  });
});

app.delete("/api/cameras/:slug", exigirToken, async (req, res) => {
  const { slug } = req.params;
  const lista = lerCameras();
  const restante = lista.filter((x) => x.slug !== slug);

  if (restante.length === lista.length) {
    return res.status(404).json({ erro: "Câmera não encontrada." });
  }

  try {
    await mediamtx("DELETE", `/v3/config/paths/delete/${encodeURIComponent(slug)}`);
  } catch (e) {
    return res.status(502).json({ erro: "Falha ao remover no MediaMTX.", detalhe: String(e.message) });
  }

  gravarCameras(restante);
  const rebuild = await dispararRebuild();
  res.json({ removida: slug, rebuild });
});

/** Estado ao vivo de cada path, para o painel mostrar quem está no ar. */
app.get("/api/status", exigirToken, async (_req, res) => {
  try {
    const r = await mediamtx("GET", "/v3/paths/list");
    const dados = await r.json();
    const estados = {};

    for (const item of dados.items || []) {
      estados[item.name] = { ready: item.ready, readers: (item.readers || []).length };
    }

    res.json(estados);
  } catch (e) {
    res.status(502).json({ erro: String(e.message) });
  }
});

app.post("/api/rebuild", exigirToken, async (_req, res) => {
  res.json(await dispararRebuild());
});

app.get("/api/saude", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`API do PROXLIVE em 127.0.0.1:${PORT}`);
});
