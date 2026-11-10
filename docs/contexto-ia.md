# 🤖 Guia de Contexto para Continuidade com IA

Este documento foi criado para servir como **memória técnica completa** caso você retome este projeto no futuro com outra ferramenta ou sessão de Inteligência Artificial após a aprovação do cliente.

---

## 1. Visão Geral do Projeto

- **Cliente / Instituição:** Igreja Bíblica Herdeiros de Deus
- **Endereço Oficial:** Rua A, nº 90 — Conjunto Jaciara, Barra do Ceará, Fortaleza - CE, CEP `60330-820`
- **Referência Visual / Estrutural:** `https://www.vitoriaemcristo.org/` (paleta `#f7941d`, `#fcaf3d`, `#fbab00`, `#243e4f`, `#182b38`; títulos `.avec-section-title`; header de 2 camadas com mega-menu)
- **Repositório GitHub:** `https://github.com/LeoLemosDevs/Projeto_Igreja_Herdeiros_De_Deus` (`main`)
- **URL Online (Protótipo):** `https://herdeirosdeus.vercel.app`
- **Banco de Dados Online:** Turso (`libsql://herdeiros-de-deus-leolemosdevs.aws-sa-east-1.turso.io`)

---

## 2. Stack e Versões Exatas (`package.json`)

- **Framework:** `next@^16.4.6`, `react@^19.3.1`, `react-dom@^19.3.1`
- **Linguagem & Estilo:** `typescript@^5.9.3`, `tailwindcss@^4.3.5`, `@tailwindcss/postcss@^4.3.5`, `lucide-react@^1.71.0`
- **Banco & ORM:** `drizzle-orm@^0.45.4`, `drizzle-kit@^0.31.11`, `@libsql/client@^0.18.0`
- **Auth & Validação:** `jose@^6.2.17` (JWT HS256 em cookie `HttpOnly`), `bcryptjs@^3.0.3`, `zod@^4.6.7`

---

## 3. Decisões Arquiteturais e Armadilhas Já Resolvidas

Se uma IA for continuar mexendo neste código, **mantenha estas soluções já testadas**:

1. **Build com `--webpack` no `package.json` (`next dev --webpack` e `next build --webpack`):**
   - No Next.js 16 no Windows (`D:\`), o Turbopack falhava ao criar junctions para `serverExternalPackages: ["@libsql/client"]` (`os error 1392`). O flag `--webpack` resolve 100% tanto localmente quanto na Vercel Linux.
2. **Driver Híbrido Local vs Produção (`src/db/index.ts`):**
   - Quando `DATABASE_URL` começa com `file:` (desenvolvimento local), carrega `@libsql/client` + `drizzle-orm/libsql`.
   - Quando `DATABASE_URL` aponta para `libsql://` ou `https://` (Turso na Vercel), usa `@libsql/client/web` + `drizzle-orm/libsql/web` (HTTP/Web puro, zero binários nativos C++).
   - A função `cleanEnv()` faz `.trim()` e remove aspas acidentais das env vars.
3. **Bootstrap Automático do Banco (`src/db/bootstrap.ts`):**
   - `ensureDatabaseReady()` verifica se a tabela `users` existe e tem registros; caso o banco esteja vazio, cria todas as 10 tabelas e índices via `client.batch(..., "write")` e executa `seedDatabase(false)`.
   - Atenção: para evitar importação circular entre `auth.ts` e `seed.ts`, o hash/verificação de senha com `bcryptjs` fica isolado em `src/lib/password.ts`.
4. **Identidade e Localização Centralizadas (`src/lib/church-info.ts`):**
   - Nome, logo oficial (`/img/logo_transparente_*.png` copiada de `img/` para `public/img/`), endereço completo, CEP `60330-820`, embed gratuito do Google Maps e links de rota GPS (Google Maps + Waze) estão centralizados em `CHURCH_INFO`.
5. **Parser Multi-plataforma de Vídeos (`src/lib/video.ts`):**
   - Converte links do YouTube, Google Drive (`/file/d/{id}/view` -> `/preview`), Vimeo e MP4 para embed responsivo em `src/components/VideoPlayer.tsx`.
6. **Upload de Fotos Híbrido (`src/app/api/upload/route.ts`):**
   - Se `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` estiverem no `.env`, assina com SHA-1 e envia para o Cloudinary Free. Caso contrário, grava localmente em `public/uploads/`.

---

## 4. Mapa de Arquivos Principais

- `src/db/schema.ts` — 10 tabelas Drizzle (`users`, `feed_posts`, `worship_schedules`, `courses`, `course_modules`, `course_lessons`, `course_enrollments`, `lesson_progress`, `contact_messages`, `newsletter_subscribers`)
- `src/db/seed.ts` — Dados iniciais (4 contas demo, 6 cultos, 4 posts do feed, 3 cursos com módulos e aulas)
- `src/lib/auth.ts` — Cookie `herdeiros_session`, `getSessionUser()`, `requireRole()`
- `src/components/KiwifyCoursePlayer.tsx` — Player de aluno estilo Kiwify (barra de progresso, anotações, próxima aula)
- `src/components/CourseBuilderKiwify.tsx` — Estúdio do professor estilo Kiwify (módulos, aulas, reordenação, preview de vídeo)
- `src/components/admin/AdminDashboard.tsx` — Painel Admin (Feed completo, Programação de Cultos, Contas/Professores, Contatos/Newsletter)

---

## 5. Prompt Pronto para Colar em Uma Nova Sessão de IA

Quando o cliente aprovar o projeto e você quiser continuar desenvolvendo com outra IA, copie e cole este prompt:

> *"Estou retomando o projeto `Projeto_Igreja_Herdeiros_De_Deus` (Next.js 16 + TypeScript + Tailwind v4 + Drizzle ORM + LibSQL/Turso na Vercel). Leia primeiro os arquivos `docs/README.md`, `docs/hospedagem-e-producao.md`, `docs/contexto-ia.md`, `src/db/schema.ts` e `src/lib/auth.ts`. O protótipo já está online em `https://herdeirosdeus.vercel.app` usando Turso. Agora o cliente aprovou e quero: [DESCREVA AQUI AS NOVAS FUNCIONALIDADES OU O CHECKLIST DE SEGURANÇA DE `docs/hospedagem-e-producao.md`]."*
