# Ponte JT808/1078 do PROXLIVE (câmeras veiculares em chip 4G)

Câmera em chip 4G fica atrás de CGNAT: o MediaMTX não consegue buscar o
vídeo nela por RTSP. Esta ponte inverte o caminho: **a câmera liga para a VPS**
pelo protocolo JT/T 808/1078 (o "JT_1…JT_4" do menu Platform Access da
Hikvision G40 PRO), e a ponte entrega o vídeo ao MediaMTX.

```
Câmera ──JT808, porta 7611 (comandos, GPS)──▶ ponte
Câmera ──JT1078, porta 7612 (vídeo)─────────▶ ponte ──ffmpeg/RTMP──▶ MediaMTX ──HLS──▶ site
```

O vídeo só é pedido à câmera **quando alguém está assistindo**. O primeiro
espectador faz o MediaMTX rodar o `demanda.js`, que pede o vídeo à ponte; quando
o último sai, a câmera recebe a ordem de parar. Isso poupa o plano de dados
(1 Mbps ligado o dia todo dá cerca de 10 GB por dia).

Não tem dependências de npm: só Node 18+ e `ffmpeg`.

## 1. Verificar e abrir as portas

A câmera precisa alcançar a VPS em **duas portas TCP: 7611 e 7612**.

**a) Ver se estão livres** (não deve aparecer nada):

```
ss -tlnp | grep -E ':7611|:7612'
```

**b) Liberar no firewall da VPS** (se usar UFW; `ufw status` mostra se está ativo):

```
ufw allow 7611/tcp && ufw allow 7612/tcp
```

**c) Liberar no painel da hospedagem.** Hostinger, Contabo, AWS, Oracle e
outras têm um firewall próprio ("Security Group", "Firewall", "Regras de
entrada"). Adicione TCP 7611 e TCP 7612 vindos de qualquer origem.

**d) Testar de fora** (depois do passo 3, com a ponte rodando), de um PC fora da VPS:

- Windows (PowerShell): `Test-NetConnection IP_DA_VPS -Port 7611`
- Linux/Mac: `nc -vz IP_DA_VPS 7611`

Se der "TcpTestSucceeded: True" / "succeeded" nas duas portas, está pronto.

> **Cuidado com Cloudflare:** se `stream.proxlive.com.br` passa pelo proxy da
> Cloudflare (nuvem laranja), ele não deixa passar TCP nessas portas. Use o
> **IP da VPS** na câmera e no `JT1078_HOST_PUBLICO`, ou um subdomínio
> "DNS only" (nuvem cinza), por exemplo `jt.proxlive.com.br`.

## 2. Instalar na VPS

```
mkdir -p /opt/proxlive-jt
cp -r server/jt-gateway/* /opt/proxlive-jt/
cp server/jt-gateway/.env.example /opt/proxlive-jt/.env
nano /opt/proxlive-jt/.env
```

No `.env`, preencha pelo menos:

- `JT1078_HOST_PUBLICO`: IP público da VPS (ou o subdomínio "DNS only").
- `PUBLICAR_SENHA`: a senha do usuário `publisher` do `mediamtx.yml`, a mesma
  das câmeras RTMP.

Confira que o `ffmpeg` existe: `ffmpeg -version`. Se não existir:
`apt install -y ffmpeg`.

## 3. Subir como serviço

Crie `/etc/systemd/system/proxlive-jt.service`:

```ini
[Unit]
Description=Ponte JT808/1078 do PROXLIVE
After=network.target mediamtx.service

[Service]
WorkingDirectory=/opt/proxlive-jt
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
EnvironmentFile=/opt/proxlive-jt/.env

[Install]
WantedBy=multi-user.target
```

```
systemctl daemon-reload && systemctl enable --now proxlive-jt
journalctl -u proxlive-jt -f
```

Deve aparecer `JT808 (comandos) ouvindo na porta 7611`.

## 4. Configurar a câmera (G40 PRO)

Na interface web dela, aba **Platform Access**:

| Campo | Valor |
|---|---|
| Enable | marcado |
| Platform Access Mode | **JT_1** |
| Server Address | IP da VPS (ou o subdomínio "DNS only") |
| Server Port | **7611** |
| Device ID / número do terminal | anote: é o `terminal` do cadastro |
| Versão do protocolo | 2013 ou 2019; a ponte aceita as duas |

Salve e espere o **Register Status** mudar para **Online**. Na VPS, confira:

```
curl -s 127.0.0.1:3002/estado
```

A câmera aparece em `cameras`, com o número do terminal e a última posição de GPS.

**Vídeo:** no stream secundário (sub stream) da câmera, use **H.264**
(navegador não toca H.265 por HLS), 640×360 ou 1280×720, 10 a 15 fps,
512 a 768 kbps. A ponte pede o stream secundário por padrão.

## 5. Cadastrar no PROXLIVE

Com o token do `/api/login`:

```
curl -X POST https://stream.proxlive.com.br/api/cameras \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "slug": "carro-01",
    "name": "Câmera do carro",
    "location": "Em movimento",
    "city": "Santa Bárbara do Sul",
    "latitude": -28.39, "longitude": -53.25,
    "tipo": "jt1078",
    "terminal": "012345678901",
    "canal": 1,
    "fluxo": 1
  }'
```

- `terminal`: o Device ID da câmera (zeros à esquerda não importam).
  **Só terminais cadastrados aqui conseguem abrir sessão na ponte.** Se você
  não sabe o Device ID, ligue a câmera apontando para esta VPS e leia o log: o
  número aparece na linha `Recusei o terminal ...`, pronto para cadastrar. O
  cadastro é relido sozinho, sem reiniciar o serviço.
- `canal`: 1 = câmera frontal, 2 = traseira/interna.
- `fluxo`: 1 = secundário (recomendado no 4G), 0 = principal.

A API cria o path no MediaMTX já com o `runOnDemand` apontando para
`/opt/proxlive-jt/demanda.js`. Se o Node não estiver em `/usr/bin/node`, ajuste
`JT_DEMANDA_CMD` no `.env` da API.

Por fim, coloque a câmera no `src/lib/proxlive-data.ts` com
`streamUrl: "https://stream.proxlive.com.br/carro-01/index.m3u8"`, como as outras.

## 6. Testar

Abra a página da câmera. A **primeira imagem demora de 5 a 20 s**: a câmera
recebe o pedido, abre a conexão pelo 4G e espera o próximo quadro-chave. No log
(`journalctl -u proxlive-jt -f`) aparece:

```
Pedido de vídeo ao vivo: carro-01 ...
Vídeo de carro-01 chegando de ...
Publicando carro-01 (h264) no MediaMTX
```

Feche a página: uns 20 s depois aparece `Transmissão encerrada: carro-01 (sem espectadores)`.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Register Status fica Offline | Porta 7611 fechada (passo 1), endereço errado ou chip sem dados |
| `Câmera offline` no log do MediaMTX | A câmera não está conectada no JT808; veja `/estado` |
| `câmera não abriu o vídeo` | Porta 7612 fechada, ou `JT1078_HOST_PUBLICO` errado ou atrás da Cloudflare |
| `câmera recusou 0x9101` | Canal inexistente; tente `canal` 1 |
| `Codec desconhecido` / tela preta no navegador | Stream em H.265: mude o sub stream para H.264 |
| `Vídeo não solicitado` | O `terminal` do cadastro não bate com o Device ID da câmera |
| `Recusei o terminal N` | Esse Device ID não está no `cameras.json`. Cadastre-o (passo 5) ou confira se digitou certo |
| Nenhuma câmera conecta, log diz `Não consegui ler` | `DATA_FILE` aponta para o lugar errado. Sem cadastro legível a ponte não aceita ninguém, de propósito |

Para ver tudo o que a câmera manda: `LOG=debug` no `.env` e
`systemctl restart proxlive-jt`.

## Testar sem a câmera

`teste/simulador.js` finge ser a câmera (registro, GPS e vídeo JT1078):

```
ffmpeg -f lavfi -i testsrc=size=640x360:rate=15 -t 10 -c:v libx264 -g 30 -bf 0 -f h264 video.h264
node teste/simulador.js video.h264 127.0.0.1 7611 012345678901 2013 15
```

## Segurança

As portas 7611 e 7612 ficam abertas para a internet por necessidade: a câmera
vive atrás de CGNAT, então é ela que liga para cá. Por isso a ponte não confia
em quem conecta:

- Só abre sessão para **terminal que está no `cameras.json`**; qualquer outro é
  desconectado na primeira mensagem, com o número registrado no log.
- Só aceita vídeo de câmera que **foi pedida**: conexão de vídeo sem pedido é fechada.
- O controle (`/iniciar`, `/parar`, `/estado`) só escuta em `127.0.0.1`.
- O número do terminal não sai na rota pública `GET /api/cameras`.
- O áudio não é pedido (`tipoDados = 1`): o site toca sem som, e isso economiza dados.

Vale somar a isso uma regra de firewall limitando as duas portas à faixa de IPs
da operadora do chip — a conferência do terminal já barra o acesso, mas o
firewall evita até o custo de tratar a conexão.
