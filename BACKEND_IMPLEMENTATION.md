# 🔧 BACKEND IMPLEMENTATION - BILAN-EASY

> **Guide complet pour implémenter le backend production-ready**
> Durée estimée : 4 semaines | Stack : Node.js + PostgreSQL + Clerk

---

## 🎯 OBJECTIFS

Passer de :
```
[React App] → [localStorage] ❌ Limité, local, volatile
```

À :
```
[React App] → [API REST] → [PostgreSQL] ✅ Cloud, sécurisé, scalable
              ↓ Auth
           [Clerk]
```

---

## 📊 STACK TECHNIQUE CHOISIE

### Backend
- **Framework** : Hono.js (ultra-rapide, moderne, edge-ready)
  - Alternatif : Express.js (plus classique)
- **Language** : TypeScript (cohérence avec frontend)
- **Runtime** : Node.js 18+

### Base de données
- **SGBD** : PostgreSQL 15+ (robuste, relationnel)
- **ORM** : Drizzle ORM (type-safe, performant)
  - Alternatif : Prisma (plus populaire, moins performant)
- **Migrations** : Drizzle Kit

### Authentification
- **Provider** : Clerk (plug-and-play, moderne)
  - Gratuit jusqu'à 10K users/mois
  - Auth social (Google, GitHub, etc.)
  - MFA intégré
  - Alternatif : Auth0, Supabase Auth

### Hosting
- **Backend** : Railway.app (PaaS simple, 5$/mois)
  - Alternatif : Render.com, Fly.io
- **BDD** : Railway PostgreSQL (inclus)
- **Frontend** : Vercel (déjà optimal pour React)

### Monitoring
- **Errors** : Sentry
- **Analytics** : Posthog
- **Logs** : Railway built-in

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Vue d'ensemble

```sql
┌─────────────┐
│   users     │ ← Clerk (external)
└──────┬──────┘
       │ 1
       │
       │ n
┌──────▼──────────┐
│  assessments    │ (bilans)
└──────┬──────────┘
       │ 1
       ├─────────────┐
       │ n           │ n
┌──────▼──────┐  ┌──▼─────────┐
│   answers   │  │ summaries  │
└─────────────┘  └────────────┘
```

---

### Tables détaillées

#### 1. `users` (géré par Clerk, on stocke juste la référence)

```typescript
// Clerk gère tout, on référence juste leur ID
// Pas besoin de créer cette table
```

#### 2. `assessments` (bilans)

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,  -- Référence Clerk

  -- Données du bilan
  user_name VARCHAR(255) NOT NULL,  -- Prénom de l'utilisateur
  package_id VARCHAR(50) NOT NULL,  -- 'decouverte' | 'approfondi' | 'strategique'
  package_name VARCHAR(255) NOT NULL,
  coaching_style VARCHAR(50) NOT NULL,  -- 'collaborative' | 'analytic' | 'creative'

  -- État
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',  -- 'in_progress' | 'completed' | 'abandoned'
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,

  -- Dates
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Métadonnées
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Profil utilisateur (si CV uploadé)
  user_profile JSONB,  -- { fullName, currentRole, keySkills, pastExperiences }

  -- Dashboard data
  dashboard_data JSONB,  -- Themes + skills

  -- Indexes
  INDEX idx_clerk_user_id (clerk_user_id),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at DESC)
);
```

#### 3. `answers` (réponses aux questions)

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,

  -- Question
  question_id VARCHAR(255) NOT NULL,
  question_title TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,  -- 'PARAGRAPH' | 'MULTIPLE_CHOICE'
  question_theme VARCHAR(255),

  -- Réponse
  value TEXT NOT NULL,

  -- Métadonnées
  answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_assessment_id (assessment_id),
  INDEX idx_answered_at (answered_at DESC)
);
```

#### 4. `summaries` (synthèses finales)

```sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE UNIQUE,

  -- Synthèse complète (JSON structuré)
  profile_type VARCHAR(255) NOT NULL,
  priority_themes JSONB NOT NULL,  -- string[]
  maturity_level TEXT NOT NULL,
  key_strengths JSONB NOT NULL,  -- SummaryPoint[]
  areas_for_development JSONB NOT NULL,  -- SummaryPoint[]
  recommendations JSONB NOT NULL,  -- string[]
  action_plan JSONB NOT NULL,  -- { shortTerm: ActionPlanItem[], mediumTerm: ActionPlanItem[] }

  -- Métadonnées
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Index
  INDEX idx_assessment_id (assessment_id)
);
```

#### 5. `satisfaction_ratings` (satisfaction par phase)

```sql
CREATE TABLE satisfaction_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,

  phase_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  INDEX idx_assessment_id (assessment_id)
);
```

#### 6. `modules` (modules optionnels complétés)

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,

  module_id VARCHAR(100) NOT NULL,  -- 'transition-management' | 'self-confidence' | 'work-life-balance'
  reason TEXT NOT NULL,  -- Pourquoi suggéré
  accepted BOOLEAN NOT NULL,  -- User a accepté ou refusé

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  INDEX idx_assessment_id (assessment_id)
);
```

---

## 🔌 API REST - ENDPOINTS

### Authentication (géré par Clerk)

Clerk gère automatiquement :
- `POST /sign-up` : Création compte
- `POST /sign-in` : Connexion
- `POST /sign-out` : Déconnexion
- `GET /user` : Infos user courant

**On ajoute juste le middleware** pour protéger nos endpoints.

---

### Assessments (Bilans)

#### **POST /api/assessments**
Créer un nouveau bilan

**Request**
```json
{
  "userName": "Marie",
  "packageId": "approfondi",
  "packageName": "Bilan Approfondi",
  "coachingStyle": "collaborative",
  "totalQuestions": 6,
  "userProfile": {  // Optionnel
    "fullName": "Marie Dupont",
    "currentRole": "Product Manager",
    "keySkills": ["Python", "SQL", "Leadership"],
    "pastExperiences": ["Startup tech", "Grande entreprise"]
  }
}
```

**Response**
```json
{
  "id": "uuid-123",
  "clerkUserId": "user_abc",
  "userName": "Marie",
  "packageId": "approfondi",
  "status": "in_progress",
  "currentQuestionIndex": 0,
  "startedAt": "2024-11-10T14:00:00Z",
  "createdAt": "2024-11-10T14:00:00Z"
}
```

---

#### **GET /api/assessments**
Lister tous les bilans de l'utilisateur connecté

**Query params**
- `status` : `in_progress` | `completed` | `abandoned` (optionnel)
- `limit` : nombre max (défaut: 20)
- `offset` : pagination (défaut: 0)

**Response**
```json
{
  "assessments": [
    {
      "id": "uuid-123",
      "userName": "Marie",
      "packageName": "Bilan Approfondi",
      "status": "completed",
      "startedAt": "2024-11-10T14:00:00Z",
      "completedAt": "2024-11-11T16:30:00Z",
      "summary": {
        "profileType": "Le Spécialiste en Transition"
      }
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

#### **GET /api/assessments/:id**
Récupérer un bilan spécifique avec toutes ses réponses

**Response**
```json
{
  "id": "uuid-123",
  "userName": "Marie",
  "packageId": "approfondi",
  "status": "in_progress",
  "currentQuestionIndex": 3,
  "answers": [
    {
      "id": "answer-1",
      "questionId": "phase1-motivations-01",
      "value": "Je cherche à donner plus de sens...",
      "answeredAt": "2024-11-10T14:05:00Z"
    }
  ],
  "dashboardData": {
    "themes": [{"text": "Sens", "weight": 8}],
    "skills": [{"label": "Communication", "score": 4}]
  }
}
```

---

#### **PATCH /api/assessments/:id**
Mettre à jour un bilan (sauvegarder progression)

**Request**
```json
{
  "currentQuestionIndex": 3,
  "lastActivityAt": "2024-11-10T15:00:00Z",
  "dashboardData": { /* ... */ }
}
```

---

#### **DELETE /api/assessments/:id**
Supprimer un bilan (RGPD)

**Response**
```json
{
  "deleted": true
}
```

---

### Answers (Réponses)

#### **POST /api/assessments/:assessmentId/answers**
Ajouter une réponse

**Request**
```json
{
  "questionId": "phase1-motivations-01",
  "questionTitle": "Qu'est-ce qui vous fait vous lever le matin ?",
  "questionType": "PARAGRAPH",
  "questionTheme": "Motivations",
  "value": "Je cherche à donner plus de sens à mon travail..."
}
```

**Response**
```json
{
  "id": "answer-123",
  "assessmentId": "uuid-123",
  "questionId": "phase1-motivations-01",
  "value": "Je cherche à...",
  "answeredAt": "2024-11-10T14:05:00Z"
}
```

---

#### **GET /api/assessments/:assessmentId/answers**
Récupérer toutes les réponses d'un bilan

**Response**
```json
{
  "answers": [
    {
      "id": "answer-1",
      "questionId": "phase1-motivations-01",
      "value": "...",
      "answeredAt": "2024-11-10T14:05:00Z"
    }
  ],
  "total": 3
}
```

---

### Summaries (Synthèses)

#### **POST /api/assessments/:assessmentId/summary**
Générer et sauvegarder la synthèse finale

**Request**
```json
{
  "profileType": "Le Spécialiste en Transition",
  "priorityThemes": ["Sens", "Impact", "Autonomie"],
  "maturityLevel": "Phase de clarification avancée",
  "keyStrengths": [
    {
      "text": "Capacité d'apprentissage rapide",
      "sources": ["J'ai appris Python en 3 mois..."]
    }
  ],
  "areasForDevelopment": [...],
  "recommendations": [...],
  "actionPlan": {
    "shortTerm": [...],
    "mediumTerm": [...]
  }
}
```

**Response**
```json
{
  "id": "summary-123",
  "assessmentId": "uuid-123",
  "profileType": "Le Spécialiste en Transition",
  "generatedAt": "2024-11-11T16:30:00Z"
}
```

---

#### **GET /api/assessments/:assessmentId/summary**
Récupérer la synthèse d'un bilan

**Response**
```json
{
  "id": "summary-123",
  "profileType": "Le Spécialiste en Transition",
  "priorityThemes": [...],
  "keyStrengths": [...],
  // ... toute la synthèse
}
```

---

### Satisfaction & Modules

#### **POST /api/assessments/:assessmentId/satisfaction**
Enregistrer satisfaction d'une phase

```json
{
  "phaseName": "Phase d'Investigation",
  "rating": 4,
  "comment": "Très pertinent, j'ai aimé l'approche"
}
```

#### **POST /api/assessments/:assessmentId/modules**
Enregistrer acceptation/refus d'un module

```json
{
  "moduleId": "transition-management",
  "reason": "Vous semblez avoir peur du changement",
  "accepted": true
}
```

---

## 💻 IMPLÉMENTATION BACKEND

### Structure du projet backend

```
backend/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── app.ts                # Configuration Hono
│   ├── db/
│   │   ├── schema.ts         # Schéma Drizzle
│   │   ├── client.ts         # Client PostgreSQL
│   │   └── migrations/       # Migrations SQL
│   ├── routes/
│   │   ├── assessments.ts    # Routes /api/assessments
│   │   ├── answers.ts        # Routes /api/answers
│   │   └── summaries.ts      # Routes /api/summaries
│   ├── middleware/
│   │   ├── auth.ts           # Clerk auth middleware
│   │   ├── error.ts          # Error handler
│   │   └── logger.ts         # Request logger
│   ├── services/
│   │   ├── assessmentService.ts
│   │   ├── answerService.ts
│   │   └── summaryService.ts
│   ├── types/
│   │   └── index.ts          # Types partagés
│   └── utils/
│       ├── validate.ts       # Validation Zod
│       └── response.ts       # Response helpers
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env
```

---

### Installation des dépendances

```bash
cd backend
npm init -y

# Framework
npm install hono

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Auth
npm install @clerk/backend

# Utils
npm install zod dotenv

# Dev
npm install -D typescript @types/node tsx
```

---

### Configuration `package.json`

```json
{
  "name": "bilan-easy-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@clerk/backend": "^1.0.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "drizzle-kit": "^0.20.0"
  }
}
```

---

### Configuration `.env`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_easy

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Gemini (pour appels depuis backend si besoin)
GEMINI_API_KEY=votre_clé
```

---

### Code : `src/db/schema.ts` (Drizzle)

```typescript
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),

  userName: varchar('user_name', { length: 255 }).notNull(),
  packageId: varchar('package_id', { length: 50 }).notNull(),
  packageName: varchar('package_name', { length: 255 }).notNull(),
  coachingStyle: varchar('coaching_style', { length: 50 }).notNull(),

  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  currentQuestionIndex: integer('current_question_index').default(0),
  totalQuestions: integer('total_questions').notNull(),

  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  userProfile: jsonb('user_profile'),
  dashboardData: jsonb('dashboard_data'),
}, (table) => ({
  clerkUserIdIdx: index('idx_clerk_user_id').on(table.clerkUserId),
  statusIdx: index('idx_status').on(table.status),
  startedAtIdx: index('idx_started_at').on(table.startedAt),
}));

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  questionId: varchar('question_id', { length: 255 }).notNull(),
  questionTitle: text('question_title').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(),
  questionTheme: varchar('question_theme', { length: 255 }),

  value: text('value').notNull(),

  answeredAt: timestamp('answered_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id').on(table.assessmentId),
  answeredAtIdx: index('idx_answered_at').on(table.answeredAt),
}));

export const summaries = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }).unique(),

  profileType: varchar('profile_type', { length: 255 }).notNull(),
  priorityThemes: jsonb('priority_themes').notNull(),
  maturityLevel: text('maturity_level').notNull(),
  keyStrengths: jsonb('key_strengths').notNull(),
  areasForDevelopment: jsonb('areas_for_development').notNull(),
  recommendations: jsonb('recommendations').notNull(),
  actionPlan: jsonb('action_plan').notNull(),

  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id').on(table.assessmentId),
}));

export const satisfactionRatings = pgTable('satisfaction_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  phaseName: varchar('phase_name', { length: 255 }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id').on(table.assessmentId),
}));

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),

  moduleId: varchar('module_id', { length: 100 }).notNull(),
  reason: text('reason').notNull(),
  accepted: boolean('accepted').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  assessmentIdIdx: index('idx_assessment_id').on(table.assessmentId),
}));

// Types
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
```

---

### Code : `src/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

---

### Code : `src/middleware/auth.ts` (Clerk)

```typescript
import { Context, Next } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

export const requireAuth = async (c: Context, next: Next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Ajouter userId au context pour les routes
  c.set('userId', auth.userId);

  await next();
};

export { clerkMiddleware };
```

---

### Code : `src/routes/assessments.ts`

```typescript
import { Hono } from 'hono';
import { db } from '../db/client';
import { assessments, answers } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const app = new Hono();

// Validation schema
const createAssessmentSchema = z.object({
  userName: z.string().min(1),
  packageId: z.enum(['decouverte', 'approfondi', 'strategique']),
  packageName: z.string(),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  totalQuestions: z.number().int().positive(),
  userProfile: z.object({
    fullName: z.string().optional(),
    currentRole: z.string(),
    keySkills: z.array(z.string()),
    pastExperiences: z.array(z.string()),
  }).optional(),
});

// POST /api/assessments - Créer un bilan
app.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const validated = createAssessmentSchema.parse(body);

    const [assessment] = await db.insert(assessments).values({
      clerkUserId: userId,
      userName: validated.userName,
      packageId: validated.packageId,
      packageName: validated.packageName,
      coachingStyle: validated.coachingStyle,
      totalQuestions: validated.totalQuestions,
      userProfile: validated.userProfile,
    }).returning();

    return c.json(assessment, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Error creating assessment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/assessments - Lister les bilans
app.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const where = status
      ? and(eq(assessments.clerkUserId, userId), eq(assessments.status, status))
      : eq(assessments.clerkUserId, userId);

    const results = await db.query.assessments.findMany({
      where,
      orderBy: [desc(assessments.startedAt)],
      limit,
      offset,
    });

    const total = results.length; // TODO: Proper count query

    return c.json({
      assessments: results,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/assessments/:id - Récupérer un bilan
app.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');

    const assessment = await db.query.assessments.findFirst({
      where: and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ),
    });

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    // Récupérer les réponses associées
    const assessmentAnswers = await db.query.answers.findMany({
      where: eq(answers.assessmentId, id),
      orderBy: [answers.answeredAt],
    });

    return c.json({
      ...assessment,
      answers: assessmentAnswers,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /api/assessments/:id - Mettre à jour
app.patch('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();

    const [updated] = await db.update(assessments)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ))
      .returning();

    if (!updated) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    return c.json(updated);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/assessments/:id - Supprimer (RGPD)
app.delete('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');

    await db.delete(assessments)
      .where(and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ));

    return c.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
```

---

### Code : `src/app.ts` (Configuration Hono)

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { clerkMiddleware } from './middleware/auth';
import assessmentsRoutes from './routes/assessments';
// Import autres routes...

const app = new Hono();

// Middleware global
app.use('*', logger());
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use('*', clerkMiddleware());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes API
app.route('/api/assessments', assessmentsRoutes);
// app.route('/api/answers', answersRoutes);
// app.route('/api/summaries', summariesRoutes);

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
```

---

### Code : `src/index.ts`

```typescript
import { serve } from '@hono/node-server';
import app from './app';
import 'dotenv/config';

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

---

## 🔐 AUTHENTIFICATION CLERK - INTÉGRATION FRONTEND

### Installation

```bash
cd ..  # Retour à la racine du projet frontend
npm install @clerk/clerk-react
```

### Configuration `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

### Ajout `.env` frontend

```bash
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=votre_clé  # Gardé pour l'instant (sera migré backend plus tard)
```

### Composant Auth : `src/components/AuthGuard.tsx`

```typescript
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { ReactNode } from 'react';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    );
  }

  return <>{children}</>;
};
```

### Mise à jour `App.tsx`

```typescript
import { AuthGuard } from './components/AuthGuard';
import { UserButton } from '@clerk/clerk-react';

const App: React.FC = () => {
  // ... code existant

  return (
    <AuthGuard>
      <div className="App">
        {/* Bouton user en haut à droite */}
        <div className="fixed top-4 right-4 z-50">
          <UserButton afterSignOutUrl="/" />
        </div>

        {renderContent()}
      </div>
    </AuthGuard>
  );
};
```

---

## 🔌 CLIENT API FRONTEND

### Créer `src/services/apiClient.ts`

```typescript
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getHeaders(token: string | null) {
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}, token: string | null): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Assessments
  async createAssessment(data: any, token: string) {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAssessments(token: string, params?: { status?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/assessments?${query}`, {}, token);
  }

  async getAssessment(id: string, token: string) {
    return this.request(`/assessments/${id}`, {}, token);
  }

  async updateAssessment(id: string, data: any, token: string) {
    return this.request(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteAssessment(id: string, token: string) {
    return this.request(`/assessments/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Answers
  async addAnswer(assessmentId: string, data: any, token: string) {
    return this.request(`/assessments/${assessmentId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  // Summaries
  async createSummary(assessmentId: string, data: any, token: string) {
    return this.request(`/assessments/${assessmentId}/summary`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getSummary(assessmentId: string, token: string) {
    return this.request(`/assessments/${assessmentId}/summary`, {}, token);
  }
}

export const apiClient = new ApiClient();

// Hook React pour utiliser l'API avec auth automatique
export const useApi = () => {
  const { getToken } = useAuth();

  return {
    createAssessment: async (data: any) => {
      const token = await getToken();
      return apiClient.createAssessment(data, token);
    },
    getAssessments: async (params?: any) => {
      const token = await getToken();
      return apiClient.getAssessments(token, params);
    },
    // ... autres méthodes
  };
};
```

---

## 📋 MIGRATION DE LOCALSTORAGE VERS API

### Plan de migration

1. **Phase 1** : Backend déployé, frontend utilise toujours localStorage
2. **Phase 2** : Frontend utilise API pour nouveaux bilans, localStorage pour anciens (lecture seule)
3. **Phase 3** : Migration automatique localStorage → API au login
4. **Phase 4** : Suppression complète du code localStorage

### Code migration : `src/services/migrationService.ts`

```typescript
import { useApi } from './apiClient';

export const migrateLocalStorageToApi = async () => {
  const api = useApi();

  // Récupérer toutes les clés autosave
  const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave-'));

  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const [_, userName, packageId] = key.split('-');

      // Créer le bilan sur l'API
      const assessment = await api.createAssessment({
        userName,
        packageId,
        // ... autres données à extraire de data
      });

      // Ajouter toutes les réponses
      for (const answer of data) {
        await api.addAnswer(assessment.id, answer);
      }

      // Supprimer localStorage
      localStorage.removeItem(key);

      console.log(`✅ Migrated ${key}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${key}:`, error);
    }
  }

  // Migrer historique
  const historyData = localStorage.getItem('bilan-history');
  if (historyData) {
    // ... migration similaire
    localStorage.removeItem('bilan-history');
  }

  console.log('✅ Migration complete');
};
```

---

## 🚀 DÉPLOIEMENT

### Railway.app (Backend + BDD)

1. **Créer compte** : https://railway.app/
2. **New Project** → Deploy PostgreSQL
3. **New Service** → GitHub (connecter votre repo backend)
4. **Variables d'environnement** :
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-rempli
   CLERK_SECRET_KEY=sk_test_...
   PORT=3001
   FRONTEND_URL=https://votre-app.vercel.app
   ```
5. **Deploy** → Automatic sur chaque push

### Vercel (Frontend)

1. **Import repo** GitHub
2. **Framework Preset** : Vite
3. **Variables d'environnement** :
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_URL=https://votre-backend.railway.app/api
   GEMINI_API_KEY=...
   ```
4. **Deploy**

---

## ✅ CHECKLIST COMPLÈTE

### Semaine 1 : Setup Backend
- [ ] Créer dossier `backend/`
- [ ] Installer dépendances (Hono, Drizzle, Clerk)
- [ ] Configurer `.env`
- [ ] Créer schéma BDD (`schema.ts`)
- [ ] Configurer Drizzle client
- [ ] Créer tables PostgreSQL (local d'abord)
- [ ] Tester connexion BDD

### Semaine 2 : API Core
- [ ] Middleware auth Clerk
- [ ] Routes `/api/assessments` (CRUD)
- [ ] Routes `/api/answers` (Create, List)
- [ ] Routes `/api/summaries` (Create, Get)
- [ ] Error handling global
- [ ] Tests manuels Postman

### Semaine 3 : Intégration Frontend
- [ ] Installer `@clerk/clerk-react`
- [ ] Configurer Clerk provider
- [ ] Créer `AuthGuard` component
- [ ] Créer `apiClient.ts`
- [ ] Migrer localStorage → API pour nouveaux bilans
- [ ] Tester flow complet

### Semaine 4 : Migration & Deploy
- [ ] Créer script migration localStorage → API
- [ ] Déployer backend sur Railway
- [ ] Déployer frontend sur Vercel
- [ ] Tester en production
- [ ] Monitoring Sentry + Posthog
- [ ] Documentation API (Swagger/OpenAPI)

---

## 🎯 RÉSULTAT FINAL

**Avant** :
```
[React] → [localStorage] ❌
- Limité 5-10 MB
- Perdu si cache effacé
- Pas de sync multi-device
- Pas d'auth
```

**Après** :
```
[React] → [Clerk Auth] → [Hono API] → [PostgreSQL] ✅
- Stockage illimité
- Persistant cloud
- Multi-device sync
- Sécurisé (auth + HTTPS)
- Prêt pour paiement Stripe
- Analytics possibles
```

---

## 💰 COÛTS ESTIMÉS

| Service | Plan | Coût |
|---------|------|------|
| **Railway** | Hobby | 5$/mois |
| **Clerk** | Free | 0$/mois (jusqu'à 10K users) |
| **Vercel** | Free | 0$/mois |
| **PostgreSQL** | Inclus Railway | 0$/mois |
| **Total** | | **5$/mois** |

Scalable jusqu'à 10K users avant de payer plus.

---

## 📚 RESSOURCES

- **Hono docs** : https://hono.dev/
- **Drizzle ORM** : https://orm.drizzle.team/
- **Clerk docs** : https://clerk.com/docs
- **Railway docs** : https://docs.railway.app/

---

<div align="center">

**Backend Implementation Plan**

**Prêt à démarrer ? On commence par quoi ?** 🚀

1. Setup backend local ?
2. Créer les tables BDD ?
3. Code API endpoints ?
4. Intégration Clerk frontend ?

</div>
