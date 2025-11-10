# 🚀 Guide Technique pour AI Studio - BILAN-EASY

> **Prompt optimisé pour Google AI Studio**
> Ce document contient toutes les informations nécessaires pour comprendre, maintenir et développer le projet BILAN-EASY

---

## 📌 CONTEXTE DU PROJET

**BILAN-EASY** est une application React/TypeScript de bilan de compétences professionnel, alimentée par l'API Gemini 2.5. Elle guide les utilisateurs à travers 3 phases structurées (Investigation, Analyse, Conclusion) avec des questions générées dynamiquement par l'IA.

### État actuel
- ✅ **Build fonctionnel** (commit `ec00f8f`)
- ✅ **36 fichiers** de code source
- ✅ **133 packages npm** installés sans vulnérabilités
- ✅ **Erreur JSX corrigée** dans `SummaryDashboard.tsx:293`
- ⚠️ **Nécessite clé API Gemini** pour fonctionner

---

## 🎯 PROMPT POUR AI STUDIO

Copiez-collez ce prompt dans Google AI Studio pour obtenir de l'aide sur le projet :

```
Tu es un expert React/TypeScript et Gemini API. J'ai besoin d'aide avec le projet BILAN-EASY, une application de bilan de compétences.

CONTEXTE DU PROJET:
- Architecture: React 19.2 + TypeScript 5.8 + Vite 6.2
- IA: Gemini 2.5 (flash pour questions, pro pour synthèse finale)
- Repo GitHub: https://github.com/lekesiz/BILAN-EASY
- Branche actuelle: claude/debug-google-aistudio-blocker-011CUzGKYm8HkLGrCEFeeGxo

STRUCTURE DES FICHIERS CRITIQUES:

1. services/geminiService.ts
   - Contient toutes les fonctions d'appel API Gemini
   - Utilise des schémas JSON stricts (questionSchema, summarySchema, etc.)
   - 8 fonctions principales: generateQuestion, generateSummary, analyzeThemesAndSkills, etc.
   - Modèles: gemini-2.5-flash (rapide) et gemini-2.5-pro (synthèse finale)

2. components/Questionnaire.tsx (350 lignes)
   - Interface chat principale avec l'IA
   - Gère le flow: questions → réponses → synthèses → modules optionnels
   - Sauvegarde auto toutes les 5 questions dans localStorage
   - Support voix (speech-to-text et text-to-speech)
   - Système de "Joker" pour reformuler une question

3. components/SummaryDashboard.tsx (300 lignes)
   - Affiche la synthèse finale du bilan
   - Export PDF et JSON/CSV des données
   - Visualisations: radar de compétences, nuage de mots
   - Modales pour sources, ressources, coach

4. App.tsx (127 lignes)
   - Routing entre 7 écrans (welcome, package-selection, questionnaire, summary, etc.)
   - Gestion de l'état global (userName, selectedPackage, answers, etc.)

5. constants.ts
   - Définit 3 PACKAGES (Découverte: 3Q, Approfondi: 6Q, Stratégique: 9Q)
   - Définit QUESTION_CATEGORIES (3 phases avec objectifs et catégories)

6. types.ts (114 lignes)
   - Tous les types TypeScript du projet
   - Types clés: Question, Answer, Summary, Package, UserProfile, DashboardData

FONCTIONNALITÉS PRINCIPALES:

1. GÉNÉRATION DE QUESTIONS DYNAMIQUES
   - L'IA génère des questions contextuelles basées sur:
     * La phase actuelle (1/2/3)
     * La catégorie (Motivations, Compétences, etc.)
     * Les réponses précédentes
     * Le profil utilisateur (si CV uploadé)
     * Le style de coaching choisi (collaboratif/analytique/créatif)

2. SYNTHÈSES INTERMÉDIAIRES
   - Toutes les 3 réponses, l'IA résume et demande confirmation
   - Si non confirmé, continue sans ajustement (pas de re-génération)

3. MODULES OPTIONNELS ADAPTATIFS
   - L'IA analyse les réponses et suggère des modules si besoin détecté:
     * "transition-management" (peur du changement)
     * "self-confidence" (syndrome de l'imposteur)
     * "work-life-balance" (burnout, stress)
   - 3 questions supplémentaires par module

4. DASHBOARD TEMPS RÉEL
   - Mis à jour toutes les 5 questions
   - Analyse thématique (nuage de mots avec poids)
   - Évaluation de 5 compétences: Communication, Leadership, Analyse, Adaptabilité, Collaboration

5. SAUVEGARDE ET REPRISE
   - localStorage avec clé: autosave-{userName}-{packageId}
   - Proposition de reprise au chargement
   - Suppression après synthèse finale

6. SYNTHÈSE FINALE (CRITIQUE)
   - Utilise gemini-2.5-pro (plus puissant)
   - Génère:
     * Type de profil professionnel (ex: "Le Spécialiste en Transition")
     * 3-5 thèmes prioritaires
     * Niveau de maturité du projet
     * Forces clés (avec citations justificatives des réponses)
     * Axes de développement (avec citations)
     * 3-4 recommandations
     * Plan d'action court terme (1-3 mois) et moyen terme (3-6 mois)

PROBLÈMES RÉSOLUS RÉCEMMENT:

1. Erreur JSX dans SummaryDashboard.tsx:293
   - AVANT: {isHistoryView ? 'Retour à l'historique' : 'Voir mon historique'}
   - APRÈS: {isHistoryView ? "Retour à l'historique" : "Voir mon historique"}
   - CAUSE: Apostrophe dans "l'historique" ferme prématurément la chaîne
   - SOLUTION: Utiliser des guillemets doubles pour les chaînes avec apostrophes

2. Code source non extrait
   - Extrait depuis bilan-de-compétences-ia.zip
   - 36 fichiers décompressés et committés

3. Dépendances manquantes
   - npm install réussi (133 packages)
   - Aucune vulnérabilité

CONFIGURATION REQUISE:

1. Clé API Gemini (OBLIGATOIRE)
   - Fichier: .env.local
   - Variable: GEMINI_API_KEY=votre_clé_ici
   - Obtenir sur: https://aistudio.google.com/app/apikey
   - Vite expose via: process.env.API_KEY (voir vite.config.ts:14)

2. Node.js v18+
   - npm ou yarn

WORKFLOW DE DÉVELOPPEMENT:

1. Cloner le repo
2. npm install
3. Configurer .env.local avec clé API
4. npm run dev (démarre sur http://localhost:3000)
5. npm run build (génère dist/)

BONNES PRATIQUES:

1. TOUJOURS utiliser des schémas JSON pour les réponses Gemini
2. TOUJOURS typer strictement (TypeScript strict mode activé)
3. TOUJOURS utiliser des guillemets doubles pour les chaînes avec apostrophes en JSX
4. ÉVITER de modifier les types dans types.ts sans mettre à jour tous les usages
5. TESTER le build avant de commit (npm run build)

SCHEMAS JSON GEMINI:
Tous les schémas sont définis dans geminiService.ts (lignes 9-129):
- questionSchema: Structure d'une question
- synthesisSchema: Synthèse intermédiaire
- summarySchema: Synthèse finale (complexe)
- userProfileSchema: Analyse de CV
- dashboardDataSchema: Données du dashboard
- resourceLeadsSchema: Pistes de ressources
- optionalModuleSchema: Suggestion de module

EXEMPLE D'APPEL GEMINI:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: {
    systemInstruction: getSystemInstruction(coachingStyle),
    responseMimeType: "application/json",
    responseSchema: questionSchema,
    tools: [{ googleSearch: {} }] // Optionnel
  }
});
```

POINTS D'ATTENTION:

1. Gestion des erreurs
   - Toutes les fonctions async ont des try/catch
   - En cas d'erreur de génération de question, retry après 3s
   - Logging avec console.error

2. Performance
   - gemini-2.5-flash pour rapidité (questions, synthèses)
   - gemini-2.5-pro uniquement pour synthèse finale (plus lent mais meilleur)
   - Dashboard recalculé toutes les 5Q (pas à chaque réponse)

3. UX
   - Messages de chargement ("...") pendant génération IA
   - Notifications (badges débloqués, sauvegarde auto)
   - Modales pour confirmations (synthèses, modules optionnels)
   - Boutons désactivés pendant loading

4. Accessibilité
   - Support voix (Web Speech API)
   - Paramètres vocaux (vitesse, pitch, volume, voix)
   - Keyboard navigation (Enter pour envoyer)

DÉPENDANCES CRITIQUES:
- @google/genai@1.29.0: SDK officiel Gemini
- react@19.2.0: Framework UI
- react-dom@19.2.0: Rendu React
- typescript@5.8.2: Typage statique
- vite@6.2.0: Build tool
- @vitejs/plugin-react@5.0.0: Plugin React pour Vite
- @types/node@22.14.0: Types Node.js

FICHIERS DE CONFIG:
- vite.config.ts: Définit env variables et alias
- tsconfig.json: Strict mode, ESNext target
- package.json: Scripts et dépendances
- .env.local: Clé API (PAS dans Git)
- .gitignore: Ignore node_modules, dist, .env.local

TESTING:
- Pas de tests unitaires actuellement
- Testing manuel via npm run dev
- Vérifier build avec npm run build

---

MA DEMANDE:
[Décrivez ici votre besoin spécifique]

Exemples de demandes:
- "Comment ajouter une 4ème phase au questionnaire ?"
- "Je veux changer le modèle Gemini utilisé pour les questions"
- "L'export PDF ne fonctionne pas, comment débugger ?"
- "Comment ajouter un nouveau type de question (ex: échelle de 1 à 10) ?"
- "Je veux personnaliser les prompts envoyés à Gemini"
- "Comment ajouter une nouvelle visualisation dans le dashboard ?"
- "L'application ne démarre pas, que faire ?"
```

---

## 🔍 SCÉNARIOS D'UTILISATION DU PROMPT

### Scénario 1: Débugger une erreur

```
[Collez le prompt ci-dessus, puis ajoutez:]

MA DEMANDE:
J'ai une erreur quand je lance npm run dev:
[Collez l'erreur ici]

Aide-moi à comprendre et résoudre ce problème.
```

### Scénario 2: Ajouter une fonctionnalité

```
[Collez le prompt ci-dessus, puis ajoutez:]

MA DEMANDE:
Je veux ajouter une fonctionnalité pour exporter les résultats en format Word (.docx).

Quels fichiers dois-je modifier ? Quelle librairie npm utiliser ? Montre-moi le code.
```

### Scénario 3: Comprendre le code

```
[Collez le prompt ci-dessus, puis ajoutez:]

MA DEMANDE:
Je ne comprends pas comment fonctionne le système de modules optionnels.

Explique-moi le flow complet depuis la détection du besoin jusqu'à l'ajout des 3 questions supplémentaires.
Quels fichiers sont impliqués ?
```

### Scénario 4: Optimiser les performances

```
[Collez le prompt ci-dessus, puis ajoutez:]

MA DEMANDE:
L'application est lente quand j'ai beaucoup de réponses (>20).

Identifie les goulots d'étranglement et propose des optimisations avec du code.
```

### Scénario 5: Modifier les prompts Gemini

```
[Collez le prompt ci-dessus, puis ajoutez:]

MA DEMANDE:
Je veux que les questions de l'IA soient plus courtes et plus directes.

Montre-moi où modifier les prompts dans geminiService.ts et donne-moi des exemples.
```

---

## 📚 RESSOURCES ADDITIONNELLES

### Documentation officielle
- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **React 19**: https://react.dev/blog/2024/12/05/react-19
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev/guide/

### Tutoriels pertinents
- **Gemini avec React**: https://ai.google.dev/gemini-api/docs/get-started/tutorial?lang=web
- **Structured outputs**: https://ai.google.dev/gemini-api/docs/structured-output
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

### Exemples de code

#### Ajouter une nouvelle fonction Gemini

```typescript
// Dans services/geminiService.ts

// 1. Définir le schéma
const monNouveauSchema = {
  type: Type.OBJECT,
  properties: {
    resultat: { type: Type.STRING },
    score: { type: Type.NUMBER }
  },
  required: ["resultat", "score"]
};

// 2. Créer la fonction
export const maNouvelleAnalyse = async (data: string): Promise<{resultat: string, score: number}> => {
  const prompt = `Analyse cette donnée: ${data}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: monNouveauSchema
    }
  });
  return parseJsonResponse(response.text, 'maNouvelleAnalyse');
};

// 3. Utiliser dans un composant
import { maNouvelleAnalyse } from '../services/geminiService';

const resultat = await maNouvelleAnalyse(mesData);
console.log(resultat.score);
```

#### Ajouter un nouveau type de question

```typescript
// 1. Dans types.ts, ajouter au enum
export enum QuestionType {
  PARAGRAPH = 'PARAGRAPH',
  MULTIPLE_CHOICE = 'multiple_choice',
  SCALE = 'scale' // NOUVEAU
}

// 2. Mettre à jour l'interface Question
export interface Question {
  // ... propriétés existantes
  scaleMin?: number;
  scaleMax?: number;
}

// 3. Dans geminiService.ts, mettre à jour le schéma
const questionSchema = {
  // ...
  properties: {
    // ... propriétés existantes
    type: { type: Type.STRING, enum: ['PARAGRAPH', 'MULTIPLE_CHOICE', 'SCALE'] },
    scaleMin: { type: Type.NUMBER },
    scaleMax: { type: Type.NUMBER }
  }
};

// 4. Dans Questionnaire.tsx, ajouter le rendu
{msg.question?.type === QuestionType.SCALE && (
  <div className="mt-4 flex justify-between">
    {Array.from({length: msg.question.scaleMax! - msg.question.scaleMin! + 1}, (_, i) => (
      <button
        key={i}
        onClick={() => handleAnswerSubmit(String(i + msg.question.scaleMin!))}
        className="px-4 py-2 bg-primary-100 rounded hover:bg-primary-200"
      >
        {i + msg.question.scaleMin!}
      </button>
    ))}
  </div>
)}
```

---

## 🚨 ERREURS COURANTES ET SOLUTIONS

### Erreur 1: "Cannot find module '@google/genai'"
**Solution**: `npm install`

### Erreur 2: "API_KEY is undefined"
**Solution**: Configurer `.env.local` avec `GEMINI_API_KEY=votre_clé`

### Erreur 3: "Transform failed with 1 error" (JSX)
**Solution**: Vérifier les apostrophes dans les chaînes JSX, utiliser des guillemets doubles

### Erreur 4: "localStorage is not defined"
**Solution**: Vérifier que le code s'exécute côté client (useEffect) et pas côté serveur

### Erreur 5: "Speech recognition not supported"
**Solution**: Utiliser Chrome/Edge, activer HTTPS en production, vérifier permissions micro

### Erreur 6: Gemini retourne un JSON invalide
**Solution**:
1. Vérifier que le schéma est correctement défini
2. Ajouter des logs: `console.log(response.text)`
3. Utiliser `parseJsonResponse` qui gère les erreurs

---

## 🎓 CONCEPTS CLÉS À COMPRENDRE

### 1. Flow de questions
```
[Accueil]
  ↓ (nom)
[Sélection Package]
  ↓ (Découverte/Approfondi/Stratégique)
[Phase Préliminaire]
  ↓ (style coaching + CV optionnel)
[Questionnaire] ← CŒUR DE L'APP
  ↓ (X questions selon package)
  → Toutes les 3Q: Synthèse + confirmation
  → Toutes les 5Q: Sauvegarde auto + mise à jour dashboard
  → Fin de phase: Badge + module optionnel possible + satisfaction
[Synthèse finale]
  ↓ (export PDF/JSON/CSV)
[Historique]
```

### 2. Génération de questions par Gemini

Chaque question est générée en fonction de:
- **Phase** (1: Investigation, 2: Analyse, 3: Conclusion)
- **Catégorie** (rotation dans les catégories de la phase)
- **Historique** (réponses précédentes pour contextualiser)
- **Style** (system instruction différent selon collaboratif/analytique/créatif)
- **Profil** (si CV uploadé, personnalise la 1ère question)
- **Options spéciales**:
  - `useJoker`: Reformule la question précédente
  - `useGoogleSearch`: Enrichit avec recherche Google (phase 2, question 2)
  - `isModuleQuestion`: Question d'un module optionnel

### 3. Schémas JSON structurés

Gemini 2.5 supporte les "structured outputs" :
```typescript
// On définit un schéma JSON
const schema = { type: Type.OBJECT, properties: {...} };

// On force Gemini à répondre dans ce format
config: {
  responseMimeType: "application/json",
  responseSchema: schema
}

// Gemini retourne TOUJOURS un JSON valide conforme au schéma
```

### 4. Sauvegarde localStorage

```typescript
// Clé unique par utilisateur et package
const SESSION_STORAGE_KEY = `autosave-${userName}-${pkg.id}`;

// Sauvegarde toutes les 5 questions
if (currentAnswers.length % 5 === 0) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentAnswers));
}

// Au chargement, proposition de reprise
const savedAnswersJSON = localStorage.getItem(SESSION_STORAGE_KEY);
if (savedAnswersJSON && window.confirm("Reprendre ?")) {
  const savedAnswers = JSON.parse(savedAnswersJSON);
  // ... reprendre
}

// Suppression après synthèse finale
localStorage.removeItem(SESSION_STORAGE_KEY);
```

---

## 📞 SUPPORT

Si le prompt AI Studio ne suffit pas:
1. Vérifier ce guide (AISTUDIO_GUIDE.md)
2. Lire le README.md complet
3. Examiner le code des fichiers critiques (geminiService.ts, Questionnaire.tsx)
4. Créer une issue GitHub: https://github.com/lekesiz/BILAN-EASY/issues

---

## ✅ CHECKLIST AVANT DE COMMENCER

- [ ] J'ai cloné le repo
- [ ] J'ai fait `npm install`
- [ ] J'ai configuré `.env.local` avec ma clé API Gemini
- [ ] J'ai testé `npm run dev` et l'app démarre
- [ ] J'ai lu ce guide (AISTUDIO_GUIDE.md)
- [ ] J'ai lu le README.md
- [ ] J'ai identifié le fichier à modifier pour ma tâche
- [ ] Je peux maintenant utiliser le prompt AI Studio ci-dessus

---

<div align="center">

**Guide créé pour faciliter le développement avec Google AI Studio**

**Bonne chance! 🚀**

</div>
