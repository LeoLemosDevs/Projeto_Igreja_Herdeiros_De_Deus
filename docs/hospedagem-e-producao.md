# 🌐 Hospedagem, Banco de Dados em Produção e Roteiro de Segurança

Este documento registra toda a infraestrutura ativa do **protótipo online para apresentação ao cliente** da **Igreja Bíblica Herdeiros de Deus**, incluindo onde está hospedado, como gerenciar o banco na nuvem, onde ficam as chaves/tokens e o plano de ampliação de segurança quando o projeto for aprovado em definitivo.

---

## 1. Resumo da Infraestrutura Ativa (Custo R\$ 0,00)

| Componente | Provedor (Plano) | Identificação / Endpoint |
| :--- | :--- | :--- |
| **Site em Produção (Frontend + API)** | **Vercel** (Hobby Free) | **https://herdeirosdeus.vercel.app** |
| **Projeto na Vercel** | Team `leo` → Projeto `herdeirosdeus` | Deploy automático conectado à branch `main` do GitHub |
| **Código-Fonte / Versionamento** | **GitHub** | https://github.com/LeoLemosDevs/Projeto_Igreja_Herdeiros_De_Deus |
| **Banco de Dados em Nuvem** | **Turso Cloud** (Starter Free — 9 GB) | Conta `leolemosdevs` → Banco **`herdeiros-de-deus`** |
| **Região do Banco** | AWS São Paulo (`aws-sa-east-1`) | Baixa latência para Fortaleza - CE e todo o Brasil |
| **Endpoint LibSQL do Banco** | Turso | `libsql://herdeiros-de-deus-leolemosdevs.aws-sa-east-1.turso.io` |
| **Health Check Online** | Endpoint Next.js | `https://herdeirosdeus.vercel.app/api/health` |

---

## 2. Configuração de Variáveis de Ambiente na Vercel

No painel da Vercel (**`herdeirosdeus` → `Settings` → `Environment Variables`**), o ambiente **`Production`** utiliza as seguintes chaves:

| Variável | Valor / Formato | Observações |
| :--- | :--- | :--- |
| `DATABASE_URL` | `libsql://herdeiros-de-deus-leolemosdevs.aws-sa-east-1.turso.io` | URL do banco no Turso em São Paulo. |
| `DATABASE_AUTH_TOKEN` | Token JWT com permissão **`Read & Write`** (`"a":"rw"`) e expiração `Never` | **Nunca versionar no GitHub público!** O valor ativo está salvo na Vercel e em cópia local privada em `.env.producao.local` (ignorado pelo `.gitignore`). |
| `JWT_SECRET` | Frase secreta forte de assinatura dos cookies de sessão | Deve ser alterada e mantida privada ao migrar para produção definitiva. |

> ⚠️ **Regra de Ouro da Vercel:** Sempre que editar ou adicionar uma variável em *Environment Variables*, acesse **Deployments → `...` → Redeploy** para que o servidor passe a usar o novo valor.

> 💡 **Dica de Navegador:** Ao usar os painéis da **Turso** ou da **Vercel**, mantenha a **tradução automática do Chrome/Edge desativada** nesses sites para evitar exceções de DOM no React (`Application error`).

---

## 3. Como Gerenciar o Banco de Dados na Nuvem (Turso)

1. **Painel Visual Web (equivalente ao phpMyAdmin):**
   - Acesse **https://app.turso.tech** → entre com GitHub (`leolemosdevs`) → clique em **`herdeiros-de-deus`**.
   - Clique na aba **`Edit Data`** no topo para navegar pelas 10 tabelas, visualizar registros, editar textos ou excluir linhas diretamente no navegador.
2. **Gerar ou Revogar Tokens (`DATABASE_AUTH_TOKEN`):**
   - Na aba **`Overview`** do banco `herdeiros-de-deus`, clique em **`+ Create Token`**.
   - Sempre selecione **`Read & Write`** (tokens `Read-Only` impedem cadastros, postagens e progresso de aulas).
3. **Como Rodar Drizzle Studio Localmente Conectado ao Turso:**
   ```powershell
   # Carrega temporariamente a URL e o Token do arquivo local privado e abre o editor visual
   npx drizzle-kit studio
   ```
   *(Configure `DATABASE_URL` e `DATABASE_AUTH_TOKEN` na sessão do PowerShell ou copie de `.env.producao.local` para `.env` temporariamente — nunca suba `.env` para o GitHub).*

---

## 4. Backup Local das Credenciais Privadas

Por segurança, tokens reais (`DATABASE_AUTH_TOKEN` e `JWT_SECRET` de produção) **não devem ficar em arquivos `.md` públicos no GitHub**. Nesta máquina de desenvolvimento, foi salvo um backup privado em:
- **`.env.producao.local`** *(ignorado automaticamente pelo `.gitignore` via regra `.env*.local`)*.

---

## 5. Checklist de Ampliação de Segurança (Quando o Cliente Aprovar)

Como esta entrega atual é um **protótipo completo para apresentação ao cliente**, algumas facilidades de demonstração foram mantidas ativas. Ao receber a confirmação do cliente para uso oficial pela igreja, execute este checklist:

- [ ] **Remover botões de preenchimento demo no Login:** Em [`src/app/login/page.tsx`](../src/app/login/page.tsx), remover a seção `"Contas de Demonstração (Seed Local)"`.
- [ ] **Rotacionar Tokens e Segredos:**
  - Gerar um **novo `DATABASE_AUTH_TOKEN`** (`Read & Write`) no painel do Turso e **revogar** o token antigo usado durante a etapa de protótipo.
  - Gerar um novo `JWT_SECRET` aleatório (`openssl rand -base64 48`) na Vercel.
- [ ] **Trocar Senhas Padrão do Seed:** Alterar a senha do Administrador (`admin@herdeirosdedeus.org`), dos Professores e remover/desativar a conta `aluno@herdeirosdedeus.org`.
- [ ] **Adicionar Troca de Senha e Recuperação:** Implementar tela de "Alterar Minha Senha" para usuários logados e redefinição de senha por e-mail (ex.: Resend Free Tier).
- [ ] **Proteger ou Remover `/api/health`:** Restringir ou simplificar [`src/app/api/health/route.ts`](../src/app/api/health/route.ts) para não expor contagem de usuários ou detalhes técnicos.
- [ ] **Upload de Fotos em Nuvem:** Configurar conta gratuita do **Cloudinary** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) na Vercel para que o Admin suba fotos direto do computador/celular em produção.
- [ ] **Rate Limiting & Auditoria:** Adicionar limite de tentativas em `/api/auth/login` e `/api/contact`.
- [ ] **Domínio Oficial da Igreja:** Conectar domínio próprio (ex.: `herdeirosdedeus.org.br`) em **Vercel → Project Settings → Domains**.
