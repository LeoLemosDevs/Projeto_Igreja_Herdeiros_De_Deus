# 🎨 Documentação do Frontend e Design System

O frontend foi projetado com **Next.js App Router**, **React 19**, **Tailwind CSS v4** e **Lucide Icons**, unindo a autoridade institucional inspirada no site referência `https://www.vitoriaemcristo.org/` a um ambiente moderno de cursos estilo **Kiwify**.

---

## 1. Identidade Visual e Design System

### Paleta de Cores
- **Laranja Institucional (`#f7941d` / hover `#df7d09`)**: Botões principais, badges de categoria, ícones de destaque e barra ativa de navegação.
- **Âmbar / Dourado (`#fcaf3d` / `#fbab00`)**: Borda lateral esquerda de títulos de seção (`.avec-section-title`, inspirada diretamente na classe `.news-title` do site referência) e CTAs em destaque sobre fundos escuros.
- **Azul Petróleo Escuro (`#243e4f` / `#182b38`)**: Cabeçalhos institucionais, faixa de Newsletter, seção da Escola de Música, Rodapé e Player Kiwify.
- **Superfícies Neutras (`#ffffff`, `#f8f9fa`, `#f4f4f4`)**: Leitura confortável com alto contraste de texto (`#212529` e `#5a6672`).

### Tipografia
- **Títulos (`.heading-font`)**: `Montserrat` (pesos `600`, `700`, `800`) via `next/font/google`.
- **Corpo de Texto**: `Open Sans` (pesos `400`, `500`, `600`, `700`), alinhada à tipografia institucional de `vitoriaemcristo.org`.

---

## 2. Mapa de Páginas e Rotas (`src/app/**`)

| Rota | Acesso | Descrição |
| :--- | :--- | :--- |
| `/` | Público | Página inicial com Carrossel Hero, Faixa de Boas-vindas, Newsletter, Feed em Destaque, Programação dos Cultos, Vitrine da Escola de Música e História resumida. |
| `/feed` | Público | Listagem completa de publicações e eventos com filtros por categoria e busca por texto. |
| `/feed/[slug]` | Público | Detalhes da publicação: imagem de capa, data/local do evento, player de vídeo multi-plataforma, texto completo e galeria de fotos com modal ampliado (`PhotoGallery`). |
| `/programacao` | Público | Programação semanal completa explicando o propósito, dia, horário, local e público de cada culto. |
| `/sobre` | Público | História da Igreja Bíblica Herdeiros de Deus, Linha do Tempo, Missão, Visão, Valores e Declaração de Fé. |
| `/contato` | Público | Formulário de contato / pedido de oração conectado ao banco + canais diretos e WhatsApp. |
| `/login` | Público | Login com redirecionamento inteligente por papel + atalhos de preenchimento para contas demo do seed local. |
| `/cadastro` | Público | Cadastro gratuito de novos alunos/membros para liberar o acervo de cursos. |
| `/cursos` | Público / Logado | Catálogo filtrável por instrumento. Visitantes veem a vitrine e são convidados ao login gratuito; usuários logados veem barras de progresso e acessam as aulas. |
| `/cursos/[slug]/assistir` | Autenticado | **Player estilo Kiwify** (`KiwifyCoursePlayer`): vídeo 16:9, sidebar expansível de módulos/aulas, percentual de conclusão em tempo real, botão próxima aula, materiais complementares e bloco de anotações pessoais. |
| `/painel/cursos` | `TEACHER` / `ADMIN` | **Estúdio de Cursos**: listagem e criação de novos cursos de música. |
| `/painel/cursos/[id]` | Dono / `ADMIN` | **Construtor Kiwify** (`CourseBuilderKiwify`): criação/reordenação de módulos e videoaulas com pré-visualização instantânea do vídeo (YouTube/Google Drive), upload de capa e tabela de progresso dos alunos. |
| `/admin` | `ADMIN` | **Painel Administrativo Principal** (`AdminDashboard`): 4 abas integradas (Feed completo com múltiplas fotos e vídeos, Programação de Cultos, Gestão de Contas/Professores e Caixa de Contatos/Newsletter). |

---

## 3. Principais Componentes (`src/components/**`)

- [`Navbar.tsx`](../src/components/Navbar.tsx): Cabeçalho em duas camadas (barra utilitária superior com a logo oficial em `/img/logo_transparente_300p.png` + barra sticky com Mega-Menu de 4 colunas e gaveta responsiva para mobile).
- [`Footer.tsx`](../src/components/Footer.tsx): Rodapé institucional com a logo oficial (`/img/logo_transparente_500p.png`), links rápidos, endereço completo com CEP (`60330-820`), rota no Google Maps e copyright.
- [`ChurchLocationMap.tsx`](../src/components/ChurchLocationMap.tsx): Bloco de localização com endereço oficial (Rua A, nº 90 — Conjunto Jaciara, Barra do Ceará, Fortaleza - CE), Google Maps incorporado gratuito e botões de navegação GPS (Google Maps e Waze).
- [`HeroCarousel.tsx`](../src/components/HeroCarousel.tsx): Banner rotativo com transições suaves e CTAs institucionais.
- [`VideoPlayer.tsx`](../src/components/VideoPlayer.tsx): Player universal para YouTube, Google Drive, Vimeo e MP4.
- [`KiwifyCoursePlayer.tsx`](../src/components/KiwifyCoursePlayer.tsx): Experiência de aluno estilo Kiwify com controle de progresso persistente.
- [`CourseBuilderKiwify.tsx`](../src/components/CourseBuilderKiwify.tsx): Editor visual de módulos, aulas e configurações para professores.
- [`admin/AdminDashboard.tsx`](../src/components/admin/AdminDashboard.tsx): Central de controle do Administrador Principal.

