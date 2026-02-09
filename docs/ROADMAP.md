# 🗺️ ROADMAP DE REFACTORING - BILAN-EASY

## État actuel (26 janvier 2026)

### ✅ Améliorations déployées

| Amélioration | Fichier | Statut |
|--------------|---------|--------|
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | ✅ Intégré dans App.tsx |
| errorService | `src/services/errorService.ts` | ✅ Intégré dans sessionService, historyService |
| LegalModal | `src/components/LegalModal.tsx` | ✅ Intégré dans PhasePreliminaireQualiopi |
| Validation cases à cocher | `PhasePreliminaireQualiopi.tsx` | ✅ Corrigé |

### 📁 Fichiers créés (prêts pour intégration future)

| Fichier | Lignes | Description | Priorité d'intégration |
|---------|--------|-------------|------------------------|
| `src/contexts/SessionContext.tsx` | 450+ | Contexte centralisé pour l'état de session | 🔴 Haute |
| `src/components/questionnaire/BadgeNotification.tsx` | ~40 | Notification de badge avec confettis | 🟡 Moyenne |
| `src/components/questionnaire/SatisfactionModal.tsx` | ~100 | Modal de notation après phase | 🟡 Moyenne |
| `src/components/questionnaire/ModuleModal.tsx` | ~50 | Proposition d'approfondissement | 🟡 Moyenne |
| `src/components/questionnaire/ChatMessage.tsx` | ~60 | Affichage message utilisateur/IA | 🟡 Moyenne |
| `src/components/questionnaire/ChatInput.tsx` | ~150 | Zone de saisie avec micro/joker | 🟡 Moyenne |
| `src/components/questionnaire/QuestionnaireHeader.tsx` | ~160 | En-tête avec progression | 🟡 Moyenne |
| `src/components/questionnaire/ThemesPanel.tsx` | ~150 | Panneau thèmes émergents | 🟡 Moyenne |

---

## 🎯 Roadmap d'intégration

### Phase 1 : Intégration SessionContext (2-3 jours)

**Objectif** : Centraliser les 14 `useState` de ClientApp.tsx en un seul contexte

**Étapes** :
1. Wrapper l'application avec `SessionProvider` dans App.tsx
2. Créer un hook `useClientSession` qui utilise le contexte
3. Migrer progressivement les états de ClientApp.tsx vers le contexte
4. Supprimer les `useState` redondants

**Fichiers à modifier** :
- `src/App.tsx` : Ajouter SessionProvider
- `src/components/ClientApp.tsx` : Remplacer useState par useSession
- `src/components/Questionnaire.tsx` : Utiliser useSession pour les réponses

**Risques** :
- Régressions possibles sur la sauvegarde de session
- Problèmes de synchronisation entre contexte et Supabase

### Phase 2 : Décomposition de Questionnaire.tsx (1-2 jours)

**Objectif** : Réduire les 1395 lignes de Questionnaire.tsx en utilisant les sous-composants créés

**Étapes** :
1. Importer les composants depuis `src/components/questionnaire/`
2. Remplacer les composants inline par les imports
3. Adapter les props si nécessaire
4. Tester chaque remplacement individuellement

**Fichiers à modifier** :
- `src/components/Questionnaire.tsx` : Utiliser les sous-composants

### Phase 3 : Migration vers react-router-dom (3-5 jours)

**Objectif** : Remplacer le routeur hash personnalisé par react-router-dom

**Étapes** :
1. Installer react-router-dom
2. Créer les routes dans App.tsx
3. Migrer les composants pour utiliser `useNavigate`, `useParams`
4. Supprimer le routeur hash personnalisé

**Risques** :
- Changement majeur de l'architecture
- Tous les liens internes à modifier
- Tests de régression nécessaires

---

## 📊 Métriques de succès

| Métrique | Avant | Cible |
|----------|-------|-------|
| Lignes dans ClientApp.tsx | 553 | < 200 |
| Lignes dans Questionnaire.tsx | 1395 | < 500 |
| Nombre de useState dans ClientApp | 14 | 0 (via contexte) |
| Temps de chargement initial | ~2s | < 1s |
| Score Lighthouse Performance | 75 | > 90 |

---

## 🔧 Guide d'intégration SessionContext

### Étape 1 : Ajouter le Provider

```tsx
// src/App.tsx
import { SessionProvider } from './contexts/SessionContext';

// Dans le return :
<ErrorBoundary>
  <ToastProvider>
    <SessionProvider>
      {/* ... reste de l'application */}
    </SessionProvider>
  </ToastProvider>
</ErrorBoundary>
```

### Étape 2 : Utiliser le contexte dans ClientApp

```tsx
// src/components/ClientApp.tsx
import { useSession, useSessionActions } from '../contexts/SessionContext';

const ClientApp: React.FC<ClientAppProps> = ({ user }) => {
  const { state, isLoading, error } = useSession();
  const actions = useSessionActions();
  
  // Remplacer les useState par state.xxx
  // Remplacer les setters par actions.xxx
};
```

### Étape 3 : Adapter les handlers

```tsx
// Avant
const handlePackageSelect = (pkg: Package) => {
  setSelectedPackage(pkg);
  setStartDate(new Date().toLocaleDateString('fr-FR'));
  setAppState('preliminary-phase');
};

// Après
const handlePackageSelect = (pkg: Package) => {
  actions.selectPackage(pkg);
  actions.navigateTo('preliminary-phase');
};
```

---

## 📝 Notes importantes

1. **Ne pas tout migrer d'un coup** : Procéder par petits changements testables
2. **Garder les anciens fichiers** : Ne supprimer qu'après validation complète
3. **Tester après chaque changement** : Vérifier la sauvegarde de session
4. **Documenter les changements** : Mettre à jour ce fichier après chaque phase

---

## 📅 Planning estimé

| Phase | Durée estimée | Priorité |
|-------|---------------|----------|
| Phase 1 : SessionContext | 2-3 jours | 🔴 Haute |
| Phase 2 : Décomposition Questionnaire | 1-2 jours | 🟡 Moyenne |
| Phase 3 : react-router-dom | 3-5 jours | 🟢 Basse |

**Total estimé** : 6-10 jours de développement
