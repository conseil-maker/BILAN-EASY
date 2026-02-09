# Audit Complet - Conformité Qualiopi Bilan de Compétences

**Date :** 29 janvier 2026  
**Application :** Bilan Easy (https://bilan-easy.vercel.app)

---

## Sources consultées
- Guide de lecture du référentiel national Qualiopi V.9 (janvier 2024)
- Articles R.6313-4 à R.6313-8 du Code du travail (Legifrance)
- Ministère du Travail - travail-emploi.gouv.fr
- Bonnes pratiques professionnelles (L'Escale, FFPABC)

---

## Les 7 critères Qualiopi (22 indicateurs tronc commun)

### Critère 1 : Information du public
- Indicateur 1 : Diffusion d'informations sur les prestations
- Indicateur 2 : Indicateurs de résultats (taux de satisfaction, etc.)
- Indicateur 3 : Obtention des résultats (certifications, etc.)

### Critère 2 : Identification des objectifs et adaptation
- Indicateur 4 : Analyse du besoin du bénéficiaire
- Indicateur 5 : Objectifs opérationnels et évaluables
- Indicateur 6 : Contenus et modalités de mise en œuvre
- Indicateur 7 : Adéquation contenus/exigences de la certification

### Critère 3 : Adaptation aux publics
- Indicateur 8 : Procédures de positionnement et d'évaluation
- Indicateur 9 : Conditions de déroulement
- Indicateur 10 : Adaptation de la prestation
- Indicateur 11 : Atteinte des objectifs (évaluation)
- Indicateur 12 : Engagement des bénéficiaires

### Critère 4 : Moyens pédagogiques et techniques
- Indicateur 13 : Coordination des intervenants
- Indicateur 14 : Ressources pédagogiques
- Indicateur 15 : Qualification des intervenants
- Indicateur 16 : Compétences des intervenants

### Critère 5 : Qualification du personnel
- Indicateur 17 : Veille légale et réglementaire
- Indicateur 18 : Veille sur les compétences métiers
- Indicateur 19 : Veille sur les innovations pédagogiques

### Critère 6 : Environnement professionnel
- Indicateur 20 : Actions de développement professionnel
- Indicateur 21 : Réseau de partenaires socio-économiques

### Critère 7 : Appréciations et réclamations
- Indicateur 22 : Recueil des appréciations
- Indicateur 23 : Traitement des réclamations

---

## Exigences spécifiques au Bilan de Compétences (Code du travail)

### Article R.6313-4 - Les 3 phases obligatoires

**Phase 1 : Phase préliminaire** qui a pour objet :
- a) D'analyser la demande et le besoin du bénéficiaire
- b) De déterminer le format le plus adapté à la situation et au besoin
- c) De définir conjointement les modalités de déroulement du bilan

**Phase 2 : Phase d'investigation** permettant au bénéficiaire :
- Soit de **construire son projet professionnel et d'en vérifier la pertinence** ⚠️
- Soit d'élaborer une ou plusieurs alternatives

**Phase 3 : Phase de conclusions** qui, par la voie d'entretiens personnalisés, permet au bénéficiaire :
- a) De s'approprier les résultats détaillés de la phase d'investigation
- b) De recenser les conditions et moyens favorisant la réalisation du ou des projets professionnels
- c) De prévoir les principales modalités et étapes du ou des projets professionnels
- d) **La possibilité de bénéficier d'un entretien de suivi** avec le prestataire ⚠️

### Article R.6313-7 - Document de synthèse
Le document de synthèse doit comporter :
1. Les circonstances du bilan
2. Les compétences et aptitudes du bénéficiaire
3. Le cas échéant, les éléments constitutifs du projet professionnel
4. Le cas échéant, les éléments constitutifs du projet de formation
5. Les principales étapes prévues pour la réalisation du projet

### Autres articles
- **R.6313-5** : Durée maximale 24 heures
- **R.6313-6** : Consentement obligatoire du bénéficiaire
- **R.6313-7** : Confidentialité et destruction des documents (sauf accord 3 ans)
- **R.6313-8** : Convention tripartite obligatoire

---

## Bonnes pratiques professionnelles - Phase d'investigation

Selon les bonnes pratiques du secteur (source: L'Escale, FFPABC), la phase d'investigation doit comprendre :

### 1. Introspection et auto-évaluation
- Identification des savoir-faire et savoir-être
- Test de personnalité (RIASEC, MBTI, etc.)
- Analyse des aspirations et appétences
- Identification des valeurs professionnelles

### 2. Exploration de projets professionnels
- Identification de plusieurs pistes/projets
- Élaboration d'alternatives (pas une seule option)

### 3. Confrontation à la réalité du terrain ⚠️ CRITIQUE
- **Enquêtes métiers** : entretiens avec des professionnels du domaine visé
- **Recherche sectorielle** : données sur le marché de l'emploi
- **Validation de la faisabilité** : le projet est-il réalisable ?
- **Identification des contraintes** : formation nécessaire, délais, etc.

> *« Sans le bilan, ce sont mes peurs qui auraient dicté mes choix. »*
> 
> La confrontation du théorique au réel est incontournable.

### 4. Plan A, B, C
- Explorer plusieurs options pour s'assurer d'en trouver au moins une réalisable
- Identifier des pistes à court, moyen et long terme

---

## Analyse de notre système actuel

### Ce que nous faisons bien ✅

| Exigence | Notre implémentation | Composant/Service |
|----------|---------------------|-------------------|
| Phase préliminaire | Onboarding complet (4 étapes avec consentements) | `PhasePreliminaireQualiopi.tsx` |
| Consentement | Cases à cocher obligatoires (RGPD, méthodologie, confidentialité) | `PhasePreliminaireQualiopi.tsx` |
| Analyse des compétences | Questions IA adaptatives + thèmes émergents | `geminiService.ts`, `Questionnaire.tsx` |
| Analyse des motivations | Questions sur les valeurs et motivations | `geminiService.ts` |
| Analyse des intérêts | Profil RIASEC généré automatiquement | `syntheseService.ts` |
| Exploration de pistes métiers | Module CareerExploration avec 3 pistes | `CareerExploration.tsx` |
| Document de synthèse | PDF 7-15 pages conforme (circonstances, compétences, projet, plan d'action) | `syntheseServiceEnriched.ts` |
| Plan d'action | Section dédiée avec étapes court/moyen/long terme | `syntheseServiceEnriched.ts` |
| Confidentialité | Données appartenant au bénéficiaire | Architecture Supabase |
| Satisfaction | Formulaire après chaque phase + questionnaire final Qualiopi | `SatisfactionSurvey.tsx` |
| Détection hors-cadre | Analyse des réponses inappropriées avec recadrage | `geminiService.ts` |
| Personnalisation | Style de coaching adaptatif (bienveillant, directif, etc.) | `PersonalizationStep.tsx` |

### Ce qui manque ou est insuffisant ❌

| Exigence | Statut | Impact | Indicateur Qualiopi |
|----------|--------|--------|---------------------|
| **Confrontation au marché de l'emploi** | ❌ MANQUANT | CRITIQUE | Art. R.6313-4 |
| **Données marché de l'emploi** | ❌ MANQUANT | CRITIQUE | Validation projet |
| **Enquêtes métiers guidées** | ❌ MANQUANT | HAUTE | Bonnes pratiques |
| **Fiches métiers ROME** | ❌ MANQUANT | HAUTE | Exploration |
| **Analyse de faisabilité** | ⚠️ PARTIEL | HAUTE | Validation projet |
| **Entretien de suivi post-bilan** | ❌ MANQUANT | MOYENNE | Art. R.6313-4 c) |
| **Indicateurs de résultats publics** | ⚠️ PARTIEL | HAUTE | Indicateur 2 |
| **Réseau de partenaires** | ❌ MANQUANT | MOYENNE | Indicateur 21 |
| **Veille métiers/secteurs** | ❌ MANQUANT | MOYENNE | Indicateur 18 |

### Analyse détaillée des manques

#### 1. Confrontation au marché de l'emploi (CRITIQUE)

**Problème :** Le système actuel se concentre quasi exclusivement sur l'introspection. Le bénéficiaire a une vision claire de sa posture, mais pas nécessairement des opportunités concrètes.

**Impact :** Non-conformité avec l'article R.6313-4 qui exige de "vérifier la pertinence" du projet professionnel.

**Solution proposée :**
- Intégration API France Travail (offres d'emploi, tendances)
- Fiches métiers ROME correspondant au profil
- Données sectorielles (salaires, perspectives, formations)

#### 2. Enquêtes métiers (HAUTE)

**Problème :** Pas de guide pour réaliser des entretiens exploratoires avec des professionnels du domaine visé.

**Impact :** Le bénéficiaire ne confronte pas ses idées à la réalité du terrain.

**Solution proposée :**
- Module d'enquêtes métiers avec grille d'entretien
- Suggestions de contacts par secteur
- Suivi des enquêtes réalisées

#### 3. Entretien de suivi post-bilan (MOYENNE)

**Problème :** L'article R.6313-4 prévoit "la possibilité de bénéficier d'un entretien de suivi" mais nous ne le proposons pas.

**Impact :** Non-conformité réglementaire et manque de suivi de la réalisation du projet.

**Solution proposée :**
- Rappel automatique à 3 et 6 mois
- Questionnaire de suivi en ligne
- Possibilité de planifier un entretien

---

## Recommandations d'amélioration

### Priorité CRITIQUE (à implémenter immédiatement)

#### 1. Module d'exploration du marché de l'emploi
- Intégration API France Travail / Pôle Emploi
- Fiches métiers ROME correspondant au profil RIASEC
- Données sur les secteurs porteurs (salaires, perspectives)
- Offres d'emploi correspondantes au projet

**Composants à créer :**
- `MarketExplorationService.ts` - Service d'appel API France Travail
- `JobMarketDashboard.tsx` - Interface de visualisation des données marché
- `ROMEFicheMetier.tsx` - Affichage des fiches métiers

#### 2. Module d'enquêtes métiers
- Guide pour réaliser des entretiens exploratoires
- Modèle de grille d'entretien téléchargeable
- Liste de ressources par secteur (réseaux, associations)
- Suivi des enquêtes réalisées dans l'application

**Composants à créer :**
- `JobInterviewGuide.tsx` - Guide d'enquête métier
- `InterviewTracker.tsx` - Suivi des entretiens réalisés

### Priorité HAUTE

#### 3. Analyse de faisabilité du projet
- Confrontation projet vs marché (offres disponibles)
- Identification des écarts de compétences
- Recommandations de formation pour combler les écarts
- Score de faisabilité dans la synthèse

#### 4. Indicateurs de résultats publics
- Taux de satisfaction global (agrégé)
- Taux de réalisation du projet (suivi 6 mois)
- Statistiques anonymisées sur le site public

### Priorité MOYENNE

#### 5. Suivi post-bilan
- Rappel automatique par email à 3 et 6 mois
- Questionnaire de suivi en ligne
- Mise à jour du plan d'action si nécessaire
- Possibilité de planifier un entretien de suivi

#### 6. Base de ressources partenaires
- Organismes de formation par secteur
- Réseaux professionnels (LinkedIn, associations)
- Structures d'accompagnement (Pôle Emploi, APEC, missions locales)

---

## Prochaines étapes

1. [ ] **Implémenter le module d'exploration du marché** (API France Travail)
2. [ ] **Créer le module d'enquêtes métiers** (guide + suivi)
3. [ ] **Ajouter l'analyse de faisabilité** dans la synthèse
4. [ ] **Mettre en place le suivi post-bilan** (rappels automatiques)
5. [ ] **Créer le tableau de bord des indicateurs** de résultats
6. [ ] **Constituer la base de ressources** partenaires

---

## Conclusion

Notre système actuel couvre **environ 70%** des exigences Qualiopi et des bonnes pratiques professionnelles. Les points forts sont l'introspection guidée par IA, la personnalisation du parcours, et la génération automatique de documents conformes.

**Le manque principal est la confrontation au marché de l'emploi**, qui est une exigence légale (article R.6313-4) et une bonne pratique essentielle pour valider la pertinence du projet professionnel.

L'implémentation du module d'exploration du marché et des enquêtes métiers permettra d'atteindre un niveau de conformité de **90%+** et de répondre aux critiques légitimes des testeurs concernant le manque de confrontation au réel.
