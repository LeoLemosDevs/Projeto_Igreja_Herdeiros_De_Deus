import { client } from "./index";
import { seedDatabase } from "./seed";

const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'STUDENT' NOT NULL,
    bio text,
    avatar_url text,
    phone text,
    is_active integer DEFAULT 1 NOT NULL,
    created_at integer NOT NULL,
    updated_at integer NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`,
  `CREATE TABLE IF NOT EXISTS feed_posts (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    subtitle text,
    content text NOT NULL,
    category text DEFAULT 'EVENTO' NOT NULL,
    cover_image text,
    media_gallery text DEFAULT '[]' NOT NULL,
    video_url text,
    event_date text,
    event_location text,
    is_featured integer DEFAULT 0 NOT NULL,
    is_published integer DEFAULT 1 NOT NULL,
    author_id text,
    created_at integer NOT NULL,
    updated_at integer NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE no action ON DELETE set null
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS feed_posts_slug_unique ON feed_posts (slug)`,
  `CREATE INDEX IF NOT EXISTS feed_posts_published_idx ON feed_posts (is_published, created_at)`,
  `CREATE INDEX IF NOT EXISTS feed_posts_category_idx ON feed_posts (category)`,
  `CREATE TABLE IF NOT EXISTS worship_schedules (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    day_of_week text NOT NULL,
    start_time text NOT NULL,
    end_time text,
    target_audience text,
    location text DEFAULT 'Templo Principal' NOT NULL,
    description text NOT NULL,
    leader_name text,
    highlight_tag text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active integer DEFAULT 1 NOT NULL,
    created_at integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS courses (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    subtitle text,
    description text NOT NULL,
    instrument text NOT NULL,
    level text DEFAULT 'INICIANTE' NOT NULL,
    cover_image text,
    promo_video_url text,
    is_published integer DEFAULT 0 NOT NULL,
    is_featured integer DEFAULT 0 NOT NULL,
    teacher_id text NOT NULL,
    created_at integer NOT NULL,
    updated_at integer NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON courses (slug)`,
  `CREATE INDEX IF NOT EXISTS courses_teacher_idx ON courses (teacher_id)`,
  `CREATE INDEX IF NOT EXISTS courses_published_idx ON courses (is_published)`,
  `CREATE TABLE IF NOT EXISTS course_modules (
    id text PRIMARY KEY NOT NULL,
    course_id text NOT NULL,
    title text NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at integer NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE INDEX IF NOT EXISTS modules_course_idx ON course_modules (course_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS course_lessons (
    id text PRIMARY KEY NOT NULL,
    course_id text NOT NULL,
    module_id text NOT NULL,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    video_provider text DEFAULT 'YOUTUBE' NOT NULL,
    duration_minutes integer DEFAULT 15 NOT NULL,
    resource_url text,
    resource_label text,
    is_free_preview integer DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at integer NOT NULL,
    updated_at integer NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE INDEX IF NOT EXISTS lessons_module_idx ON course_lessons (module_id, sort_order)`,
  `CREATE INDEX IF NOT EXISTS lessons_course_idx ON course_lessons (course_id)`,
  `CREATE TABLE IF NOT EXISTS course_enrollments (
    id text PRIMARY KEY NOT NULL,
    course_id text NOT NULL,
    student_id text NOT NULL,
    last_lesson_id text,
    enrolled_at integer NOT NULL,
    last_accessed_at integer NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (student_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS enrollments_course_student_uq ON course_enrollments (course_id, student_id)`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (
    id text PRIMARY KEY NOT NULL,
    student_id text NOT NULL,
    course_id text NOT NULL,
    lesson_id text NOT NULL,
    completed integer DEFAULT 1 NOT NULL,
    notes text,
    completed_at integer,
    updated_at integer NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS lesson_progress_student_lesson_uq ON lesson_progress (student_id, lesson_id)`,
  `CREATE INDEX IF NOT EXISTS lesson_progress_course_student_idx ON lesson_progress (course_id, student_id)`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'NOVA' NOT NULL,
    admin_notes text,
    created_at integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    created_at integer NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique ON newsletter_subscribers (email)`,
];

const globalForBootstrap = globalThis as unknown as {
  dbReadyPromise?: Promise<void>;
};

async function runBootstrap(): Promise<void> {
  try {
    const check = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    if (check.rows.length > 0) {
      const countRes = await client.execute("SELECT count(*) AS total FROM users");
      const total = Number(countRes.rows[0]?.total ?? 0);
      if (total > 0) return;
    }
  } catch {
    // Segue para criacao de tabelas em lote
  }

  await client.batch(
    DDL_STATEMENTS.map((sql) => ({ sql, args: [] })),
    "write"
  );
  await seedDatabase(false);
}

/**
 * Garante automaticamente que todas as tabelas e dados iniciais existam no primeiro acesso.
 * Facilita deploy 100% plug-and-play em bancos novos (como Turso Free) na Vercel.
 */
export async function ensureDatabaseReady(): Promise<void> {
  if (!globalForBootstrap.dbReadyPromise) {
    globalForBootstrap.dbReadyPromise = runBootstrap().catch((err) => {
      globalForBootstrap.dbReadyPromise = undefined;
      throw err;
    });
  }
  return globalForBootstrap.dbReadyPromise;
}

