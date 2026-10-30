/**
 * Câmera falsa para testar a ponte sem a G40 de verdade.
 *
 * Conecta no JT808, se registra, manda heartbeat e GPS e, quando recebe o
 * 0x9101, abre o canal de vídeo e transmite um arquivo .h264 (Annex B) em
 * pacotes JT1078, no ritmo indicado. Para no 0x9102.
 *
 *   node teste/simulador.js video.h264 [host] [portaJT808] [terminal] [2013|2019] [fps]
 */

const net = require("net");
const fs = require("fs");
const jt808 = require("../jt808");
const { escapar, xor } = jt808._interno;

const [arquivo, host = "127.0.0.1", porta = "7611", terminal = "012345678901", versao = "2013", fpsArg = "15"] =
  process.argv.slice(2);
const v2019 = versao === "2019";
const fps = Number(fpsArg);

function bcd(texto, bytes) {
  const s = texto.padStart(bytes * 2, "0");
  return Buffer.from(s, "hex");
}
const telBruto = bcd(terminal, v2019 ? 10 : 6);

let serial = 0;
function pacote808(id, corpo) {
  const props = corpo.length | (v2019 ? 0x4000 : 0);
  const h = Buffer.alloc(4);
  h.writeUInt16BE(id, 0);
  h.writeUInt16BE(props, 2);
  const s = Buffer.alloc(2);
  s.writeUInt16BE(++serial, 0);
  const dados = Buffer.concat([h, v2019 ? Buffer.from([1]) : Buffer.alloc(0), telBruto, s, corpo]);
  return Buffer.concat([Buffer.from([0x7e]), escapar(Buffer.concat([dados, Buffer.from([xor(dados)])])), Buffer.from([0x7e])]);
}

/* ---------------------- quadros do arquivo H.264 ---------------------- */

function quadrosH264(buf) {
  const nals = [];
  let i = 0;
  const inicios = [];
  while (i < buf.length - 3) {
    if (buf[i] === 0 && buf[i + 1] === 0 && (buf[i + 2] === 1 || (buf[i + 2] === 0 && buf[i + 3] === 1))) {
      inicios.push(i);
      i += buf[i + 2] === 1 ? 3 : 4;
    } else i++;
  }
  for (let k = 0; k < inicios.length; k++) {
    const ini = inicios[k];
    const fim = k + 1 < inicios.length ? inicios[k + 1] : buf.length;
    const off = buf[ini + 2] === 1 ? 3 : 4;
    nals.push({ tipo: buf[ini + off] & 0x1f, dados: buf.subarray(ini, fim) });
  }
  const quadros = [];
  let atual = { partes: [], fatia: false, chave: false };
  for (const n of nals) {
    const ehFatia = n.tipo === 1 || n.tipo === 5;
    if (atual.fatia && (ehFatia || [6, 7, 8, 9].includes(n.tipo))) {
      quadros.push(atual);
      atual = { partes: [], fatia: false, chave: false };
    }
    atual.partes.push(n.dados);
    if (ehFatia) atual.fatia = true;
    if (n.tipo === 5) atual.chave = true;
  }
  if (atual.partes.length) quadros.push(atual);
  return quadros.map((q) => ({ chave: q.chave, dados: Buffer.concat(q.partes) }));
}

/* ------------------------- pacotes JT1078 ------------------------- */

let serialMidia = 0;
function pacotes1078(canal, quadro, ts) {
  const MAX = 950;
  const pedacos = [];
  for (let o = 0; o < quadro.dados.length; o += MAX) pedacos.push(quadro.dados.subarray(o, o + MAX));
  return pedacos.map((corpo, i) => {
    let marca = 0;
    if (pedacos.length > 1) marca = i === 0 ? 1 : i === pedacos.length - 1 ? 2 : 3;
    const tipo = quadro.chave ? 0 : 1;
    const simB = bcd(terminal, v2019 ? 10 : 6);
    const cab = Buffer.alloc(8);
    cab.write("01cd", 0, "ascii");
    cab[4] = 0x81;
    cab[5] = (i === pedacos.length - 1 ? 0x80 : 0) | 98; // PT 98 = H.264
    cab.writeUInt16BE(++serialMidia & 0xffff, 6);
    const resto = Buffer.alloc(2 + 8 + 4 + 2);
    resto[0] = canal;
    resto[1] = (tipo << 4) | marca;
    resto.writeBigUInt64BE(BigInt(ts), 2);
    resto.writeUInt16BE(0, 10);
    resto.writeUInt16BE(Math.round(1000 / fps), 12);
    resto.writeUInt16BE(corpo.length, 14);
    return Buffer.concat([cab, simB, resto, corpo]);
  });
}

/* ------------------------------ fluxo ------------------------------ */

const quadros = quadrosH264(fs.readFileSync(arquivo));
console.log(`[sim] ${quadros.length} quadros, ${quadros.filter((q) => q.chave).length} chave`);

let midia = null;
let timer = null;

function pararVideo() {
  clearInterval(timer);
  timer = null;
  if (midia) midia.end();
  midia = null;
}

function abrirVideo(ipVideo, portaVideo, canal) {
  pararVideo();
  console.log(`[sim] abrindo vídeo em ${ipVideo}:${portaVideo} canal ${canal}`);
  midia = net.connect(portaVideo, ipVideo);
  midia.on("error", (e) => console.log("[sim] erro no vídeo:", e.message));
  let n = 0;
  const t0 = Date.now();
  timer = setInterval(() => {
    if (!midia) return;
    const q = quadros[n++ % quadros.length];
    for (const p of pacotes1078(canal, q, Date.now() - t0)) midia.write(p);
  }, 1000 / fps);
}

const sock = net.connect(Number(porta), host, () => {
  console.log("[sim] conectado no JT808");
  // registro: província(2) cidade(2) fabricante(5) modelo(20) id(7) cor(1) placa
  const reg = Buffer.concat([Buffer.alloc(2 + 2), Buffer.from("HIKVI"), Buffer.alloc(20), Buffer.from("G40TEST"), Buffer.from([1]), Buffer.from("ABC1D23")]);
  sock.write(pacote808(0x0100, reg));
});

let buf = Buffer.alloc(0);
sock.on("data", (d) => {
  buf = Buffer.concat([buf, d]);
  const { mensagens, resto } = jt808.extrairPacotes(buf);
  buf = Buffer.from(resto);
  for (const m of mensagens) {
    if (m.id === 0x8100) {
      const codigo = m.corpo.subarray(3).toString("ascii");
      console.log(`[sim] registrado, código "${codigo}"`);
      sock.write(pacote808(0x0102, Buffer.from(codigo)));
      setInterval(() => sock.write(pacote808(0x0002, Buffer.alloc(0))), 20000);
      // posição: Santa Bárbara do Sul (aprox.), sul e oeste
      const pos = Buffer.alloc(28);
      pos.writeUInt32BE(0b1110, 4);
      pos.writeUInt32BE(28390000, 8);
      pos.writeUInt32BE(53250000, 12);
      pos.writeUInt16BE(456, 18);
      Buffer.from("261030160000", "hex").copy(pos, 22);
      sock.write(pacote808(0x0200, pos));
    } else if (m.id === 0x9101) {
      const c = m.corpo;
      const tamIp = c[0];
      const ip = c.subarray(1, 1 + tamIp).toString("ascii");
      const portaTcp = c.readUInt16BE(1 + tamIp);
      const canal = c[1 + tamIp + 4];
      const resp = Buffer.alloc(5);
      resp.writeUInt16BE(m.serial, 0);
      resp.writeUInt16BE(0x9101, 2);
      sock.write(pacote808(0x0001, resp));
      abrirVideo(ip, portaTcp, canal);
    } else if (m.id === 0x9102) {
      console.log("[sim] recebi 0x9102 (parar)");
      const resp = Buffer.alloc(5);
      resp.writeUInt16BE(m.serial, 0);
      resp.writeUInt16BE(0x9102, 2);
      sock.write(pacote808(0x0001, resp));
      pararVideo();
    }
  }
});
sock.on("close", () => { console.log("[sim] JT808 fechado"); process.exit(0); });
