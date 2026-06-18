# StudyPlanner AI

Aplicacao web em Next.js para gerar cronogramas de estudos personalizados com IA real, persistencia em PostgreSQL/Supabase Cloud e historico por usuario.

## Funcionalidades

- Login por e-mail e senha, com senha salva como hash no banco PostgreSQL/Supabase.
- Dashboard interno acessivel somente apos login.
- Criacao de varios planos de estudo por usuario em fluxo de conversa guiada.
- Geracao real de cronograma com OpenAI.
- Acompanhamento do andamento de cada plano por sessoes concluidas.
- Perguntas com IA sobre um plano especifico, usando o cronograma como contexto.
- Alteracao do cronograma via chat, com a IA reestruturando e salvando uma nova versao do plano.
- Historico com detalhes e exclusao de planos.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Supabase Cloud
- OpenAI API

## Como instalar

```bash
npm install
```

No Windows com PowerShell bloqueando scripts, use:

```bash
npm.cmd install
```

## Como configurar o ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres?schema=public"
OPENAI_API_KEY="sua_chave_aqui"
```

No Supabase, copie a string de conexao em:

```text
Project Settings > Database > Connection string
```

Use a conexao PostgreSQL do seu projeto e substitua a senha. A URL precisa comecar com `postgresql://`.

Opcionalmente, voce pode escolher outro modelo compativel com Chat Completions:

```env
OPENAI_MODEL="gpt-4o-mini"
```

O arquivo `.env.example` ja contem o formato esperado:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres?schema=public"
OPENAI_API_KEY="sua_chave_aqui"
OPENAI_MODEL="gpt-4o-mini"
```

## Como rodar o Prisma

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Para criar/sincronizar as tabelas no Supabase:

```bash
npm run prisma:push
```

Se preferir trabalhar com migrations versionadas:

```bash
npm run prisma:migrate -- --name init
```

Em ambiente de producao com migrations ja criadas:

```bash
npm run prisma:deploy
```

## Como iniciar o projeto

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Rotas principais

- `POST /api/users`
- `POST /api/study-plans/generate`
- `GET /api/study-plans?userId=`
- `GET /api/study-plans/[id]`
- `DELETE /api/study-plans/[id]`
- `PATCH /api/study-plans/[id]/progress`
- `GET /api/study-plans/[id]/ask`
- `POST /api/study-plans/[id]/ask`
- `POST /api/study-plans/[id]/revise`

## Observacoes

- A IA nao e simulada. A rota de geracao chama a OpenAI usando `OPENAI_API_KEY`.
- Se a chave nao estiver configurada, a API retorna uma mensagem amigavel.
- Se a IA retornar JSON invalido, a API responde com erro tratado.
- O usuario e salvo no `localStorage` para recuperar o historico no navegador.
- O arquivo antigo `prisma/dev.db` era o banco SQLite local. Com Supabase configurado no `.env`, ele nao e mais usado pela aplicacao.
