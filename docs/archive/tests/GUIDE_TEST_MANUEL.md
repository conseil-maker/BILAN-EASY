# Guide de Test Manuel - Bilan-Easy

## Date : 16 décembre 2025
## URL : https://bilan-easy.vercel.app

---

## Test 1 : Téléchargement PDF avec informations NETZ INFORMATIQUE

### Étapes

1. **Accéder à l'application**
   - Ouvrir https://bilan-easy.vercel.app
   - Se connecter si nécessaire

2. **Aller sur Mes Documents**
   - Cliquer sur "Mes documents" dans les accès rapides
   - Ou naviguer vers `#/mes-documents`

3. **Télécharger la Convention de prestation**
   - Cliquer sur "Télécharger PDF" pour la Convention
   - Ouvrir le fichier PDF téléchargé

4. **Vérifier les informations**
   - ✅ Nom de l'organisme : **NETZ INFORMATIQUE**
   - ✅ Consultant : **Mikail LEKESIZ**
   - ✅ Email : **contact@netzinformatique.fr**
   - ✅ Adresse : **1A, route de Schweighouse - 67500 HAGUENAU**
   - ✅ SIRET : **818 347 346 00020**
   - ✅ N° Qualiopi : **FP 2022/0076-4**

5. **Télécharger le Livret d'accueil**
   - Cliquer sur "Télécharger PDF" pour le Livret
   - Vérifier les mêmes informations

### Résultat attendu

Les PDF doivent afficher les informations officielles de NETZ INFORMATIQUE, pas "Bilan-Easy" ou des données fictives.

---

## Test 2 : Sauvegarde du bilan dans Supabase

### Étapes

1. **Démarrer un nouveau bilan**
   - Aller sur https://bilan-easy.vercel.app
   - Entrer un prénom (ex: "TestSauvegarde")
   - Cliquer sur "Commencer mon bilan"

2. **Choisir un forfait**
   - Sélectionner "Forfait Test" (2 heures)

3. **Compléter la phase préliminaire**
   - Cocher toutes les cases de consentement
   - Valider chaque étape

4. **Répondre au questionnaire IA**
   - Répondre à quelques questions
   - Attendre la synthèse

5. **Vérifier dans Supabase**
   - Aller sur https://supabase.com/dashboard
   - Ouvrir le projet "Bilan de Competences IA"
   - Aller dans "Table Editor" > "assessments"
   - Vérifier qu'une nouvelle ligne a été créée avec :
     - `user_id` : votre ID utilisateur
     - `package_name` : "Forfait Test"
     - `status` : "completed"
     - `answers` : tableau des réponses
     - `summary` : objet de synthèse

### Résultat attendu

Une nouvelle entrée doit apparaître dans la table `assessments` avec toutes les données du bilan.

---

## Test 3 : Persistance des données

### Étapes

1. **Compléter un bilan** (comme ci-dessus)

2. **Se déconnecter**
   - Cliquer sur le menu utilisateur (avatar en haut à droite)
   - Cliquer sur "Se déconnecter"

3. **Se reconnecter**
   - Se reconnecter avec le même compte

4. **Vérifier l'historique**
   - Aller sur le tableau de bord
   - Vérifier que le bilan précédent apparaît dans l'historique

### Résultat attendu

L'historique des bilans doit être persistant grâce à la sauvegarde Supabase.

---

## Checklist de validation

| Test | Critère | Validé |
|------|---------|--------|
| PDF Convention | Affiche "NETZ INFORMATIQUE" | ☐ |
| PDF Convention | Affiche "Mikail LEKESIZ" | ☐ |
| PDF Convention | Affiche l'adresse correcte | ☐ |
| PDF Convention | Affiche le SIRET correct | ☐ |
| PDF Livret | Affiche les bonnes informations | ☐ |
| Sauvegarde | Bilan enregistré dans Supabase | ☐ |
| Persistance | Historique accessible après reconnexion | ☐ |

---

## En cas de problème

Si les tests échouent :

1. **Vérifier le déploiement Vercel**
   - Le dernier commit doit être `bafbbfd`

2. **Vider le cache du navigateur**
   - Ctrl+Shift+R pour forcer le rechargement

3. **Vérifier la console développeur**
   - F12 > Console
   - Chercher les erreurs éventuelles

4. **Contacter le support**
   - contact@netzinformatique.fr

---

*Guide généré le 16 décembre 2025*
*NETZ INFORMATIQUE - Organisme certifié Qualiopi*
