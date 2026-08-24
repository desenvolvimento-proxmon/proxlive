# API de administração do PROXLIVE

Roda na mesma VPS do MediaMTX. É a única coisa que fala com a Control API dele
(`127.0.0.1:9997`) — o navegador nunca alcança o MediaMTX diretamente.

## Instalação na VPS

**1. Copiar os arquivos** para `/opt/proxlive-api` (via `git clone` ou `scp`) e instalar:

```
cd /opt/proxlive-api && npm install --omit=dev
```

**2. Gerar as credenciais:**

```
node hash-senha.js "SUA_SENHA_DE_ADMIN"
```
```
openssl rand -base64 48
```

**3. Criar o `.env`** a partir do `.env.example`, colando o hash e o segredo:

```
cp .env.example .env && nano .env
```

**4. Subir como serviço.** Crie `/etc/systemd/system/proxlive-api.service`:

```ini
[Unit]
Description=API do PROXLIVE
After=network.target mediamtx.service

[Service]
WorkingDirectory=/opt/proxlive-api
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
User=root
EnvironmentFile=/opt/proxlive-api/.env

[Install]
WantedBy=multi-user.target
```

```
systemctl daemon-reload && systemctl enable --now proxlive-api && systemctl status proxlive-api --no-pager
```

**5. Publicar no Nginx.** Dentro do `server { listen 443 ... }` de
`stream.proxlive.com.br`, antes do `location /` que aponta ao MediaMTX:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

A ordem importa: no Nginx, o `location` mais específico vence, mas manter
`/api/` acima deixa a intenção explícita para quem for ler depois.

```
nginx -t && systemctl reload nginx
```

**6. Testar:**

```
curl https://stream.proxlive.com.br/api/saude
```

Deve responder `{"ok":true}`.

## Rotas

| Método | Rota | Auth | Para quê |
|---|---|---|---|
| POST | `/api/login` | — | Devolve o token (validade 8h) |
| GET | `/api/cameras` | — | Lista pública; o site lê no build |
| GET | `/api/admin/cameras` | sim | Lista completa, com a URL de origem |
| POST | `/api/cameras` | sim | Cadastra: cria no MediaMTX e dispara o rebuild |
| DELETE | `/api/cameras/:slug` | sim | Remove dos dois lados |
| GET | `/api/status` | sim | Quem está no ar e quantos assistindo |
| POST | `/api/rebuild` | sim | Força um rebuild do site |

## Decisões de segurança

- **A senha nunca é guardada em texto** — só o hash bcrypt, no `.env`.
- **`GET /api/cameras` omite `sourceUrl`**, que carrega usuário e senha da
  câmera. Essa rota é pública; a URL de origem só sai pela rota autenticada.
- **A API escuta em `127.0.0.1`**, nunca em `0.0.0.0`. Quem publica é o Nginx,
  que traz o HTTPS junto.
- **`sourceUrl` só aceita `rtsp://` ou `rtsps://`**, para o campo não virar
  uma porta de entrada para outros protocolos.
- **Login com freio**: 8 tentativas por IP a cada 10 minutos, e a mensagem de
  erro não diz se o que errou foi o usuário ou a senha.
- **A escrita do JSON é atômica** (arquivo temporário + rename): uma queda no
  meio da gravação não corrompe o cadastro.
