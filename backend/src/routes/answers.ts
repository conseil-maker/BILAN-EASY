import { Hono } from 'hono';
import { db, answers, assessments } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, and } from 'drizzle-orm';
import { createAnswerSchema } from '../utils/validate.js';
import { success, error } from '../utils/response.js';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// POST /api/assessments/:assessmentId/answers - Ajouter une réponse
app.post('/:assessmentId/answers', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const assessmentId = c.req.param('assessmentId');
    const body = await c.req.json();

    // Vérifier que l'assessment appartient à l'utilisateur
    const assessment = await db.query.assessments.findFirst({
      where: and(
        eq(assessments.id, assessmentId),
        eq(assessments.clerkUserId, userId)
      ),
    });

    if (!assessment) {
      return error(c, 'Assessment not found', 404);
    }

    // Validation
    const validated = createAnswerSchema.parse(body);

    // Créer la réponse
    const [answer] = await db.insert(answers).values({
      assessmentId,
      questionId: validated.questionId,
      questionTitle: validated.questionTitle,
      questionType: validated.questionType,
      questionTheme: validated.questionTheme,
      value: validated.value,
    }).returning();

    // Mettre à jour lastActivityAt de l'assessment
    await db.update(assessments)
      .set({
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));

    return success(c, answer, 201);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 400);
    }
    return error(c, 'Failed to create answer', 500);
  }
});

// GET /api/assessments/:assessmentId/answers - Récupérer toutes les réponses d'un bilan
app.get('/:assessmentId/answers', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const assessmentId = c.req.param('assessmentId');

    // Vérifier que l'assessment appartient à l'utilisateur
    const assessment = await db.query.assessments.findFirst({
      where: and(
        eq(assessments.id, assessmentId),
        eq(assessments.clerkUserId, userId)
      ),
    });

    if (!assessment) {
      return error(c, 'Assessment not found', 404);
    }

    // Récupérer les réponses
    const assessmentAnswers = await db.query.answers.findMany({
      where: eq(answers.assessmentId, assessmentId),
      orderBy: [answers.answeredAt],
    });

    return success(c, {
      answers: assessmentAnswers,
      total: assessmentAnswers.length,
    });
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch answers', 500);
  }
});

export default app;
