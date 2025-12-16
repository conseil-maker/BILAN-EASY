# Bilan-Easy - Conformité Qualiopi

## Rapport de conformité au référentiel national qualité

**Date de mise à jour :** 16 décembre 2025  
**Version :** 2.0  
**URL de production :** https://bilan-easy.vercel.app

---

## 1. Documents obligatoires ✅

### 1.1 Convention de prestation (PDF)
- **Statut :** Implémenté
- **Fichier :** `src/services/qualiopiDocuments.ts`
- **Contenu :**
  - Article 1 : Objet de la convention
  - Article 2 : Durée et organisation
  - Article 3 : Modalités de réalisation
  - Article 4 : Tarif et conditions de paiement
  - Article 5 : Confidentialité (art. L.6313-10-1)
  - Article 6 : Propriété des résultats
  - Article 7 : Droit de rétractation
  - Article 8 : Litiges
- **Conformité :** Articles L.6313-1 et R.6313-4 du Code du travail

### 1.2 Attestation de présence (PDF)
- **Statut :** Implémenté
- **Fichier :** `src/services/qualiopiDocuments.ts`
- **Contenu :** Certification de participation avec durée effective

### 1.3 Livret d'accueil (PDF)
- **Statut :** Implémenté
- **Fichier :** `src/services/qualiopiDocuments.ts`
- **Contenu :**
  - Présentation de l'organisme
  - Objectifs du bilan
  - Déroulement des 3 phases
  - Méthodologie
  - Engagements qualité
  - Droits du bénéficiaire

### 1.4 Document de synthèse (PDF)
- **Statut :** Implémenté
- **Fichier :** `src/services/syntheseService.ts`
- **Sections :**
  1. Circonstances du bilan
  2. Compétences identifiées
  3. Aptitudes et motivations
  4. Axes de développement
  5. Projet professionnel
  6. Formations recommandées
  7. Plan d'action
  8. Conclusion
- **Conformité :** Article R.6313-7 du Code du travail

---

## 2. Phase préliminaire structurée ✅

### 2.1 Parcours en 4 étapes
- **Fichier :** `src/components/PhasePreliminaireQualiopi.tsx`
- **Étapes :**
  1. **Objectifs** - Présentation conforme art. L.6313-4
  2. **Déroulement** - 3 phases détaillées + style coaching
  3. **Consentement éclairé** - 6 cases obligatoires
  4. **Récapitulatif** - Validation avec date de signature

### 2.2 Consentements collectés
- ✅ Consentement éclairé
- ✅ Participation volontaire
- ✅ Confidentialité comprise (art. L.6313-10-1)
- ✅ Traitement des données RGPD
- ✅ Objectifs compris
- ✅ Méthodologie acceptée

---

## 3. Pages légales ✅

### 3.1 CGU (Conditions Générales d'Utilisation)
- **Route :** `#/legal/cgu`
- **Fichier :** `src/components/legal/CGU.tsx`
- **Sections :** 13 articles complets

### 3.2 CGV (Conditions Générales de Vente)
- **Route :** `#/legal/cgv`
- **Fichier :** `src/components/legal/CGV.tsx`
- **Contenu :**
  - Tarifs des 3 forfaits
  - Financement CPF/OPCO
  - Conditions de paiement
  - Droit de rétractation

### 3.3 Politique de confidentialité (RGPD)
- **Route :** `#/legal/privacy`
- **Fichier :** `src/components/legal/Privacy.tsx`
- **Conformité :** RGPD + Loi Informatique et Libertés

### 3.4 Politique de cookies
- **Route :** `#/legal/cookies`
- **Fichier :** `src/components/legal/Cookies.tsx`
- **Bandeau :** `src/components/CookieConsent.tsx`
- **Conformité :** Directive ePrivacy

---

## 4. Base de données métiers et formations ✅

### 4.1 Répertoire ROME
- **Fichier :** `src/data/romeMetiers.ts`
- **Contenu :**
  - 34 métiers avec codes ROME
  - 14 domaines professionnels
  - Compétences clés par métier
  - Formations recommandées
  - Salaires moyens
  - Perspectives d'emploi
- **Source :** France Travail (ex-Pôle Emploi)

### 4.2 Formations CPF
- **Fichier :** `src/data/formations.ts`
- **Contenu :**
  - 19 formations certifiantes
  - Niveaux 3 à 8 (CAP à Doctorat)
  - Durées et tarifs
  - Modalités (présentiel/distanciel/hybride)
  - Organismes de formation
  - Débouchés professionnels
- **Éligibilité :** CPF (Compte Personnel de Formation)

### 4.3 Explorateur interactif
- **Route :** `#/metiers`
- **Fichier :** `src/components/MetiersFormationsExplorer.tsx`
- **Fonctionnalités :**
  - Recherche par mot-clé
  - Filtres par domaine et niveau
  - Suggestions personnalisées
  - Liens vers France Travail et Mon Compte Formation

---

## 5. Questionnaire de satisfaction ✅

### 5.1 Structure
- **Fichier :** `src/components/SatisfactionSurvey.tsx`
- **Route :** `#/satisfaction`
- **Questions :** 18 questions réparties en 6 catégories

### 5.2 Catégories évaluées
1. **Accueil et information** (3 questions)
2. **Déroulement du bilan** (3 questions)
3. **Accompagnement** (3 questions)
4. **Résultats** (3 questions)
5. **Plateforme** (3 questions)
6. **Satisfaction globale** (3 questions + commentaires)

### 5.3 Échelle de notation
- Échelle de 1 à 5 étoiles
- Calcul automatique du NPS (Net Promoter Score)
- Stockage en base de données Supabase

---

## 6. Améliorations UX ✅

### 6.1 Fil d'Ariane
- **Fichier :** `src/components/Breadcrumb.tsx`
- **Variantes :**
  - Standard multi-étapes
  - Compact pour mobile
  - Spécifique bilan (3 phases)

### 6.2 Indicateurs de progression
- **Fichier :** `src/components/ProgressIndicators.tsx`
- **Composants :**
  - Dashboard de progression
  - Indicateur circulaire
  - Barre de progression par étapes
  - Temps restant
  - Badge de complétion

### 6.3 Graphiques de compétences
- **Fichier :** `src/components/CompetenceCharts.tsx`
- **Visualisations :**
  - Graphique radar
  - Barres horizontales
  - Carte score compétences
  - Comparaison avant/après

---

## 7. Bibliothèque de documents ✅

### 7.1 Interface centralisée
- **Route :** `#/library`
- **Fichier :** `src/components/DocumentLibrary.tsx`
- **Fonctionnalités :**
  - Liste de tous les documents
  - Filtres par catégorie
  - Historique des téléchargements
  - Statuts (disponible/en cours/verrouillé)

### 7.2 Catégories de documents
- Documents obligatoires (Convention, Livret, Attestation)
- Documents de synthèse
- Ressources (Guide métiers)

---

## 8. Routes disponibles

| Route | Description | Authentification |
|-------|-------------|------------------|
| `#/` | Page d'accueil | Non |
| `#/legal/cgu` | CGU | Non |
| `#/legal/cgv` | CGV | Non |
| `#/legal/privacy` | Politique de confidentialité | Non |
| `#/legal/cookies` | Politique de cookies | Non |
| `#/documents` | Générateur de documents | Oui |
| `#/library` | Bibliothèque de documents | Oui |
| `#/metiers` | Explorateur métiers/formations | Oui |
| `#/satisfaction` | Questionnaire de satisfaction | Oui |

---

## 9. Commits de conformité

| Commit | Description |
|--------|-------------|
| `d71d927` | Documents obligatoires, pages légales, RGPD |
| `bbb6c69` | Phase préliminaire structurée |
| `0920dcb` | Base métiers ROME et formations CPF |
| `fbb02a3` | Document de synthèse professionnel |
| `3acb6be` | Améliorations UX (fil d'Ariane, graphiques) |

---

## 10. Checklist Qualiopi

### Indicateur 1 - Information du public ✅
- [x] CGU accessibles
- [x] CGV avec tarifs
- [x] Politique de confidentialité
- [x] Informations sur les 3 phases

### Indicateur 2 - Objectifs et prérequis ✅
- [x] Présentation des objectifs (art. L.6313-4)
- [x] Phase préliminaire structurée
- [x] Consentement éclairé

### Indicateur 3 - Adaptation aux bénéficiaires ✅
- [x] 3 styles de coaching
- [x] Questions adaptatives (IA)
- [x] Personnalisation du parcours

### Indicateur 4 - Moyens pédagogiques ✅
- [x] Questionnaires interactifs
- [x] Base de données métiers
- [x] Ressources formations

### Indicateur 5 - Qualification des intervenants ✅
- [x] Mention consultant certifié
- [x] Coordonnées dans les documents

### Indicateur 6 - Environnement de formation ✅
- [x] Plateforme accessible 24/7
- [x] Interface responsive
- [x] Mode sombre

### Indicateur 7 - Recueil des appréciations ✅
- [x] Questionnaire de satisfaction (18 questions)
- [x] Calcul NPS
- [x] Stockage des résultats

---

**Certification Qualiopi :** Conforme au référentiel national qualité  
**Dernière vérification :** 16 décembre 2025
