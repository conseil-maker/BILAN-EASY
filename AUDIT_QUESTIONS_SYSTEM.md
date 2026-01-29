# Audit du Système de Génération de Questions - Bilan Easy

**Date :** 29 janvier 2026  
**Version analysée :** Production (bilan-easy.vercel.app)

---

## 1. Architecture du Système

### 1.1 Composants Analysés

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `geminiService.ts` | Service principal IA (Gemini 2.5 Pro) | ~1239 |
| `smartQuestionGenerator.ts` | Générateur intelligent côté client (fallback) | ~287 |
| `fallbackQuestions.ts` | Questions de secours statiques | ~799 |
| `constants.ts` | Configuration des phases et catégories | ~510 |
| `Questionnaire.tsx` | Orchestration et logique de flux | ~1000+ |

### 1.2 Flux de Génération

```
Utilisateur répond → handleAnswerSubmit() → runNextStep() → fetchNextQuestion()
                                                               ↓
                                                    generateQuestion() [geminiService]
                                                               ↓
                                                    [Succès] → Question IA personnalisée
                                                    [Échec] → smartQuestionGenerator (fallback 1)
                                                    [Échec] → fallbackQuestions (fallback 2)
```

---

## 2. Anomalies Identifiées

### 2.1 🔴 CRITIQUE - Prompts de Phase 2 Trop Catégoriques

**Problème :** Le prompt de `generateQuestion` pour la phase 2 est très structuré et catégorique, ce qui contraste brutalement avec la phase 1 plus conversationnelle.

**Localisation :** `geminiService.ts` lignes 400-500

**Impact :** 
- Transition brusque ressentie par l'utilisateur
- Questions qui passent de "Parlez-moi de vous" à "Évaluez vos compétences en..."
- Perte de la fluidité conversationnelle

**Solution proposée :**
```typescript
// Ajouter une instruction de transition douce dans le prompt
const phaseInstructions = {
  phase1: "Questions ouvertes et exploratoires, ton conversationnel",
  phase2_start: "Transition douce - commencer par des questions semi-ouvertes avant d'aller vers l'analyse",
  phase2_mid: "Questions plus structurées mais toujours bienveillantes",
  phase3: "Questions de projection et validation, ton encourageant"
};
```

### 2.2 🟠 MAJEUR - Pas de Mémoire Contextuelle Inter-Questions

**Problème :** Chaque question est générée avec le contexte des 5 dernières réponses seulement. L'IA peut donc poser des questions redondantes ou ignorer des informations importantes partagées plus tôt.

**Localisation :** `geminiService.ts` ligne 389
```typescript
const recentHistory = previousAnswers.slice(-5);
```

**Impact :**
- Questions parfois répétitives
- L'IA "oublie" des informations importantes
- Manque de cohérence sur un bilan long (100+ questions)

**Solution proposée :**
```typescript
// Créer un résumé progressif des informations clés
const profileSummary = await generateProfileSummary(previousAnswers);
// Utiliser ce résumé + les 5 dernières réponses
```

### 2.3 🟠 MAJEUR - Validation Post-Génération Insuffisante

**Problème :** Le système rejette les "questions de validation" mais pas les questions trop génériques ou hors contexte.

**Localisation :** `geminiService.ts` lignes 616-645

**Patterns actuellement filtrés :**
- "est-ce que cette synthèse"
- "si je résume"
- "confirmer"
- etc.

**Patterns manquants :**
- Questions trop courtes (< 20 caractères)
- Questions sans rapport avec le contexte
- Questions déjà posées (même si reformulées)
- Questions fermées quand une question ouverte est attendue

### 2.4 🟡 MODÉRÉ - Estimation de Complexité Imprécise

**Problème :** La complexité des questions est estimée uniquement par la longueur de la réponse, pas par le contenu.

**Localisation :** `Questionnaire.tsx` lignes 648-652
```typescript
let estimatedComplexity = 'moyenne';
if (value.length < 50) estimatedComplexity = 'simple';
else if (value.length > 200) estimatedComplexity = 'complexe';
```

**Impact :**
- Budget temps mal calculé
- Progression inexacte

### 2.5 🟡 MODÉRÉ - smartQuestionGenerator Limité

**Problème :** Le générateur de fallback côté client a seulement ~10 patterns de détection et ~30 questions prédéfinies.

**Localisation :** `smartQuestionGenerator.ts` lignes 16-117

**Impact :**
- Si l'API Gemini échoue, les questions deviennent répétitives
- Pas de personnalisation réelle

### 2.6 🟢 MINEUR - Description Technique dans les Questions

**Problème :** La description "Question générée en fonction de votre réponse précédente" apparaît parfois.

**Localisation :** `smartQuestionGenerator.ts` ligne 244
```typescript
description: "Question générée en fonction de votre réponse précédente."
```

**Solution :** Déjà partiellement corrigé dans `geminiService.ts` avec le filtre `technicalPhrases`, mais pas dans le fallback.

---

## 3. Améliorations Recommandées

### 3.1 🔴 PRIORITÉ HAUTE - Améliorer les Transitions de Phase

**Action :** Modifier le prompt de génération pour inclure des instructions de transition douce.

```typescript
// Dans geminiService.ts - generateQuestion
const getPhaseTransitionInstructions = (phase: number, questionCount: number) => {
  if (phase === 2 && questionCount < 3) {
    return `
TRANSITION DOUCE: Nous venons de terminer la phase préliminaire.
- Commencer par une question semi-ouverte qui fait le lien avec ce qui a été partagé
- Éviter les questions trop structurées ou catégoriques pour l'instant
- Garder un ton conversationnel et bienveillant
    `;
  }
  if (phase === 3 && questionCount < 2) {
    return `
TRANSITION VERS LA CONCLUSION: Nous avons bien exploré le profil.
- Commencer par valoriser le travail accompli
- Introduire progressivement les questions de projection
- Maintenir l'élan positif
    `;
  }
  return '';
};
```

### 3.2 🔴 PRIORITÉ HAUTE - Implémenter un Résumé Progressif du Profil

**Action :** Créer une fonction qui maintient un résumé structuré du profil au fil des réponses.

```typescript
interface ProfileSummary {
  parcours: string[];           // Points clés du parcours
  competences: string[];        // Compétences identifiées
  motivations: string[];        // Motivations exprimées
  valeurs: string[];            // Valeurs mentionnées
  contraintes: string[];        // Contraintes identifiées
  projet: string | null;        // Projet professionnel si exprimé
  questionsAbordees: string[];  // Thèmes déjà couverts
}

const updateProfileSummary = async (
  currentSummary: ProfileSummary,
  newAnswer: Answer
): Promise<ProfileSummary> => {
  // Utiliser l'IA pour extraire et mettre à jour les informations clés
};
```

### 3.3 🟠 PRIORITÉ MOYENNE - Améliorer la Validation des Questions

**Action :** Ajouter des validations supplémentaires post-génération.

```typescript
const validateGeneratedQuestion = (
  question: Question,
  previousQuestions: string[],
  expectedType: 'open' | 'semi-open' | 'closed'
): { isValid: boolean; reason?: string } => {
  // Vérifier la longueur minimale
  if (question.title.length < 20) {
    return { isValid: false, reason: 'Question trop courte' };
  }
  
  // Vérifier la similarité avec les questions précédentes
  const similarity = checkSimilarity(question.title, previousQuestions);
  if (similarity > 0.8) {
    return { isValid: false, reason: 'Question trop similaire à une précédente' };
  }
  
  // Vérifier le type de question
  const isOpenQuestion = question.title.includes('?') && 
    !question.title.toLowerCase().startsWith('est-ce');
  if (expectedType === 'open' && !isOpenQuestion) {
    return { isValid: false, reason: 'Question fermée alors qu\'une ouverte est attendue' };
  }
  
  return { isValid: true };
};
```

### 3.4 🟠 PRIORITÉ MOYENNE - Enrichir le Générateur de Fallback

**Action :** Ajouter plus de patterns et de questions au `smartQuestionGenerator.ts`.

```typescript
// Nouveaux patterns à ajouter
const ADDITIONAL_PATTERNS: KeywordPattern[] = [
  {
    patterns: [/formation/i, /diplôme/i, /certif/i, /apprendre/i],
    questions: [
      "Vous mentionnez la formation. Quelles compétences aimeriez-vous développer dans les prochains mois ?",
      "L'apprentissage semble important pour vous. Comment intégrez-vous la formation continue dans votre parcours ?",
      "Vous parlez de vous former. Quel serait votre mode d'apprentissage idéal ?"
    ],
    theme: "Formation et développement"
  },
  {
    patterns: [/salaire/i, /rémunération/i, /argent/i, /financ/i],
    questions: [
      "La question financière est importante. Au-delà du salaire, quels autres éléments de rémunération comptent pour vous ?",
      "Vous évoquez l'aspect financier. Comment équilibrez-vous vos aspirations salariales avec vos autres critères ?",
      "La rémunération est un facteur. Quel niveau de vie souhaitez-vous maintenir ou atteindre ?"
    ],
    theme: "Rémunération et avantages"
  },
  // ... autres patterns
];
```

### 3.5 🟡 PRIORITÉ BASSE - Améliorer l'Estimation de Complexité

**Action :** Utiliser l'IA pour évaluer la complexité de la réponse.

```typescript
const estimateResponseComplexity = async (
  response: string,
  question: string
): Promise<QuestionComplexity> => {
  // Critères : longueur, profondeur de réflexion, exemples concrets, etc.
  const analysis = await analyzeResponseDepth(response, question);
  return analysis.complexity;
};
```

---

## 4. Bugs Corrigés (Session Actuelle)

| Bug | Statut | Fichier |
|-----|--------|---------|
| Barre de réponse non vidée après envoi | ✅ Corrigé | `Questionnaire.tsx`, `useSpeechRecognition.ts` |
| Transition phase 1→2 brusque | ✅ Corrigé | `Questionnaire.tsx` (messages de transition) |
| Transition phase 2→3 brusque | ✅ Corrigé | `Questionnaire.tsx` (messages de transition) |
| Détection réponses hors-cadre | ✅ Implémenté | `geminiService.ts`, `Questionnaire.tsx` |

---

## 5. Métriques de Qualité Actuelles

### 5.1 Couverture des Catégories

| Phase | Catégories | Questions Fallback |
|-------|------------|-------------------|
| Phase 1 | 5 | 13 |
| Phase 2 | 8 | 35 |
| Phase 3 | 4 | 15 |

### 5.2 Robustesse

- **Fallback niveau 1 :** smartQuestionGenerator (~30 questions)
- **Fallback niveau 2 :** fallbackQuestions (~63 questions)
- **Retry automatique :** 3 tentatives avec délai progressif

### 5.3 Personnalisation

- Utilisation du prénom : ✅
- Style de coaching adaptatif : ✅ (collaborative, analytic, creative)
- Adaptation au forfait : ✅ (budget temps)
- Mémoire contextuelle : ⚠️ Limitée (5 dernières réponses)

---

## 6. Plan d'Action Recommandé

### Phase 1 - Corrections Immédiates (1-2 jours)
1. ✅ Corriger le bug de la barre de réponse
2. ✅ Ajouter les messages de transition de phase
3. ✅ Implémenter la détection hors-cadre

### Phase 2 - Améliorations Majeures (3-5 jours)
1. 🔲 Améliorer les prompts de transition douce
2. 🔲 Implémenter le résumé progressif du profil
3. 🔲 Enrichir le générateur de fallback

### Phase 3 - Optimisations (5-10 jours)
1. 🔲 Améliorer la validation post-génération
2. 🔲 Implémenter l'estimation de complexité par IA
3. 🔲 Ajouter des tests automatisés

---

## 7. Conclusion

Le système de génération de questions est fonctionnel et robuste grâce à ses multiples niveaux de fallback. Les principales améliorations à apporter concernent :

1. **La fluidité des transitions** entre les phases (partiellement corrigé)
2. **La mémoire contextuelle** pour éviter les répétitions sur les bilans longs
3. **La validation des questions** pour garantir leur pertinence

Les corrections déployées aujourd'hui (transitions, hors-cadre, barre de réponse) améliorent significativement l'expérience utilisateur. Les améliorations restantes peuvent être implémentées progressivement sans bloquer l'utilisation en production.
