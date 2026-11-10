# 🛠️ Tecnologias Utilizadas e Infraestrutura 100% Gratuita

Este documento descreve a stack de desenvolvimento adotada no portal da **Igreja Bíblica Herdeiros de Deus** e explica como publicar todo o sistema com **custo mensal de R\$ 0,00**.

---

## 1. Stack Tecnológica

### Frontend & Full-Stack Framework
- **Next.js (`^16.4.6`)** — App Router com React Server Components, rotas dinâmicas e API Routes integradas no mesmo repositório.
- **React (`^19.3.1`) & React DOM (`^19.3.1`)** — Biblioteca de interface para páginas interativas (player estilo Kiwify, construtor de cursos e painel administrativo).
- **TypeScript (`^5.9.3`)** — Tipagem estática ponta a ponta entre banco de dados, API e interface.
- **Tailwind CSS (`^4.3.5`) & `@tailwindcss/postcss` (`^4.3.5`)** — Estilização responsiva inspirada na paleta institucional da referência (`vitoriaemcristo.org`): Laranja `#f7941d`, Âmbar `#fcaf3d` e Azul Petróleo `#243e4f`.
- **Lucide React (`^1.71.0`)** — Biblioteca de ícones leves e padronizados.

### Backend, Validação & Segurança
- **Next.js Route Handlers (`src/app/api/**`)** — Endpoints REST em TypeScript executados no servidor.
- **Zod (`^4.6.7`)** — Validação rigorosa de entradas nos formulários e APIs.
- **`jose` (`^6.2.17`)** — Assinatura e verificação de tokens JWT (`HS256`) em cookies `HttpOnly`.
- **`bcryptjs` (`^3.0.3`)** — Hashing seguro de senhas com salt antes de persistir no banco.

### Banco de Dados & ORM
- **Drizzle ORM (`^0.45.4`) & Drizzle Kit (`^0.31.11`)** — ORM TypeScript leve, sem engine binária pesada, compatível com Serverless.
- **`@libsql/client` (`^0.18.0`)** — Driver oficial compatível com **SQLite local** (`file:./data/herdeiros.db`) em desenvolvimento e **Turso (LibSQL)** em produção na nuvem sem alterar uma linha de código.

---

## 2. Arquitetura 100% Gratuita (R\$ 0,00/mês)

| Camada | Serviço Gratuito Recomendado | Limite Gratuito (Free Tier) | Observações |
| :--- | :--- | :--- | :--- |
| **Aplicação Web (Front + Back)** | **Vercel (Plano Hobby)** | Deploy automático via GitHub, HTTPS gratuito, 100 GB bandwidth/mês | Ideal para igrejas e projetos sem fins lucrativos. |
| **Banco de Dados** | **Turso (Plano Starter Free)** | 9 GB de armazenamento, até 500 bancos, 1 bilhão de leituras/mês | **Não hiberna/pausa** por inatividade e funciona em Edge/Serverless. |
| **Armazenamento de Fotos** | **Cloudinary (Plano Free)** *(opcional)* | 25 créditos/mês (~25 GB de armazenamento/tráfego) | Localmente salva em `/public/uploads`; em produção usa Cloudinary via `.env`. |
| **Hospedagem de Vídeos** | **YouTube (Não Listado) & Google Drive** | Ilimitado e gratuito | Os professores colam apenas o link; o sistema converte automaticamente para player embutido. |
| **Domínio / Subdomínio** | **Subdomínio Vercel** ou **eu.org / duckdns.org / Cloudflare** | Gratuito com SSL/TLS automático | Ex.: `herdeiros-de-deus.vercel.app` ou domínio comunitário `eu.org` apontado para Cloudflare + Vercel. |

---

## 3. Opções de Domínio Gratuito para a Igreja

1. **Subdomínio gratuito imediato (Recomendado para início rápido)**:
   - Ao publicar na Vercel, você recebe gratuitamente um endereço como `https://igreja-herdeiros-de-deus.vercel.app` com certificado SSL (cadeado HTTPS) já configurado.
2. **Subdomínio dinâmico gratuito (DuckDNS)**:
   - `herdeirosdedeus.duckdns.org` (gratuito, renovação automática).
3. **Domínio gratuito comunitário (`eu.org`)**:
   - Solicitação gratuita via `nic.eu.org` (ex.: `herdeirosdedeus.eu.org`), gerenciando o DNS gratuitamente pelo **Cloudflare Free** apontado para a Vercel.
4. **Registro `.org.br` oficial (caso a igreja possua CNPJ e queira domínio próprio no futuro)**:
   - Embora `.org.br` no Registro.br tenha anuidade baixa (~R\$ 40/ano), toda a infraestrutura acima funciona **100% gratuita** sem obrigatoriedade de compra de domínio pago.

---

## 4. Passo a Passo Resumido para Publicar Gratuitamente

1. Subir o código para um repositório gratuito no **GitHub**.
2. Criar uma conta gratuita no **Turso** (`https://turso.tech`), criar o banco `herdeiros-db`, gerar a URL (`libsql://...`) e o Auth Token.
3. Criar uma conta gratuita no **Cloudinary** (`https://cloudinary.com`) para upload de fotos do Feed em nuvem (opcional; também é possível usar URLs de fotos externas).
4. Importar o repositório na **Vercel** (`https://vercel.com`), configurar as variáveis do `.env.example` e clicar em **Deploy**.
5. Rodar `npx drizzle-kit push` e `npm run db:seed` apontando para a `DATABASE_URL` do Turso para popular as tabelas e o usuário Admin inicial.

