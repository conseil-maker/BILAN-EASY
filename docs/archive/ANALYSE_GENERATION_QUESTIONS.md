# Analyse du Mécanisme de Génération de Questions

**Date :** 17 décembre 2025  
**Version :** 1.0  
**Objectif :** Analyser le système actuel et proposer des améliorations pour garantir personnalisation et conformité Qualiopi

---

## 1. Architecture Actuelle

### 1.1 Flux de Génération

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUESTIONNAIRE.TSX                            │
│  handleAnswerSubmit() → runNextStep() → fetchNextQuestion()     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GEMINI SERVICE                               │
│  generateQuestion(phase, category, answers, userName, style)    │
│                                                                 │
│  1. Construit le prompt avec contexte                          │
│  2. Appelle Gemini API (gemini-1.5-flash)                      │
│  3. Parse la réponse JSON                                       │
│  4. Fallback si échec → fallbackQuestions.ts                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Composants Clés

| Fichier | Rôle |
|---------|------|
| `geminiService.ts` | Génération IA des questions |
| `fallbackQuestions.ts` | Questions de secours (17 questions) |
| `constants.ts` | Configuration des phases et catégories |
| `Questionnaire.tsx` | Orchestration du parcours |

---

## 2. Points Forts Actuels ✅

### 2.1 Conformité Qualiopi

| Exigence | Implémentation | Statut |
|----------|----------------|--------|
| 3 phases obligatoires | `QUESTION_CATEGORIES` avec phase1, phase2, phase3 | ✅ |
| Personnalisation | 3 styles de coaching (analytique, créatif, collaboratif) | ✅ |
| Adaptation au profil | `userProfile` utilisé pour la première question | ✅ |
| Complexité progressive | 4 niveaux (simple, moyenne, complexe, réflexion) | ✅ |

### 2.2 Mécanismes de Sécurité

| Mécanisme | Description |
|-----------|-------------|
| Timeout | 30s puis 20s avec retry |
| Fallback | Questions pré-générées si API échoue |
| ID unique | Généré côté client pour éviter les doublons |
| Avertissement répétition | Liste des 10 dernières questions dans le prompt |

---

## 3. Problèmes Identifiés 🔴

### 3.1 CRITIQUE : Répétition des Questions

**Symptôme :** Chaque question est posée 2 fois consécutives

**Cause identifiée :** Problème de timing React - `fetchNextQuestion()` utilisait l'ancien state `answers` au lieu des `newAnswers` fraîchement créées.

**Correction appliquée :** `fetchNextQuestion` accepte maintenant `currentAnswers` en paramètre.

**Statut :** ⚠️ À VALIDER

### 3.2 CRITIQUE : Transition de Phase Bloquée

**Symptôme :** Après le badge "Phase Préliminaire terminée", aucune nouvelle question ne se charge.

**Cause identifiée :** `fetchNextQuestion()` n'était pas appelé après la transition de phase.

**Correction appliquée :** Ajout de `console.log` et appel systématique de `fetchNextQuestion()` après transition.

**Statut :** ⚠️ À VALIDER

### 3.3 MOYEN : Fallback Limité

**Problème :** Seulement 17 questions de fallback pour 17 catégories.

**Impact :** Si l'API échoue plusieurs fois dans une catégorie, les mêmes questions reviennent.

**Recommandation :** Enrichir à 50+ questions de fallback.

### 3.4 MOYEN : Prompt Trop Long

**Problème :** Le prompt inclut tout l'historique des réponses, ce qui peut :
- Dépasser les limites de tokens
- Ralentir la génération
- Créer de la confusion pour l'IA

**Recommandation :** Limiter à un résumé des 5 dernières réponses + thèmes couverts.

### 3.5 FAIBLE : Manque de Traçabilité

**Problème :** Pas de logs persistants pour analyser les patterns de questions.

**Impact :** Difficile de diagnostiquer les problèmes de répétition.

**Recommandation :** Ajouter un système de logging dans Supabase.

---

## 4. Écarts avec le Cahier des Charges Qualiopi

### 4.1 Phase Préliminaire (Art. L.6313-4)

| Exigence | Implémentation | Écart |
|----------|----------------|-------|
| Analyse de la demande | Questions sur motivations et attentes | ✅ OK |
| Information sur le déroulement | Phase préliminaire structurée | ✅ OK |
| Définition des objectifs | Catégorie "definition_besoins" | ✅ OK |
| Consentement éclairé | 6 cases à cocher | ✅ OK |

### 4.2 Phase d'Investigation (Art. R.6313-4)

| Exigence | Implémentation | Écart |
|----------|----------------|-------|
| Analyse des motivations | Catégorie "motivations_valeurs" | ✅ OK |
| Identification des compétences | Catégories "competences_*" | ✅ OK |
| Exploration des possibilités | Catégorie "exploration_possibilites" | ✅ OK |
| Analyse du marché | Recherche Google intégrée | ✅ OK |

### 4.3 Phase de Conclusion (Art. R.6313-7)

| Exigence | Implémentation | Écart |
|----------|----------------|-------|
| Synthèse des résultats | `generateSummary()` | ✅ OK |
| Plan d'action | `actionPlan` dans le schéma | ✅ OK |
| Document de synthèse | `syntheseService.ts` | ✅ OK |
| Suivi à 6 mois | Email automatique prévu | ⚠️ Non testé |

---

## 5. Recommandations d'Amélioration

### 5.1 PRIORITÉ HAUTE - Fiabilité

#### A. Améliorer la Déduplication des Questions

```typescript
// AVANT (insuffisant)
const previousQuestionIds = previousAnswers.map(a => a.questionId).join(', ');

// APRÈS (plus robuste)
const previousQuestionSignatures = previousAnswers.map(a => ({
  id: a.questionId,
  title: a.questionTitle,
  theme: a.theme,
  keywords: extractKeywords(a.questionTitle) // Nouveau
}));
```

**Bénéfice :** L'IA peut détecter les questions similaires même si l'ID est différent.

#### B. Ajouter un Cache de Questions Générées

```typescript
// Nouveau service: questionCacheService.ts
interface QuestionCache {
  sessionId: string;
  generatedQuestions: Question[];
  themes_covered: string[];
  last_updated: Date;
}

// Avant de générer, vérifier si une question similaire existe
const existingQuestion = cache.find(q => 
  similarity(q.title, newQuestion.title) > 0.8
);
```

**Bénéfice :** Évite les répétitions même si l'IA génère une question similaire.

#### C. Enrichir les Questions de Fallback

| Catégorie | Actuel | Recommandé |
|-----------|--------|------------|
| parcours_professionnel | 3 | 8 |
| competences_techniques | 2 | 6 |
| motivations | 2 | 6 |
| valeurs | 2 | 5 |
| realisations | 2 | 5 |
| projet_professionnel | 2 | 6 |
| synthese | 2 | 4 |
| **TOTAL** | **17** | **50+** |

### 5.2 PRIORITÉ MOYENNE - Personnalisation

#### A. Améliorer le Contexte Utilisateur

```typescript
// Nouveau: Résumé intelligent du profil
const profileSummary = {
  sector: detectSector(answers),
  experience_level: detectExperienceLevel(answers),
  career_stage: detectCareerStage(answers), // junior, mid, senior, transition
  key_themes: extractKeyThemes(answers),
  personality_traits: detectPersonalityTraits(answers)
};
```

**Bénéfice :** Questions plus pertinentes basées sur le profil détecté.

#### B. Adapter la Complexité Dynamiquement

```typescript
// Nouveau: Ajustement basé sur les réponses
const adaptComplexity = (answers: Answer[]): QuestionComplexity => {
  const avgResponseLength = answers.reduce((sum, a) => sum + a.value.length, 0) / answers.length;
  const avgResponseTime = calculateAvgResponseTime(answers);
  
  if (avgResponseLength < 100 && avgResponseTime < 60) return 'simple';
  if (avgResponseLength > 500 && avgResponseTime > 300) return 'reflexion';
  return 'moyenne';
};
```

**Bénéfice :** Parcours adapté au rythme de l'utilisateur.

#### C. Ajouter des Questions de Relance Intelligentes

```typescript
// Nouveau: Détection des réponses courtes
const needsFollowUp = (answer: Answer): boolean => {
  return answer.value.length < 50 || 
         answer.value.split(' ').length < 10 ||
         !answer.value.includes('parce que') && !answer.value.includes('car');
};

// Si réponse courte, générer une question de relance
if (needsFollowUp(lastAnswer)) {
  return generateFollowUpQuestion(lastAnswer);
}
```

**Bénéfice :** Réponses plus riches et détaillées.

### 5.3 PRIORITÉ BASSE - Traçabilité

#### A. Logging des Questions Générées

```sql
-- Nouvelle table Supabase
CREATE TABLE question_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES assessments(id),
  question_id TEXT NOT NULL,
  question_title TEXT NOT NULL,
  question_theme TEXT,
  generation_method TEXT, -- 'gemini' | 'fallback'
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Bénéfice :** Analyse des patterns et amélioration continue.

#### B. Dashboard de Monitoring

- Taux de fallback par session
- Questions les plus répétées
- Temps moyen de génération
- Erreurs API Gemini

---

## 6. Plan d'Action Proposé

### Phase 1 : Corrections Critiques (Immédiat)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Valider la correction du bug de répétition | 30 min | 🔴 Critique |
| 2 | Valider la correction de transition de phase | 30 min | 🔴 Critique |
| 3 | Ajouter des logs console pour debug | 1h | 🟡 Moyen |

### Phase 2 : Amélioration de la Fiabilité (Court terme)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 4 | Enrichir les questions de fallback (50+) | 2h | 🟡 Moyen |
| 5 | Ajouter un cache de questions générées | 3h | 🟡 Moyen |
| 6 | Améliorer la déduplication par similarité | 2h | 🟡 Moyen |

### Phase 3 : Personnalisation Avancée (Moyen terme)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 7 | Détection automatique du profil utilisateur | 4h | 🟢 Élevé |
| 8 | Adaptation dynamique de la complexité | 3h | 🟢 Élevé |
| 9 | Questions de relance intelligentes | 3h | 🟢 Élevé |

### Phase 4 : Traçabilité (Long terme)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 10 | Table de logging Supabase | 2h | 🟢 Élevé |
| 11 | Dashboard de monitoring | 4h | 🟢 Élevé |

---

## 7. Conclusion

Le système actuel est **fonctionnellement conforme à Qualiopi** mais souffre de **problèmes de fiabilité** qui impactent l'expérience utilisateur :

1. **Répétition des questions** - Partiellement corrigé, à valider
2. **Transition de phase** - Corrigé, à valider
3. **Fallback limité** - À enrichir

Les améliorations proposées permettront de :
- Garantir un parcours fluide sans répétition
- Offrir une personnalisation "haute couture"
- Maintenir la conformité Qualiopi
- Faciliter le diagnostic des problèmes

**Prochaine étape recommandée :** Valider les corrections en cours puis enrichir les questions de fallback.

---

*Rapport généré le 17 décembre 2025*
