# Guide de Test - Sauvegarde Automatique du Brouillon

## Fonctionnalité Testée

La fonctionnalité de **sauvegarde automatique du brouillon avant déconnexion** permet de préserver les réponses en cours d'un utilisateur lorsqu'il se déconnecte pendant le questionnaire.

---

## Code Implémenté

**Fichier :** `src/components/Questionnaire.tsx` (lignes 495-518)

```typescript
const confirmLogout = async () => {
    // Sauvegarder les réponses en cours avant déconnexion
    if (answers.length > 0) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await saveAssessmentToHistory({
                    id: `draft_${Date.now()}`,
                    date: new Date().toISOString(),
                    userName: userName,
                    packageName: pkg.name,
                    status: 'in_progress',
                    answers: answers,
                    summary: null,
                }, user.id);
                console.log('Brouillon sauvegardé avant déconnexion');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du brouillon:', error);
        }
    }
    await supabase.auth.signOut();
    window.location.href = '/login';
};
```

---

## Étapes de Test Manuel

### Prérequis
- Accès à https://bilan-easy.vercel.app
- Compte utilisateur connecté
- Console développeur ouverte (F12)

### Test 1 : Sauvegarde lors de la déconnexion

1. **Démarrer un bilan**
   - Accédez à l'application
   - Entrez votre prénom et cliquez sur "Commencer mon bilan"
   - Sélectionnez un forfait (ex: Forfait Test)
   - Complétez la phase préliminaire

2. **Répondre à des questions**
   - Dans le questionnaire IA, répondez à au moins 2-3 questions
   - Notez le nombre de réponses données

3. **Se déconnecter**
   - Cliquez sur le menu utilisateur (avatar en haut à droite)
   - Cliquez sur "Se déconnecter"
   - Confirmez la déconnexion

4. **Vérifier la console**
   - Dans la console développeur, vous devriez voir :
     ```
     Brouillon sauvegardé avant déconnexion
     Assessment saved to Supabase successfully
     ```

### Test 2 : Vérification dans Supabase

1. **Accéder à Supabase**
   - Connectez-vous à votre dashboard Supabase
   - Allez dans "Table Editor" > "assessments"

2. **Vérifier l'entrée**
   - Recherchez une entrée avec `id` commençant par `draft_`
   - Vérifiez que `status` = `in_progress`
   - Vérifiez que `answers` contient les réponses données

### Test 3 : Vérification dans localStorage

1. **Ouvrir les DevTools**
   - F12 > Application > Local Storage

2. **Vérifier la clé**
   - Cherchez `skillsAssessmentHistory`
   - Vérifiez que le brouillon est présent

---

## Critères de Validation

| Critère | Attendu | Validé |
|---------|---------|--------|
| Message console "Brouillon sauvegardé" | ✅ Affiché | ☐ |
| Entrée dans Supabase avec `draft_` | ✅ Créée | ☐ |
| Status `in_progress` | ✅ Correct | ☐ |
| Réponses sauvegardées | ✅ Présentes | ☐ |
| Backup localStorage | ✅ Présent | ☐ |

---

## Comportement Attendu

### Cas 1 : Utilisateur avec réponses en cours
- Les réponses sont sauvegardées dans Supabase
- Un backup est créé dans localStorage
- L'utilisateur est déconnecté

### Cas 2 : Utilisateur sans réponses
- Aucune sauvegarde n'est effectuée
- L'utilisateur est déconnecté directement

### Cas 3 : Erreur de sauvegarde
- L'erreur est loguée dans la console
- L'utilisateur est quand même déconnecté
- Le backup localStorage est tenté

---

## Améliorations Futures

1. **Notification utilisateur** - Afficher un toast "Brouillon sauvegardé"
2. **Reprise du brouillon** - Proposer de reprendre le bilan à la reconnexion
3. **Sauvegarde périodique** - Auto-save toutes les 5 minutes

---

*Guide créé le 16 décembre 2025*
*NETZ INFORMATIQUE - Organisme certifié Qualiopi*
