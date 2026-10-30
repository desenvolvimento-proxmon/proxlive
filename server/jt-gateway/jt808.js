/**
 * Protocolo JT/T 808 (2013 e 2019): o canal de comandos da câmera.
 *
 * A câmera abre uma conexão TCP com a gente e fica nela. Por esse canal ela
 * se registra, manda heartbeat e GPS, e recebe nossos pedidos de vídeo ao vivo
 * (0x9101) e de parar (0x9102).
 *
 * Formato do pacote no fio:
 *   0x7E | cabeçalho | corpo | checksum (XOR) | 0x7E
 * Dentro do pacote, 0x7E vira 0x7D 0x02 e 0x7D vira 0x7D 0x01.
 */

const ID = {
  RESPOSTA_TERMINAL: 0x0001,
  HEARTBEAT: 0x0002,
  REGISTRO: 0x0100,
  AUTENTICACAO: 0x0102,
  POSICAO: 0x0200,
  POSICAO_LOTE: 0x0704,
  RESPOSTA_PLATAFORMA: 0x8001,
  RESPOSTA_REGISTRO: 0x8100,
  INICIAR_AO_VIVO: 0x9101,
  CONTROLAR_AO_VIVO: 0x9102
};

/** Tira o escape (0x7D 0x02 → 0x7E, 0x7D 0x01 → 0x7D). */
function desescapar(buf) {
  const out = Buffer.alloc(buf.length);
  let j = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x7d && i + 1 < buf.length) {
      const prox = buf[i + 1];
      if (prox === 0x02) { out[j++] = 0x7e; i++; continue; }
      if (prox === 0x01) { out[j++] = 0x7d; i++; continue; }
    }
    out[j++] = buf[i];
  }
  return out.subarray(0, j);
}

function escapar(buf) {
  const partes = [];
  for (const b of buf) {
    if (b === 0x7e) partes.push(0x7d, 0x02);
    else if (b === 0x7d) partes.push(0x7d, 0x01);
    else partes.push(b);
  }
  return Buffer.from(partes);
}

function xor(buf) {
  let c = 0;
  for (const b of buf) c ^= b;
  return c;
}

/** BCD → texto de dígitos ("012345678901"). */
function bcdParaTexto(buf) {
  let s = "";
  for (const b of buf) s += (b >> 4).toString(16) + (b & 0x0f).toString(16);
  return s;
}

/** Normaliza o número do terminal para comparar com o cadastro. */
function normalizarTerminal(t) {
  return String(t || "").replace(/\D/g, "").replace(/^0+/, "");
}

/**
 * Separa os pacotes que chegaram no buffer TCP.
 * Devolve { mensagens, resto } — `resto` é o pedaço incompleto que fica
 * esperando o próximo `data`.
 */
function extrairPacotes(buffer) {
  const mensagens = [];
  let inicio = buffer.indexOf(0x7e);

  while (inicio !== -1) {
    const fim = buffer.indexOf(0x7e, inicio + 1);
    if (fim === -1) break;

    const bruto = buffer.subarray(inicio + 1, fim);
    if (bruto.length === 0) {
      // Dois 0x7E colados: o segundo é o início do próximo pacote.
      inicio = fim;
      continue;
    }

    const msg = decodificar(desescapar(bruto));
    if (msg) mensagens.push(msg);
    inicio = buffer.indexOf(0x7e, fim + 1);
  }

  const resto = inicio === -1 ? Buffer.alloc(0) : buffer.subarray(inicio);
  return { mensagens, resto };
}

function decodificar(pkt) {
  if (pkt.length < 13) return null;

  const checksum = pkt[pkt.length - 1];
  const dados = pkt.subarray(0, pkt.length - 1);
  if (xor(dados) !== checksum) return null;

  const id = dados.readUInt16BE(0);
  const props = dados.readUInt16BE(2);
  const tamanhoCorpo = props & 0x03ff;
  const subpacote = Boolean(props & 0x2000);
  const v2019 = Boolean(props & 0x4000);

  let o = 4;
  let versao = null;
  if (v2019) versao = dados[o++];

  const tamanhoTel = v2019 ? 10 : 6;
  const telBruto = Buffer.from(dados.subarray(o, o + tamanhoTel));
  o += tamanhoTel;

  const serial = dados.readUInt16BE(o);
  o += 2;
  if (subpacote) o += 4;

  const corpo = dados.subarray(o, o + tamanhoCorpo);

  return {
    id,
    serial,
    v2019,
    versao,
    telBruto,
    terminal: bcdParaTexto(telBruto),
    corpo: Buffer.from(corpo)
  };
}

/**
 * Monta um pacote da plataforma para a câmera, no mesmo formato de versão
 * e com o mesmo número de terminal que ela usou.
 */
function codificar(id, corpo, sessao, serial) {
  const cab = [];
  const props = (corpo.length & 0x03ff) | (sessao.v2019 ? 0x4000 : 0);

  const b = Buffer.alloc(4);
  b.writeUInt16BE(id, 0);
  b.writeUInt16BE(props, 2);
  cab.push(b);
  if (sessao.v2019) cab.push(Buffer.from([sessao.versao ?? 1]));
  cab.push(sessao.telBruto);

  const s = Buffer.alloc(2);
  s.writeUInt16BE(serial & 0xffff, 0);
  cab.push(s);

  const dados = Buffer.concat([...cab, corpo]);
  const comChecksum = Buffer.concat([dados, Buffer.from([xor(dados)])]);
  return Buffer.concat([Buffer.from([0x7e]), escapar(comChecksum), Buffer.from([0x7e])]);
}

/* -------------------------- corpos das mensagens -------------------------- */

function corpoRespostaGeral(serialResp, idResp, resultado = 0) {
  const b = Buffer.alloc(5);
  b.writeUInt16BE(serialResp, 0);
  b.writeUInt16BE(idResp, 2);
  b[4] = resultado;
  return b;
}

function corpoRespostaRegistro(serialResp, codigoAuth) {
  const b = Buffer.alloc(3);
  b.writeUInt16BE(serialResp, 0);
  b[2] = 0; // 0 = sucesso
  return Buffer.concat([b, Buffer.from(codigoAuth, "ascii")]);
}

/**
 * 0x9101: pede para a câmera abrir o vídeo ao vivo no nosso servidor de mídia.
 * tipoDados: 0 = áudio e vídeo, 1 = só vídeo. fluxo: 0 = principal, 1 = secundário.
 */
function corpoIniciarAoVivo({ host, portaTcp, portaUdp = 0, canal, tipoDados = 1, fluxo = 1 }) {
  const ip = Buffer.from(host, "ascii");
  const b = Buffer.alloc(1 + ip.length + 7);
  let o = 0;
  b[o++] = ip.length;
  ip.copy(b, o);
  o += ip.length;
  b.writeUInt16BE(portaTcp, o); o += 2;
  b.writeUInt16BE(portaUdp, o); o += 2;
  b[o++] = canal;
  b[o++] = tipoDados;
  b[o++] = fluxo;
  return b;
}

/** 0x9102 com comando 0: fecha o vídeo ao vivo daquele canal. */
function corpoPararAoVivo(canal) {
  return Buffer.from([canal, 0, 0, 0]);
}

/** Lê latitude/longitude/velocidade do 0x0200. */
function lerPosicao(corpo) {
  if (corpo.length < 28) return null;
  const status = corpo.readUInt32BE(4);
  let lat = corpo.readUInt32BE(8) / 1e6;
  let lon = corpo.readUInt32BE(12) / 1e6;
  if (status & (1 << 2)) lat = -lat; // bit 2: latitude sul
  if (status & (1 << 3)) lon = -lon; // bit 3: longitude oeste
  return {
    latitude: lat,
    longitude: lon,
    velocidadeKmh: corpo.readUInt16BE(18) / 10,
    direcao: corpo.readUInt16BE(20),
    gps: Boolean(status & (1 << 1)),
    horario: bcdParaTexto(corpo.subarray(22, 28))
  };
}

module.exports = {
  ID,
  extrairPacotes,
  codificar,
  corpoRespostaGeral,
  corpoRespostaRegistro,
  corpoIniciarAoVivo,
  corpoPararAoVivo,
  lerPosicao,
  normalizarTerminal,
  bcdParaTexto,
  // usados pelo simulador de testes
  _interno: { escapar, desescapar, xor, decodificar }
};
