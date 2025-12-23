# 🚀 Guide de Démarrage Rapide - Bilan Easy

## ⚡ Démarrage en 3 Minutes

### 1. Installation

```bash
cd /home/ubuntu/BILAN-EASY
npm install
```

### 2. Configuration

Le fichier `.env` est déjà configuré avec les bonnes clés.

### 3. Lancement

```bash
# Mode développement
npm run dev

# OU Build + Serveur de production
npm run build
npx serve dist -l 5001
```

---

## 🧪 Tester l'Application

### Accès Local

**URL** : http://localhost:5001 (ou le port affiché)

### Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | testfinal@bilancompetences.com | password123 |
| **Consultant** | test.nouveau@gmail.com | password123 |
| **Client** | admin.bilan@gmail.com | password123 |

---

## 🎯 Parcours de Test Recommandé

### 1. Tester en tant que Client

1. Se connecter avec `admin.bilan@gmail.com`
2. Cliquer sur "Commencer"
3. Sélectionner un package (ex: "Complet")
4. Remplir la phase préliminaire
5. Personnaliser le coaching
6. Répondre aux questionnaires
7. Tester le Coach Chat
8. Tester le Coach Live (nécessite un micro)
9. Voir le dashboard de synthèse
10. Exporter en PDF

### 2. Tester en tant que Consultant

1. Se déconnecter
2. Se connecter avec `test.nouveau@gmail.com`
3. Voir la liste des clients assignés
4. Consulter les assessments
5. Ajouter des notes

### 3. Tester en tant qu'Admin

1. Se déconnecter
2. Se connecter avec `testfinal@bilancompetences.com`
3. Voir tous les utilisateurs
4. Créer des assignments
5. Voir les statistiques globales

---

## 📊 Fonctionnalités Clés à Tester

### ✅ Authentification
- [x] Connexion
- [x] Déconnexion
- [x] Inscription (si activée)
- [x] Persistance de session

### ✅ Interface Client
- [x] Sélection de package
- [x] Questionnaires adaptatifs
- [x] Coach Chat (IA textuelle)
- [x] Coach Live (IA vocale)
- [x] Visualisations (radar, graphiques)
- [x] Export PDF/JSON/CSV
- [x] Historique

### ✅ Dashboard Consultant
- [x] Liste des clients
- [x] Vue des assessments
- [x] Notes et commentaires

### ✅ Dashboard Admin
- [x] Gestion utilisateurs
- [x] Assignments
- [x] Statistiques

---

## 🐛 Problèmes Courants

### Le serveur ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur Supabase

Vérifier que les variables d'environnement sont correctes dans `.env`

### Page blanche

1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vider le cache du navigateur (Ctrl+Shift+R)

---

## 📝 Prochaines Étapes

1. ✅ Tester toutes les fonctionnalités localement
2. 🔧 Résoudre le problème de déploiement Vercel (cache CDN)
3. 📚 Lire la documentation complète : `DOCUMENTATION.md`
4. 🚀 Planifier les prochaines fonctionnalités

---

## 🆘 Besoin d'Aide ?

- **Documentation complète** : `DOCUMENTATION.md`
- **Rapports techniques** : 
  - `RAPPORT_INTEGRATION.md`
  - `RAPPORT_FINAL_DEBUG.md`
  - `ANALYSE_INTEGRATION.md`

---

**Bon test ! 🎉**
