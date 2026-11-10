# 📚 Documentação Técnica — Igreja Bíblica Herdeiros de Deus

Bem-vindo à documentação oficial do portal institucional, Feed de Eventos e Plataforma de Cursos de Música da **Igreja Bíblica Herdeiros de Deus**.

Este projeto foi desenvolvido com foco em **custo zero de infraestrutura** (hospedagem, banco de dados e domínio/subdomínio gratuitos), identidade visual inspirada na estrutura editorial de `vitoriaemcristo.org` e uma experiência moderna de área de membros e configuração de cursos inspirada na **Kiwify**.

---

## 🗂️ Índice da Documentação

| Documento | Descrição |
| :--- | :--- |
| [01. Tecnologias e Hospedagem Gratuita](./tecnologias-e-hospedagem-gratuita.md) | Stack completa, versões utilizadas, justificativas técnicas e guia de infraestrutura 100% gratuita. |
| [02. Diagramas do Sistema](./diagramas.md) | Diagramas de Arquitetura, Modelo Entidade-Relacionamento (ER), Fluxo RBAC e Fluxo de Progresso dos Cursos. |
| [03. Estrutura do Banco de Dados](./banco-de-dados.md) | Detalhamento completo das 10 tabelas, colunas, chaves estrangeiras, índices e seed inicial. |
| [04. Backend e API REST](./backend.md) | Contratos de endpoints, autenticação JWT, autorização por papéis, upload de fotos e parser de vídeos. |
| [05. Frontend e Design System](./frontend.md) | Mapa de páginas, identidade visual, componentes reutilizáveis e módulos estilo Kiwify. |
| [06. Credenciais e Variáveis de Ambiente](./credenciais.md) | Configuração do `.env`, credenciais de demonstração do seed local e criação de chaves gratuitas na nuvem. |
| [07. Guia de Deploy 100% Gratuito](./deploy-gratuito.md) | Passo a passo prático para publicar banco Turso, Cloudinary, Vercel e domínio gratuito. |
| [08. Hospedagem Ativa e Segurança](./hospedagem-e-producao.md) | Registro do ambiente online (`https://herdeirosdeus.vercel.app`), Turso em São Paulo, gestão de tokens e checklist pós-aprovação. |
| [09. Contexto para Continuidade com IA](./contexto-ia.md) | Memória técnica, decisões resolvidas e prompt pronto para continuar o projeto em novas sessões de IA. |

---

## ✨ Principais Módulos do Sistema

1. **Portal Institucional**:
   - **Home (`/`)**: Carrossel principal, barra de atalhos, newsletter, destaques do Feed, grade de cultos e vitrine da Escola de Música.
   - **Feed de Publicações & Eventos (`/feed` e `/feed/[slug]`)**: Filtros por categoria, busca textual, galeria de fotos com modal ampliado e player de vídeo embutido.
   - **Programação dos Cultos (`/programacao`)**: Dias da semana, horários, local, público-alvo e explicação do propósito de cada culto.
   - **Sobre a Igreja (`/sobre`)**: História, linha do tempo, missão, visão, valores e declaração de fé.
   - **Contato (`/contato`)**: Formulário completo salvo no banco de dados e canais diretos.
2. **Escola de Música (Estilo Kiwify)**:
   - **Acervo de Cursos (`/cursos`)**: Catálogo com acesso às aulas liberado para usuários logados.
   - **Player do Aluno (`/cursos/[slug]/assistir`)**: Navegação por módulos e aulas, barra de progresso percentual, marcação de conclusão, botão de próxima aula e bloco de anotações pessoais.
   - **Estúdio do Professor (`/painel/cursos` e `/painel/cursos/[id]`)**: Gestão de cursos, criação/reordenação de módulos e videoaulas com suporte automático a **YouTube**, **Google Drive**, **Vimeo** e **MP4**, além de acompanhamento de progresso dos alunos.
3. **Painel do Administrador Principal (`/admin`)**:
   - Controle completo do Feed (títulos, descrições, múltiplas fotos, vídeos, destaque e publicação), Programação de Cultos, Gestão de Contas (criação e promoção de Professores) e Caixa de Mensagens/Newsletter.
