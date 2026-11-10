# 🔐 Credenciais, Variáveis de Ambiente e Acessos Iniciais

Este documento detalha as variáveis de ambiente necessárias, boas práticas de segurança e os acessos de demonstração gerados pelo script de seed local (`src/db/seed.ts`).

> ⚠️ **IMPORTANTE PARA PRODUÇÃO**: Nunca envie o arquivo `.env` real para repositórios públicos no GitHub (ele já está listado no `.gitignore`). Ao publicar na **Vercel**, cadastre as variáveis diretamente na aba **Settings → Environment Variables** e **altere todas as senhas padrão e o `JWT_SECRET`**.

---

## 1. Variáveis de Ambiente (`.env.example`)

| Variável | Obrigatória | Valor Local Padrão | Como Obter em Produção (100% Gratuito) |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Sim | `file:./data/herdeiros.db` | Crie um banco gratuito em [turso.tech](https://turso.tech) e copie a URL `libsql://...`. |
| `DATABASE_AUTH_TOKEN` | Em produção | `""` (vazio local) | No painel/CLI do Turso, gere o token com `turso db tokens create <nome-db>`. |
| `JWT_SECRET` | Sim | String de desenvolvimento | Gere uma chave aleatória forte (mín. 32 caracteres), ex.: `openssl rand -base64 32`. |
| `NEXT_PUBLIC_APP_URL` | Recomendada | `http://localhost:3000` | URL final da aplicação (`https://herdeirosdeus.vercel.app`). |
| `NEXT_PUBLIC_CHURCH_NAME` | Opcional | `Igreja Bíblica Herdeiros de Deus` | Nome institucional da igreja. |
| `NEXT_PUBLIC_CHURCH_EMAIL` | Opcional | `contato@herdeirosdedeus.org` | E-mail público de contato. |
| `NEXT_PUBLIC_CHURCH_WHATSAPP` | Opcional | `5585999999999` | Número WhatsApp com DDI + DDD (Fortaleza - CE). |
| `CLOUDINARY_CLOUD_NAME` | Opcional | `""` | Crie conta gratuita em [cloudinary.com](https://cloudinary.com) para salvar fotos do Feed/Cursos na nuvem. |
| `CLOUDINARY_API_KEY` | Opcional | `""` | Copie no Dashboard do Cloudinary (API Keys). |
| `CLOUDINARY_API_SECRET` | Opcional | `""` | Copie no Dashboard do Cloudinary (API Keys). |

---

## 2. Credenciais Iniciais Criadas pelo Seed (`npm run db:seed`)

Ao executar `npm run db:seed` em um banco vazio, são criados 4 usuários iniciais para validação imediata de todos os perfis do sistema:

| Perfil (`role`) | Nome | E-mail | Senha Inicial | Painel Principal |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** (Administrador Principal) | Pr. Administrador Geral | `admin@herdeirosdedeus.org` | `Admin@2026` | `/admin` (Feed, Cultos, Contas, Contatos e Cursos) |
| **`TEACHER`** (Professor de Música) | Prof. Lucas Andrade | `lucas.musica@herdeirosdedeus.org` | `Professor@2026` | `/painel/cursos` (Estúdio Kiwify) |
| **`TEACHER`** (Professora de Música) | Profa. Rebeca Oliveira | `rebeca.musica@herdeirosdedeus.org` | `Professor@2026` | `/painel/cursos` (Estúdio Kiwify) |
| **`STUDENT`** (Aluno Demo) | Mateus Ferreira | `aluno@herdeirosdedeus.org` | `Aluno@2026` | `/cursos` (Acervo + Player com Progresso) |

---

## 3. Como Gerenciar Novos Professores com Segurança

1. Novos visitantes podem clicar em **Criar Conta Grátis** (`/cadastro`) — por segurança, essas contas sempre nascem com permissão **`STUDENT`**.
2. Para liberar acesso ao **Estúdio de Cursos (estilo Kiwify)** a um novo professor da igreja:
   - Entre no sistema como **Administrador Principal** (`admin@herdeirosdedeus.org`).
   - Acesse **Painel Admin → Aba "Usuários & Professores"** (`/admin`).
   - Você pode **promover um usuário existente** de `Aluno / Membro` para `Professor(a) de Música`, ou clicar em **Criar Conta de Professor / Usuário** para cadastrar um novo professor diretamente.
3. Depois de colocar o site no ar, acesse o painel de usuários ou altere a senha do Administrador e gere um novo `JWT_SECRET` em produção.

