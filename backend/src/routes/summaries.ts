import { Hono } from 'hono';
import { db, summaries, assessments } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, and } from 'drizzle-orm';
import { createSummarySchema } from '../utils/validate.js';
import { success, error } from '../utils/response.js';

const app = new Hono();

// POST /api/assessments/:assessmentId/summary - Créer/Sauvegarder la synthèse
app.post('/:assessmentId/summary', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
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
    const validated = createSummarySchema.parse(body);

    // Créer ou mettre à jour la synthèse
    const existingSummary = await db.query.summaries.findFirst({
      where: eq(summaries.assessmentId, assessmentId),
    });

    let summary;
    if (existingSummary) {
      // Update existing
      [summary] = await db.update(summaries)
        .set({
          profileType: validated.profileType,
          priorityThemes: validated.priorityThemes,
          maturityLevel: validated.maturityLevel,
          keyStrengths: validated.keyStrengths,
          areasForDevelopment: validated.areasForDevelopment,
          recommendations: validated.recommendations,
          actionPlan: validated.actionPlan,
          generatedAt: new Date(),
        })
        .where(eq(summaries.id, existingSummary.id))
        .returning();
    } else {
      // Create new
      [summary] = await db.insert(summaries).values({
        assessmentId,
        profileType: validated.profileType,
        priorityThemes: validated.priorityThemes,
        maturityLevel: validated.maturityLevel,
        keyStrengths: validated.keyStrengths,
        areasForDevelopment: validated.areasForDevelopment,
        recommendations: validated.recommendations,
        actionPlan: validated.actionPlan,
      }).returning();
    }

    // Marquer l'assessment comme completed
    await db.update(assessments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));

    return success(c, summary, 201);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 400);
    }
    return error(c, 'Failed to create summary', 500);
  }
});

// GET /api/assessments/:assessmentId/summary - Récupérer la synthèse
app.get('/:assessmentId/summary', requireAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
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

    // Récupérer la synthèse
    const summary = await db.query.summaries.findFirst({
      where: eq(summaries.assessmentId, assessmentId),
    });

    if (!summary) {
      return error(c, 'Summary not found', 404);
    }

    return success(c, summary);
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500);
    }
    return error(c, 'Failed to fetch summary', 500);
  }
});

export default app;
