/**
 * Protocolo JT/T 1078: o canal de vídeo.
 *
 * Depois do 0x9101, a câmera abre uma segunda conexão TCP com o servidor de
 * mídia e manda o vídeo em pacotes de até ~950 bytes. Cada quadro grande vem
 * picado em vários pacotes (primeiro / meio / último), que aqui são remontados.
 *
 * Cabeçalho (2013 usa SIM de 6 bytes; 2019 usa 10):
 *   "01cd" (0x30316364) | V/P/X/CC | M/PT | serial(2) | SIM(BCD) | canal |
 *   tipo+subpacote | [timestamp(8)] | [intervalo I(2) | intervalo quadro(2)] |
 *   tamanho(2) | corpo
 */

const MAGICO = Buffer.from([0x30, 0x31, 0x63, 0x64]);

const TIPO = { I: 0, P: 1, B: 2, AUDIO: 3, TRANSPARENTE: 4 };
const MARCA = { ATOMICO: 0, PRIMEIRO: 1, ULTIMO: 2, MEIO: 3 };

/** Tipo de carga (PT) → codec de vídeo. */
const CODEC = { 98: "h264", 99: "hevc" };

function bcdValido(buf) {
  for (const b of buf) if ((b >> 4) > 9 || (b & 0x0f) > 9) return false;
  return true;
}

function bcdParaTexto(buf) {
  let s = "";
  for (const b of buf) s += (b >> 4).toString() + (b & 0x0f).toString();
  return s;
}

/**
 * Tenta ler um pacote a partir de `o`, com SIM de `tamSim` bytes.
 * Devolve o pacote, "incompleto" ou null (não faz sentido com esse tamanho).
 */
function tentarLer(buf, o, tamSim) {
  let p = o + 4; // pula "01cd"
  if (buf.length < p + 4 + tamSim + 2) return "incompleto";

  const pt = buf[p + 1] & 0x7f;
  const serial = buf.readUInt16BE(p + 2);
  p += 4;

  const sim = buf.subarray(p, p + tamSim);
  if (!bcdValido(sim)) return null;
  p += tamSim;

  const canal = buf[p++];
  const tipoMarca = buf[p++];
  const tipo = tipoMarca >> 4;
  const marca = tipoMarca & 0x0f;
  if (canal < 1 || canal > 37 || tipo > 4 || marca > 3) return null;

  let timestamp = null;
  if (tipo !== TIPO.TRANSPARENTE) {
    if (buf.length < p + 8) return "incompleto";
    timestamp = Number(buf.readBigUInt64BE(p));
    p += 8;
  }
  if (tipo <= TIPO.B) {
    if (buf.length < p + 4) return "incompleto";
    p += 4; // intervalos (não usados)
  }

  if (buf.length < p + 2) return "incompleto";
  const tamanho = buf.readUInt16BE(p);
  p += 2;
  if (tamanho > 2048) return null;
  if (buf.length < p + tamanho) return "incompleto";

  return {
    pt,
    serial,
    sim: bcdParaTexto(sim),
    canal,
    tipo,
    marca,
    timestamp,
    corpo: buf.subarray(p, p + tamanho),
    fim: p + tamanho
  };
}

/**
 * Leitor de uma conexão de mídia. Descobre sozinho se a câmera usa SIM de
 * 6 ou 10 bytes e chama `aoQuadro` com cada quadro de vídeo já remontado.
 */
class LeitorJT1078 {
  constructor(aoQuadro) {
    this.aoQuadro = aoQuadro;
    this.buf = Buffer.alloc(0);
    this.tamSim = null;
    this.montando = new Map(); // canal → partes do quadro em montagem
    this.sim = null;
  }

  alimentar(dados) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, dados]) : dados;
    let o = 0;

    while (true) {
      const ini = this.buf.indexOf(MAGICO, o);
      if (ini === -1) {
        // Guarda os 3 últimos bytes: o "01cd" pode ter vindo partido.
        o = Math.max(o, this.buf.length - 3);
        break;
      }

      const pkt = this.lerPacote(ini);
      if (pkt === "incompleto") { o = ini; break; }
      if (!pkt) { o = ini + 1; continue; } // lixo: procura o próximo "01cd"

      this.sim = pkt.sim;
      this.tratar(pkt);
      o = pkt.fim;
    }

    this.buf = Buffer.from(this.buf.subarray(o));
  }

  lerPacote(ini) {
    if (this.tamSim) return tentarLer(this.buf, ini, this.tamSim);

    // Primeiro pacote: testa 2013 (6) e 2019 (10) e fica com o que fecha
    // certinho com o próximo "01cd" (ou com o fim do buffer).
    for (const tam of [6, 10]) {
      const p = tentarLer(this.buf, ini, tam);
      if (!p || p === "incompleto") continue;
      const seguinte = this.buf.subarray(p.fim, p.fim + 4);
      if (seguinte.length === 0 || (seguinte.length === 4 && seguinte.equals(MAGICO))) {
        this.tamSim = tam;
        return p;
      }
    }
    // Ainda não deu para decidir: espera mais dados (até um limite).
    return this.buf.length - ini < 4096 ? "incompleto" : null;
  }

  tratar(pkt) {
    if (pkt.tipo > TIPO.B) return; // áudio e dados transparentes: ignorados

    const chave = pkt.canal;
    if (pkt.marca === MARCA.ATOMICO) {
      this.entregar(pkt, [pkt.corpo]);
      return;
    }
    if (pkt.marca === MARCA.PRIMEIRO) {
      this.montando.set(chave, { inicio: pkt, partes: [Buffer.from(pkt.corpo)] });
      return;
    }

    const m = this.montando.get(chave);
    if (!m) return; // perdemos o começo do quadro: descarta
    m.partes.push(Buffer.from(pkt.corpo));

    if (pkt.marca === MARCA.ULTIMO) {
      this.montando.delete(chave);
      this.entregar(m.inicio, m.partes);
    }
  }

  entregar(cab, partes) {
    this.aoQuadro({
      sim: cab.sim,
      canal: cab.canal,
      codec: CODEC[cab.pt] || null,
      pt: cab.pt,
      chave: cab.tipo === TIPO.I,
      timestamp: cab.timestamp,
      dados: Buffer.concat(partes)
    });
  }
}

module.exports = { LeitorJT1078, MAGICO, TIPO, MARCA, CODEC };
