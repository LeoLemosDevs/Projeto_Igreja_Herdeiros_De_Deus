# 🗄️ Estrutura do Banco de Dados

O sistema utiliza **Drizzle ORM** com driver **LibSQL (`@libsql/client`)**, permitindo execução idêntica sobre arquivo **SQLite local** em desenvolvimento (`./data/herdeiros.db`) e sobre o banco em nuvem gratuito **Turso** em produção.

O schema completo está definido em [`src/db/schema.ts`](../src/db/schema.ts).

---

## 1. Visão Geral das Tabelas

1. `users` — Contas de Administradores, Professores de Música e Alunos/Membros.
2. `feed_posts` — Publicações do Feed de Eventos, Notícias, Cultos Especiais e Ações Sociais.
3. `worship_schedules` — Programação semanal de cultos e suas explicações.
4. `courses` — Catálogo de cursos da Escola de Música.
5. `course_modules` — Módulos ordenados dentro de cada curso (estilo Kiwify).
6. `course_lessons` — Videoaulas (YouTube, Google Drive, Vimeo, MP4) pertencentes a cada módulo.
7. `course_enrollments` — Matrículas de alunos e rastreamento da última aula acessada.
8. `lesson_progress` — Registro de conclusão por aula e anotações pessoais do aluno.
9. `contact_messages` — Mensagens e pedidos de oração enviados pelo formulário de contato.
10. `newsletter_subscribers` — Inscritos na faixa de novidades da página inicial.

---

## 2. Dicionário Detalhado de Tabelas

### `users`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `text` | PK | UUID do usuário |
| `name` | `text` | NOT NULL | Nome completo |
| `email` | `text` | NOT NULL, UNIQUE | E-mail de login (minúsculas) |
| `password_hash` | `text` | NOT NULL | Hash gerado por `bcryptjs` |
| `role` | `text` | NOT NULL, DEFAULT `'STUDENT'` | `ADMIN`, `TEACHER` ou `STUDENT` |
| `bio` | `text` | NULLABLE | Biografia curta (exibida para professores) |
| `avatar_url` | `text` | NULLABLE | URL da foto de perfil |
| `phone` | `text` | NULLABLE | Telefone / WhatsApp |
| `is_active` | `integer (bool)` | NOT NULL, DEFAULT `1` | Permite bloquear acesso sem excluir histórico |
| `created_at` | `integer (ms)` | NOT NULL | Timestamp de criação |
| `updated_at` | `integer (ms)` | NOT NULL | Timestamp da última atualização |

### `feed_posts`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `text` | PK | UUID da publicação |
| `title` | `text` | NOT NULL | Título da publicação |
| `slug` | `text` | NOT NULL, UNIQUE | Identificador amigável para URL (`/feed/[slug]`) |
| `subtitle` | `text` | NULLABLE | Resumo curto para cards |
| `content` | `text` | NOT NULL | Texto completo da publicação |
| `category` | `text` | NOT NULL, DEFAULT `'EVENTO'` | `EVENTO`, `AVISO`, `CULTO`, `ACAO_SOCIAL`, `TESTEMUNHO`, `MUSICA` |
| `cover_image` | `text` | NULLABLE | Foto principal de capa |
| `media_gallery` | `text` | NOT NULL, DEFAULT `'[]'` | Array JSON de URLs de fotos extras |
| `video_url` | `text` | NULLABLE | Link de vídeo (YouTube, Google Drive, Vimeo ou MP4) |
| `event_date` | `text` | NULLABLE | Data/hora legível do evento |
| `event_location` | `text` | NULLABLE | Local do evento |
| `is_featured` | `integer (bool)` | NOT NULL, DEFAULT `0` | Destaca na página inicial |
| `is_published` | `integer (bool)` | NOT NULL, DEFAULT `1` | Controla visibilidade pública |
| `author_id` | `text` | FK -> `users.id` (`SET NULL`) | Administrador autor do post |
| `created_at` / `updated_at` | `integer (ms)` | NOT NULL | Timestamps |

### `worship_schedules`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `text` | PK | UUID do culto |
| `title` | `text` | NOT NULL | Nome do culto (ex.: *Culto da Família*) |
| `day_of_week` | `text` | NOT NULL | Dia da semana |
| `start_time` / `end_time` | `text` | `start_time` NOT NULL | Horário de início e término |
| `target_audience` | `text` | NULLABLE | Público-alvo |
| `location` | `text` | NOT NULL | Local de realização |
| `description` | `text` | NOT NULL | Explicação sobre o propósito do culto |
| `leader_name` | `text` | NULLABLE | Ministério/Liderança responsável |
| `highlight_tag` | `text` | NULLABLE | Selo informativo (ex.: *Espaço Kids*) |
| `sort_order` | `integer` | NOT NULL, DEFAULT `0` | Ordem de exibição |
| `is_active` | `integer (bool)` | NOT NULL, DEFAULT `1` | Exibir ou ocultar na programação |

### `courses`, `course_modules` e `course_lessons`
- **`courses`**: Armazena `title`, `slug` (UNIQUE), `subtitle`, `description`, `instrument`, `level` (`INICIANTE`, `INTERMEDIARIO`, `AVANCADO`, `TODOS`), `cover_image`, `promo_video_url`, `is_published`, `is_featured`, `teacher_id` (FK -> `users.id` com `ON DELETE CASCADE`).
- **`course_modules`**: Armazena `course_id` (FK -> `courses.id` com `ON DELETE CASCADE`), `title`, `description`, `sort_order`.
- **`course_lessons`**: Armazena `course_id`, `module_id` (FK -> `course_modules.id` com `ON DELETE CASCADE`), `title`, `description`, `video_url`, `video_provider` (`YOUTUBE`, `GOOGLE_DRIVE`, `VIMEO`, `DIRECT`, `OTHER`), `duration_minutes`, `resource_url`, `resource_label`, `is_free_preview`, `sort_order`.

### `course_enrollments` e `lesson_progress`
- **`course_enrollments`**: Índice único `(course_id, student_id)`. Armazena `last_lesson_id`, `enrolled_at`, `last_accessed_at`.
- **`lesson_progress`**: Índice único `(student_id, lesson_id)` e índice `(course_id, student_id)`. Armazena `completed`, `notes` (anotação pessoal do aluno), `completed_at`, `updated_at`.

### `contact_messages` e `newsletter_subscribers`
- **`contact_messages`**: `id`, `name`, `email`, `phone`, `subject`, `message`, `status` (`NOVA`, `LIDA`, `RESPONDIDA`), `admin_notes`, `created_at`.
- **`newsletter_subscribers`**: `id`, `name`, `email` (UNIQUE), `created_at`.

---

## 3. Comandos de Gerenciamento

```bash
# Aplicar o schema no banco local ou Turso
npx drizzle-kit push

# Popular dados iniciais (admin, professores, aluno, cultos, feed e 3 cursos)
npm run db:seed

# Abrir interface visual do banco (Drizzle Studio)
npm run db:studio
```

