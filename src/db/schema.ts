import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const userRoles = ["ADMIN", "TEACHER", "STUDENT"] as const;
export type UserRole = (typeof userRoles)[number];

export const feedCategories = [
  "EVENTO",
  "AVISO",
  "CULTO",
  "ACAO_SOCIAL",
  "TESTEMUNHO",
  "MUSICA",
] as const;
export type FeedCategory = (typeof feedCategories)[number];

export const courseLevels = [
  "INICIANTE",
  "INTERMEDIARIO",
  "AVANCADO",
  "TODOS",
] as const;
export type CourseLevel = (typeof courseLevels)[number];

export const videoProviders = [
  "YOUTUBE",
  "GOOGLE_DRIVE",
  "VIMEO",
  "DIRECT",
  "OTHER",
] as const;
export type VideoProvider = (typeof videoProviders)[number];

export const contactStatuses = ["NOVA", "LIDA", "RESPONDIDA"] as const;
export type ContactStatus = (typeof contactStatuses)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoles }).notNull().default("STUDENT"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const feedPosts = sqliteTable(
  "feed_posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    subtitle: text("subtitle"),
    content: text("content").notNull(),
    category: text("category", { enum: feedCategories })
      .notNull()
      .default("EVENTO"),
    coverImage: text("cover_image"),
    mediaGallery: text("media_gallery").notNull().default("[]"),
    videoUrl: text("video_url"),
    eventDate: text("event_date"),
    eventLocation: text("event_location"),
    isFeatured: integer("is_featured", { mode: "boolean" })
      .notNull()
      .default(false),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(true),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("feed_posts_published_idx").on(table.isPublished, table.createdAt),
    index("feed_posts_category_idx").on(table.category),
  ]
);

export const worshipSchedules = sqliteTable("worship_schedules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  targetAudience: text("target_audience"),
  location: text("location").notNull().default("Templo Principal"),
  description: text("description").notNull(),
  leaderName: text("leader_name"),
  highlightTag: text("highlight_tag"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    subtitle: text("subtitle"),
    description: text("description").notNull(),
    instrument: text("instrument").notNull(),
    level: text("level", { enum: courseLevels }).notNull().default("INICIANTE"),
    coverImage: text("cover_image"),
    promoVideoUrl: text("promo_video_url"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    isFeatured: integer("is_featured", { mode: "boolean" })
      .notNull()
      .default(false),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("courses_teacher_idx").on(table.teacherId),
    index("courses_published_idx").on(table.isPublished),
  ]
);

export const courseModules = sqliteTable(
  "course_modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("modules_course_idx").on(table.courseId, table.sortOrder)]
);

export const courseLessons = sqliteTable(
  "course_lessons",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    videoUrl: text("video_url").notNull(),
    videoProvider: text("video_provider", { enum: videoProviders })
      .notNull()
      .default("YOUTUBE"),
    durationMinutes: integer("duration_minutes").notNull().default(15),
    resourceUrl: text("resource_url"),
    resourceLabel: text("resource_label"),
    isFreePreview: integer("is_free_preview", { mode: "boolean" })
      .notNull()
      .default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("lessons_module_idx").on(table.moduleId, table.sortOrder),
    index("lessons_course_idx").on(table.courseId),
  ]
);

export const courseEnrollments = sqliteTable(
  "course_enrollments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastLessonId: text("last_lesson_id"),
    enrolledAt: integer("enrolled_at", { mode: "timestamp_ms" }).notNull(),
    lastAccessedAt: integer("last_accessed_at", {
      mode: "timestamp_ms",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("enrollments_course_student_uq").on(
      table.courseId,
      table.studentId
    ),
  ]
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => courseLessons.id, { onDelete: "cascade" }),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(true),
    notes: text("notes"),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("lesson_progress_student_lesson_uq").on(
      table.studentId,
      table.lessonId
    ),
    index("lesson_progress_course_student_idx").on(
      table.courseId,
      table.studentId
    ),
  ]
);

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: contactStatuses }).notNull().default("NOVA"),
  adminNotes: text("admin_notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

