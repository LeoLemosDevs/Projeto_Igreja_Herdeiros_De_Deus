# 🚀 Guia de Deploy 100% Gratuito (Produção)

Este guia detalha o passo a passo completo para publicar o site da **Igreja Bíblica Herdeiros de Deus** na internet com **custo R\$ 0,00**, utilizando apenas planos gratuitos permanentes.

---

## 1. Banco de Dados Gratuito no Turso

1. Acesse [https://turso.tech](https://turso.tech) e crie sua conta gratuita com o GitHub.
2. Crie um banco de dados chamado `herdeiros-de-deus` (região mais próxima, ex.: `gru` São Paulo).
3. Copie:
   - **`DATABASE_URL`**: `libsql://herdeiros-de-deus-<seu-usuario>.turso.io`
   - **`DATABASE_AUTH_TOKEN`**: Token de acesso gerado no painel do Turso (ou via CLI `turso db tokens create herdeiros-de-deus`).
4. No seu terminal local, aplique as tabelas e o seed inicial apontando para o Turso:
   ```powershell
   $env:DATABASE_URL="libsql://herdeiros-de-deus-seuusuario.turso.io"
   $env:DATABASE_AUTH_TOKEN="seu_token_aqui"
   npx drizzle-kit push
   npm run db:seed
   ```

---

## 2. Armazenamento Gratuito de Fotos (Opcional — Cloudinary)

Localmente, o upload de fotos salva automaticamente em `public/uploads/`. Como a hospedagem gratuita Serverless da Vercel possui sistema de arquivos somente-leitura em execução, configure o **Cloudinary Free** (25 GB gratuitos) para enviar fotos diretamente pelo Painel Admin em produção:

1. Crie uma conta gratuita em [https://cloudinary.com](https://cloudinary.com).
2. No **Dashboard**, copie `Cloud Name`, `API Key` e `API Secret`.
3. Adicione essas 3 variáveis na Vercel (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
   - *Observação*: Caso prefira não configurar o Cloudinary agora, o Administrador e os Professores podem colar links públicos de imagens (ex.: Google Drive, Imgur, GitHub, etc.) normalmente nos formulários.

---

## 3. Hospedagem Gratuita na Vercel

1. Crie um repositório gratuito no **GitHub** e envie este projeto:
   ```bash
   git init
   git add .
   git commit -m "Portal Igreja Biblica Herdeiros de Deus"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/igreja-herdeiros-de-deus.git
   git push -u origin main
   ```
2. Acesse [https://vercel.com](https://vercel.com) com sua conta do GitHub e clique em **Add New → Project**.
3. Selecione o repositório e configure as **Environment Variables**:
   - `DATABASE_URL`
   - `DATABASE_AUTH_TOKEN`
   - `JWT_SECRET` *(gere uma chave nova e forte!)*
   - `NEXT_PUBLIC_APP_URL` *(ex.: `https://herdeiros-de-deus.vercel.app`)*
   - *(Opcional)* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Clique em **Deploy**. Em menos de 2 minutos o site estará no ar com HTTPS automático!

---

## 4. Domínio Gratuito

- **Opção 1 (Automática e instantânea)**: Use o domínio gratuito da Vercel (ex.: `https://igreja-herdeiros-de-deus.vercel.app`).
- **Opção 2 (Subdomínio comunitário gratuito `eu.org`)**: Solicite um domínio em `https://nic.eu.org`, configure os nameservers gratuitos no **Cloudflare Free** e crie um registro `CNAME` apontando para `cname.vercel-dns.com`.
- **Opção 3 (DuckDNS gratuito)**: Crie `herdeirosdedeus.duckdns.org` e aponte para a Vercel caso queira um endereço memorável gratuito.

