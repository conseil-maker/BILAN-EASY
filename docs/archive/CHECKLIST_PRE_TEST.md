# Checklist Pré-Test - Bilan-Easy

## 1. Infrastructure

| Élément | Statut | Notes |
|---------|--------|-------|
| Déploiement Vercel | ✅ OK | https://bilan-easy.vercel.app/ |
| Base de données Supabase | ✅ OK | Projet: pkhhxouuavfqzccahihe |
| API Gemini | ✅ OK | Clé configurée dans Vercel |
| Tables Supabase | ✅ OK | assessments, profiles, user_sessions, etc. |

## 2. Fonctionnalités Critiques

| Fonctionnalité | Statut | À Tester |
|----------------|--------|----------|
| Création de compte | ✅ | Inscription + confirmation email |
| Connexion | ✅ | Login avec email/mot de passe |
| Sélection de forfait | ✅ | 4 forfaits disponibles |
| Phase préliminaire | ✅ | Objectifs, déroulement, consentement |
| Questionnaire IA | ✅ | Génération de questions par Gemini |
| Dashboard latéral | ✅ | Progression, thèmes, compétences |
| Synthèse finale | ✅ | Génération automatique |
| Historique | ✅ | Sauvegarde dans Supabase |
| Documents PDF | ✅ | Téléchargement des documents |

## 3. Comptes de Test Disponibles

| Type | Email | Mot de passe |
|------|-------|--------------|
| Admin existant | testfinal@bilancompetences.com | (à définir) |
| Admin existant | test.admin.bilan@gmail.com | (à définir) |
| Consultant existant | test.nouveau@gmail.com | (à définir) |
| Client (créer nouveau) | À créer lors du test | TestBilan2024! |

## 4. Forfaits Disponibles

| Forfait | Durée | Questions | Recommandé pour |
|---------|-------|-----------|-----------------|
| Test | 2h | 10-15 | Tests rapides |
| Essentiel | 12h | 30-40 | Tests complets |
| Approfondi | 18h | 45-60 | Tests avancés |
| Stratégique | 24h | 60+ | Tests exhaustifs |

## 5. Points d'Attention

### Avant le Test
- [ ] S'assurer que l'utilisateur a une connexion internet stable
- [ ] Vérifier que l'email de confirmation arrive bien (vérifier les spams)
- [ ] Recommander l'utilisation de Chrome ou Firefox

### Pendant le Test
- [ ] Observer les temps de réponse de l'IA (< 10 secondes idéalement)
- [ ] Noter tout message d'erreur affiché
- [ ] Vérifier que les toasts s'affichent correctement

### Après le Test
- [ ] Vérifier que le bilan est bien enregistré dans Supabase
- [ ] Vérifier que les documents sont téléchargeables
- [ ] Collecter les retours utilisateur

## 6. Contacts Support

- **Email technique** : contact@netzinformatique.fr
- **Téléphone** : 03 67 31 02 01

## 7. URLs Importantes

| Page | URL |
|------|-----|
| Application | https://bilan-easy.vercel.app/ |
| Dashboard Admin | https://bilan-easy.vercel.app/#/admin |
| Dashboard Consultant | https://bilan-easy.vercel.app/#/consultant |
| Documents | https://bilan-easy.vercel.app/#/mes-documents |
| Métiers | https://bilan-easy.vercel.app/#/metiers |
| Satisfaction | https://bilan-easy.vercel.app/#/satisfaction |
| CGU | https://bilan-easy.vercel.app/#/legal/cgu |
| CGV | https://bilan-easy.vercel.app/#/legal/cgv |
| Confidentialité | https://bilan-easy.vercel.app/#/legal/privacy |
