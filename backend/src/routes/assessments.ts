import { Hono } from 'hono';
import { db, assessments, answers } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, and, desc, count } from 'drizzle-orm';
import { createAssessmentSchema, updateAssessmentSchema } from '../utils/validate.js';
import { success, error, paginated } from '../utils/response.js';

const app = new Hono();

// POST /api/assessments - Créer un nouveau bilan
app.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json();

    // Validation
    const validated = createAssessmentSchema.parse(body);

    // Créer l'assessment
    const [assessment] = await db.insert(assessments).values({
      clerkUserId: userId,
      userName: validated.userName,
      packageId: validated.packageId,
      packageName: validated.packageName,
      coachingStyle: validated.coachingStyle,
      totalQuestions: validated.totalQuestions,
      status: 'in_progress',
      currentQuestionIndex: 0,
      userProfile: validated.userProfile || null,
      dashboardData: null,
    }).returning();

    return success(c, assessment, 201);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 400);
    }
    return error(c, 'Failed to create assessment', 500);
  }
});

// GET /api/assessments - Lister tous les bilans de l'utilisateur
app.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const statusFilter = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    // Build where clause
    let whereClause = eq(assessments.clerkUserId, userId);
    if (statusFilter) {
      whereClause = and(
        whereClause,
        eq(assessments.status, statusFilter)
      ) as any;
    }

    // Query assessments
    const results = await db.query.assessments.findMany({
      where: whereClause,
      orderBy: [desc(assessments.startedAt)],
      limit,
      offset,
    });

    // Count total
    const [totalResult] = await db
      .select({ count: count() })
      .from(assessments)
      .where(whereClause);

    return paginated(c, results, totalResult?.count || 0, limit, offset);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch assessments', 500);
  }
});

// GET /api/assessments/:id - Récupérer un bilan spécifique avec ses réponses
app.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const id = c.req.param('id');

    // Récupérer l'assessment
    const assessment = await db.query.assessments.findFirst({
      where: and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ),
    });

    if (!assessment) {
      return error(c, 'Assessment not found', 404);
    }

    // Récupérer les réponses associées
    const assessmentAnswers = await db.query.answers.findMany({
      where: eq(answers.assessmentId, id),
      orderBy: [answers.answeredAt],
    });

    return success(c, {
      ...assessment,
      answers: assessmentAnswers,
    });
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch assessment', 500);
  }
});

// PATCH /api/assessments/:id - Mettre à jour un bilan (sauvegarder progression)
app.patch('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const id = c.req.param('id');
    const body = await c.req.json();

    // Validation
    const validated = updateAssessmentSchema.parse(body);

    // Mettre à jour
    const [updated] = await db.update(assessments)
      .set({
        ...validated,
        updatedAt: new Date(),
        lastActivityAt: validated.lastActivityAt ? new Date(validated.lastActivityAt) : new Date(),
        completedAt: validated.completedAt ? new Date(validated.completedAt) : undefined,
      })
      .where(and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ))
      .returning();

    if (!updated) {
      return error(c, 'Assessment not found', 404);
    }

    return success(c, updated);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 400);
    }
    return error(c, 'Failed to update assessment', 500);
  }
});

// DELETE /api/assessments/:id - Supprimer un bilan (RGPD)
app.delete('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const id = c.req.param('id');

    // Vérifier que l'assessment existe et appartient à l'utilisateur
    const assessment = await db.query.assessments.findFirst({
      where: and(
        eq(assessments.id, id),
        eq(assessments.clerkUserId, userId)
      ),
    });

    if (!assessment) {
      return error(c, 'Assessment not found', 404);
    }

    // Supprimer (cascade delete sur answers, summaries, etc.)
    await db.delete(assessments)
      .where(eq(assessments.id, id));

    return success(c, { deleted: true, id });
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to delete assessment', 500);
  }
});

export default app;
