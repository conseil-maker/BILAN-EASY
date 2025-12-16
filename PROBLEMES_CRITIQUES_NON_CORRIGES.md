# 3 Problèmes Critiques Non Corrigés - Bilan-Easy

## Date : 16 décembre 2025
## Analyse basée sur : Audit approfondi du code source

---

## Résumé Exécutif

Après analyse approfondie du code source, j'ai identifié **3 problèmes critiques** qui n'ont pas encore été corrigés et qui impactent directement la fonctionnalité, la sécurité ou la conformité Qualiopi de l'application.

---

## 🔴 Problème 1 : Service d'Emails Non Fonctionnel (CRITIQUE)

### Fichier concerné
`src/services/emailService.ts` (ligne 416)

### Description
Le service d'emails est **entièrement simulé** et n'envoie aucun email réel. La fonction `sendEmail()` affiche simplement un log dans la console et retourne `true` sans rien envoyer.

```typescript
// TODO: Intégrer avec SendGrid, Resend, ou Mailgun
// Simulation de succès
return true;
```

### Impact
- ❌ **Pas de confirmation de rendez-vous** envoyée aux bénéficiaires
- ❌ **Pas de rappel J-1** avant les séances
- ❌ **Pas d'email de bienvenue** avec les documents
- ❌ **Pas de notification de fin de bilan** avec la synthèse
- ❌ **Non-conformité Qualiopi** : Indicateur 7 (accompagnement) et 30 (recueil appréciations)

### Solution recommandée
Intégrer un service d'email réel comme :
- **Resend** (recommandé, simple et moderne)
- **SendGrid** (robuste, gratuit jusqu'à 100 emails/jour)
- **Supabase Edge Functions** avec un provider SMTP

### Priorité : **CRITIQUE** ⚠️

---

## 🔴 Problème 2 : Vulnérabilité XSS dans EmailPreview (SÉCURITÉ)

### Fichier concerné
`src/components/EmailPreview.tsx` (ligne 140)

### Description
Le composant utilise `dangerouslySetInnerHTML` pour afficher le contenu HTML des templates d'email sans sanitization.

```typescript
<div 
  className="bg-white rounded-lg shadow-inner"
  dangerouslySetInnerHTML={{ __html: template.html }}
/>
```

### Impact
- ❌ **Risque d'injection XSS** si le contenu HTML est compromis
- ❌ **Vulnérabilité de sécurité** potentielle
- ⚠️ Actuellement limité car les templates sont générés côté serveur, mais risque si les données utilisateur sont injectées

### Solution recommandée
Utiliser une bibliothèque de sanitization comme **DOMPurify** :

```typescript
import DOMPurify from 'dompurify';

<div 
  className="bg-white rounded-lg shadow-inner"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.html) }}
/>
```

### Priorité : **HAUTE** ⚠️

---

## 🔴 Problème 3 : Déconnexion Sans Sauvegarde des Données en Cours (UX/DONNÉES)

### Fichier concerné
`src/components/Questionnaire.tsx` (ligne 494-497)

### Description
La fonction `confirmLogout()` déconnecte l'utilisateur **sans sauvegarder les réponses en cours** du questionnaire.

```typescript
const confirmLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
};
```

### Impact
- ❌ **Perte de données** : Toutes les réponses non sauvegardées sont perdues
- ❌ **Mauvaise expérience utilisateur** : L'utilisateur peut perdre 30-60 minutes de travail
- ❌ **Pas de confirmation** avant la perte de données

### Solution recommandée
Ajouter une sauvegarde automatique avant la déconnexion :

```typescript
const confirmLogout = async () => {
    // Sauvegarder les réponses en cours
    if (answers.length > 0) {
        await saveAssessmentToHistory({
            id: new Date().toISOString(),
            date: new Date().toISOString(),
            userName: userName,
            packageName: pkg.name,
            status: 'in_progress',
            answers: answers,
            summary: null,
        }, user.id);
    }
    
    await supabase.auth.signOut();
    window.location.href = '/login';
};
```

### Priorité : **HAUTE** ⚠️

---

## Tableau Récapitulatif

| # | Problème | Fichier | Impact | Priorité |
|---|----------|---------|--------|----------|
| 1 | Service d'emails non fonctionnel | `emailService.ts` | Conformité Qualiopi, Communication | **CRITIQUE** |
| 2 | Vulnérabilité XSS | `EmailPreview.tsx` | Sécurité | **HAUTE** |
| 3 | Déconnexion sans sauvegarde | `Questionnaire.tsx` | Perte de données, UX | **HAUTE** |

---

## Autres Problèmes Identifiés (Priorité Moyenne)

### 4. Notifications non persistées
- **Fichier** : `notificationService.ts`
- **Problème** : Les notifications sont stockées uniquement en localStorage
- **Impact** : Pas de synchronisation multi-appareils

### 5. Rappels non automatisés
- **Fichier** : `notificationService.ts` (ligne 244)
- **Problème** : Le TODO pour l'envoi d'emails de rappel n'est pas implémenté
- **Impact** : Pas de rappels automatiques

### 6. Gestion d'erreurs inconsistante
- **Fichiers** : Multiples (91 occurrences de `console.error`)
- **Problème** : Les erreurs sont loguées mais pas toujours remontées à l'utilisateur
- **Impact** : Expérience utilisateur dégradée en cas d'erreur

---

## Recommandations d'Action

### Immédiat (Cette semaine)
1. ✅ Corriger la vulnérabilité XSS avec DOMPurify
2. ✅ Ajouter la sauvegarde avant déconnexion

### Court terme (2 semaines)
3. ✅ Intégrer un service d'email réel (Resend recommandé)
4. ✅ Configurer les templates d'email avec les vraies informations

### Moyen terme (1 mois)
5. ✅ Migrer les notifications vers Supabase
6. ✅ Implémenter les rappels automatiques

---

*Rapport généré le 16 décembre 2025*
*NETZ INFORMATIQUE - Organisme certifié Qualiopi*
