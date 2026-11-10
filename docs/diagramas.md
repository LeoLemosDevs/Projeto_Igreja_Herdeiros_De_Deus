# 📐 Diagramas do Sistema

Este documento apresenta os diagramas arquiteturais, modelagem de dados e fluxos operacionais da plataforma da **Igreja Bíblica Herdeiros de Deus**.

---

## 1. Diagrama de Arquitetura Geral

```mermaid
flowchart TD
    Visitor["Visitante / Membro / Professor / Admin"] -->|"HTTPS Browser"| NextApp["Next.js 16 App Router (Vercel Hobby Free)"]
    NextApp -->|"Paginas SSR & Client UI"| PublicPages["Home, Feed, Programacao, Sobre, Contato"]
    NextApp -->|"Rotas Autenticadas"| MemberPages["Cursos (Acervo), Player Kiwify, Estudio Professor, Painel Admin"]
    NextApp -->|"REST API Routes"| ApiLayer["API Next.js (/api/** + Zod + JWT Auth)"]
    ApiLayer -->|"Drizzle ORM"| LibSQL["@libsql/client"]
    LibSQL -->|"Dev Local"| LocalDB["SQLite Local (./data/herdeiros.db)"]
    LibSQL -->|"Producao Free"| TursoDB["Turso Cloud Database (LibSQL)"]
    ApiLayer -->|"Upload de Fotos"| MediaStore["/public/uploads (Local) ou Cloudinary (Free Cloud)"]
    MemberPages -->|"Embed Seguro"| VideoProviders["YouTube / Google Drive / Vimeo / MP4"]
```

---

## 2. Diagrama Entidade-Relacionamento (Banco de Dados)

```mermaid
erDiagram
    users ||--o{ feed_posts : "publica"
    users ||--o{ courses : "ministra"
    users ||--o{ course_enrollments : "matricula-se"
    users ||--o{ lesson_progress : "registra"
    courses ||--o{ course_modules : "possui"
    course_modules ||--o{ course_lessons : "contem"
    courses ||--o{ course_lessons : "agrupa"
    courses ||--o{ course_enrollments : "recebe"
    course_lessons ||--o{ lesson_progress : "rastreada_em"

    users {
        text id PK
        text name
        text email UK
        text password_hash
        text role "ADMIN | TEACHER | STUDENT"
        integer is_active
    }

    feed_posts {
        text id PK
        text title
        text slug UK
        text category "EVENTO | AVISO | CULTO | ACAO_SOCIAL | TESTEMUNHO | MUSICA"
        text cover_image
        text media_gallery "JSON array"
        text video_url
        text author_id FK
    }

    worship_schedules {
        text id PK
        text title
        text day_of_week
        text start_time
        text location
        integer sort_order
    }

    courses {
        text id PK
        text title
        text slug UK
        text instrument
        text level
        integer is_published
        text teacher_id FK
    }

    course_modules {
        text id PK
        text course_id FK
        text title
        integer sort_order
    }

    course_lessons {
        text id PK
        text course_id FK
        text module_id FK
        text title
        text video_url
        text video_provider "YOUTUBE | GOOGLE_DRIVE | VIMEO | DIRECT"
        integer duration_minutes
    }

    course_enrollments {
        text id PK
        text course_id FK
        text student_id FK
        text last_lesson_id
    }

    lesson_progress {
        text id PK
        text student_id FK
        text course_id FK
        text lesson_id FK
        integer completed
        text notes
    }

    contact_messages {
        text id PK
        text name
        text email
        text subject
        text status "NOVA | LIDA | RESPONDIDA"
    }

    newsletter_subscribers {
        text id PK
        text name
        text email UK
    }
```

---

## 3. Fluxo de Autenticação e Controle de Acesso (RBAC)

```mermaid
flowchart TD
    Req["Requisicao para Rota / API"] --> CheckCookie["Ler cookie HttpOnly herdeiros_session"]
    CheckCookie -->|"Ausente ou invalido"| Guest["Usuario Visitante (Nao Logado)"]
    CheckCookie -->|"JWT Valido"| FetchUser["Consultar usuario ativo no banco"]
    FetchUser --> RoleCheck{"Qual o Role?"}
    RoleCheck -->|"STUDENT"| StudentAccess["Acessa Acervo de Cursos, Player e Progresso"]
    RoleCheck -->|"TEACHER"| TeacherAccess["Acessa Cursos + Estudio Kiwify dos seus Cursos"]
    RoleCheck -->|"ADMIN"| AdminAccess["Acesso Total: Painel Admin, Feed, Cultos, Usuarios e Todos Cursos"]
    Guest -->|"Tenta acessar /cursos/[slug]/assistir"| RedirectLogin["Redireciona para /login"]
```

---

## 4. Fluxo do Player e Progresso de Aulas (Estilo Kiwify)

```mermaid
sequenceDiagram
    actor Aluno
    participant Player as KiwifyCoursePlayer
    participant API as POST /api/lessons/[id]/progress
    participant DB as Banco LibSQL/Turso

    Aluno->>Player: Acessa /cursos/[slug]/assistir
    Player->>DB: Cria ou atualiza course_enrollments e abre last_lesson_id
    Aluno->>Player: Seleciona aula (YouTube / Google Drive)
    Player->>Aluno: Renderiza iframe embed responsivo
    Aluno->>Player: Clica em "Marcar como Concluida"
    Player->>API: Envia { completed: true }
    API->>DB: Upsert em lesson_progress + atualiza last_lesson_id
    API->>DB: Recalcula total de aulas concluidas no curso
    API-->>Player: Retorna { completed: true, progress: { percentage } }
    Player-->>Aluno: Atualiza barra de progresso e icone verde na sidebar
```

