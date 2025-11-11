import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';

// Table: assessments (bilans de compétences)
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),

  // Données du bilan
  userName: varchar('user_name', { length: 255 }).notNull(),
  packageId: varchar('package_id', { length: 50 }).notNull(),
  packageName: varchar('package_name', { length: 255 }).notNull(),
  coachingStyle: varchar('coaching_style', { length: 50 }).notNull(),

  // État du bilan
  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  currentQuestionIndex: integer('current_question_index').default(0),
  totalQuestions: integer('total_questions').notNull(),

  // Dates
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Données JSON
  userProfile: jsonb('user_profile'), // { fullName, currentRole, keySkills, pastExperiences }
  dashboardData: jsonb('dashboard_data'), // { themes, skills }
}, (table) => ({
  clerkUserIdIdx: index('idx_clerk_user_id').on(table.clerkUserId),
  statusIdx: index('idx_status').on(table.status),
  startedAtIdx: index('idx_started_at').on(table.startedAt),
  lastActivityAtIdx: index('idx_last_activity_at').on(table.lastActivityAt),
  completedAtIdx: index('idx_completed_at').on(table.completedAt),
  // Composite index for common query: userId + status
  userIdStatusIdx: index('idx_user_id_status').on(table.clerkUserId, table.status),
}));

// Table: answers (réponses aux questions)
export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  // Question
  questionId: varchar('question_id', { length: 255 }).notNull(),
  questionTitle: text('question_title').notNull(),
  questionDescription: text('question_description'), // Soru açıklaması/detayı
  questionType: varchar('question_type', { length: 50 }).notNull(),
  questionTheme: varchar('question_theme', { length: 255 }),
  questionChoices: jsonb('question_choices'), // Multiple choice seçenekleri (string[])

  // Réponse
  value: text('value').notNull(),

  // Métadonnées
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_answers').on(table.assessmentId),
  answeredAtIdx: index('idx_answered_at').on(table.answeredAt),
}));

// Table: summaries (synthèses finales)
export const summaries = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }).unique(),

  // Synthèse complète (JSON structuré)
  profileType: varchar('profile_type', { length: 255 }).notNull(),
  priorityThemes: jsonb('priority_themes').notNull(), // string[]
  maturityLevel: text('maturity_level').notNull(),
  keyStrengths: jsonb('key_strengths').notNull(), // SummaryPoint[]
  areasForDevelopment: jsonb('areas_for_development').notNull(), // SummaryPoint[]
  recommendations: jsonb('recommendations').notNull(), // string[]
  actionPlan: jsonb('action_plan').notNull(), // { shortTerm, mediumTerm }

  // Métadonnées
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_summaries').on(table.assessmentId),
}));

// Table: satisfaction_ratings (satisfaction par phase)
export const satisfactionRatings = pgTable('satisfaction_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  phaseName: varchar('phase_name', { length: 255 }).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_ratings').on(table.assessmentId),
}));

// Table: modules (modules optionnels complétés)
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  moduleId: varchar('module_id', { length: 100 }).notNull(),
  reason: text('reason').notNull(),
  accepted: boolean('accepted').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id_modules').on(table.assessmentId),
}));

// Types inférés
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
export type SatisfactionRating = typeof satisfactionRatings.$inferSelect;
export type NewSatisfactionRating = typeof satisfactionRatings.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
