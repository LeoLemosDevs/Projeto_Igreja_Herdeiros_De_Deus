# ⚙️ Documentação do Backend e API REST

O backend da aplicação roda em **Next.js Route Handlers** (`src/app/api/**`) com validação via **Zod**, autenticação **JWT em cookie `HttpOnly` (`herdeiros_session`)** e persistência via **Drizzle ORM**.

---

## 1. Segurança e Autenticação (`src/lib/auth.ts`)

- **Hash de Senhas**: `bcryptjs` com salt automático (`bcrypt.hash(plain, 10)`).
- **Sessão JWT**: Assinatura HMAC-SHA256 via `jose` usando `JWT_SECRET`, validade de 7 dias em cookie `HttpOnly`, `SameSite=Lax`.
- **Verificação em Tempo Real (`getSessionUser()`)**: Valida o JWT e consulta `users` no banco verificando `isActive = true`. Se um administrador alterar o papel ou desativar um usuário, a mudança entra em vigor imediatamente.
- **Controle de Acesso Baseado em Papéis (RBAC)**:
  - `STUDENT`: Acessa acervo completo de cursos, assiste aulas, marca conclusão e salva anotações pessoais.
  - `TEACHER`: Todas as permissões de aluno + acesso ao Estúdio de Cursos (`/painel/cursos`) para criar/editar seus próprios cursos, módulos e aulas.
  - `ADMIN`: Controle total — Feed de publicações, Programação de cultos, Gestão de usuários/professores, Caixa de mensagens e todos os cursos.
  - *Nota de segurança*: O cadastro público (`POST /api/auth/register`) cria sempre usuários com role `STUDENT`. Apenas um `ADMIN` pode criar ou promover contas para `TEACHER` ou `ADMIN`.

---

## 2. Mapa de Endpoints da API

### Autenticação (`/api/auth/*`)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autentica por e-mail/senha e grava cookie `herdeiros_session`. |
| `POST` | `/api/auth/register` | Público | Cria conta gratuita (`STUDENT`) e autentica automaticamente. |
| `POST` | `/api/auth/logout` | Autenticado | Remove o cookie de sessão. |
| `GET` | `/api/auth/me` | Público | Retorna usuário logado atual ou `{ user: null }`. |

### Feed de Publicações & Eventos (`/api/feed/*`)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/feed` | Público / Admin | Lista publicações. Suporta `?category=EVENTO&q=texto`. Com `?includeAll=1` (somente `ADMIN`), retorna também rascunhos. |
| `POST` | `/api/feed` | `ADMIN` | Cria publicação com título, subtítulo, conteúdo, categoria, foto de capa, `mediaGallery` (array JSON), `videoUrl`, `eventDate`, `eventLocation`, `isFeatured` e `isPublished`. |
| `GET` | `/api/feed/[id]` | Público / Admin | Busca publicação por `id` ou `slug`. |
| `PATCH` | `/api/feed/[id]` | `ADMIN` | Atualiza qualquer campo da publicação. |
| `DELETE` | `/api/feed/[id]` | `ADMIN` | Exclui publicação do banco. |

### Programação dos Cultos (`/api/schedules/*`)
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schedules` | Público | Lista cultos ordenados por `sortOrder`. |
| `POST` | `/api/schedules` | `ADMIN` | Adiciona novo culto com dia, horário, público-alvo, local e explicação. |
| `PATCH` | `/api/schedules/[id]` | `ADMIN` | Atualiza dados ou ordem do culto. |
| `DELETE` | `/api/schedules/[id]` | `ADMIN` | Remove culto da programação. |

### Escola de Música — Cursos, Módulos, Aulas & Progresso
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Público / Logado | Lista cursos publicados (ou `?mine=1` para professor / `?all=1` para admin) já enriquecidos com contagens e progresso do usuário logado. |
| `POST` | `/api/courses` | `TEACHER` / `ADMIN` | Cria novo curso e já gera o `Módulo 1 — Introdução`. |
| `GET` | `/api/courses/[id]` | Público / Logado | Retorna curso, módulos, aulas e progresso. Oculta `videoUrl` de aulas não gratuitas quando visitante não está logado. |
| `PATCH` / `DELETE` | `/api/courses/[id]` | Dono ou `ADMIN` | Atualiza configurações/capa/publicação ou exclui o curso. |
| `POST` | `/api/courses/[id]/modules` | Dono ou `ADMIN` | Adiciona novo módulo ao curso. |
| `PATCH` / `DELETE` | `/api/modules/[moduleId]` | Dono ou `ADMIN` | Renomeia, reordena (`sortOrder`) ou exclui módulo. |
| `POST` | `/api/modules/[moduleId]/lessons` | Dono ou `ADMIN` | Cria videoaula detectando automaticamente o `videoProvider` via `parseVideoUrl()`. |
| `PATCH` / `DELETE` | `/api/lessons/[lessonId]` | Dono ou `ADMIN` | Edita, reordena ou exclui aula. |
| `POST` | `/api/courses/[id]/enroll` | Logado | Registra matrícula gratuita do aluno. |
| `POST` | `/api/lessons/[lessonId]/progress` | Logado | Marca/desmarca aula concluída, salva anotações pessoais (`notes`), atualiza `lastLessonId` e retorna porcentagem recalculada do curso. |

### Upload, Contato, Newsletter e Gestão de Usuários
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | `TEACHER` / `ADMIN` | Upload de imagens (máx. 5 MB: JPG, PNG, WebP, GIF). Usa **Cloudinary Free** se configurado no `.env`; caso contrário salva localmente em `public/uploads/`. |
| `POST` / `GET` | `/api/contact` | Público (POST) / `ADMIN` (GET) | Envio público do formulário de contato e leitura no painel Admin. |
| `PATCH` / `DELETE` | `/api/contact/[id]` | `ADMIN` | Atualiza status (`NOVA`, `LIDA`, `RESPONDIDA`) ou remove mensagem. |
| `POST` / `GET` | `/api/newsletter` | Público (POST) / `ADMIN` (GET) | Cadastro de novidades na Home e listagem administrativa. |
| `GET` / `POST` / `PATCH` | `/api/admin/users` & `[id]` | `ADMIN` | Lista contas, cria professores diretamente e altera `role` ou `isActive`. |

---

## 3. Parser Inteligente de Vídeos (`src/lib/video.ts`)

A função `parseVideoUrl(url)` normaliza links colados por administradores e professores para reprodução responsiva sem custo de hospedagem de vídeo:
- **YouTube** (`youtube.com/watch?v=`, `youtu.be/`, `shorts/`, `live/`, `embed/`) -> `https://www.youtube.com/embed/{id}?rel=0&modestbranding=1`
- **Google Drive** (`drive.google.com/file/d/{id}/view` ou `open?id={id}`) -> `https://drive.google.com/file/d/{id}/preview`
- **Vimeo** (`vimeo.com/{id}`) -> `https://player.vimeo.com/video/{id}`
- **Arquivos diretos** (`.mp4`, `.webm`, `.ogg`) -> Renderiza tag `<video controls />` HTML5.

