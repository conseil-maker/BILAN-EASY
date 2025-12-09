# 🔒 Guide de Configuration Sécurisée

## ⚠️ IMPORTANT : Sécurité des Clés API

Ce document explique comment configurer les variables d'environnement de manière sécurisée.

---

## 📋 Variables d'Environnement Requises

L'application nécessite 3 variables d'environnement :

1. **VITE_SUPABASE_URL** : URL de votre projet Supabase
2. **VITE_SUPABASE_ANON_KEY** : Clé anonyme Supabase
3. **VITE_GEMINI_API_KEY** : Clé API Google Gemini

---

## 🏠 Configuration Locale (Développement)

### Étape 1 : Copier le fichier exemple

```bash
cp .env.example .env
```

### Étape 2 : Obtenir les clés API

#### Supabase
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **API**
4. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

#### Google Gemini
1. Aller sur https://aistudio.google.com/apikey
2. Créer un nouveau projet (si nécessaire)
3. Cliquer sur **Create API Key**
4. Copier la clé → `VITE_GEMINI_API_KEY`

### Étape 3 : Remplir le fichier .env

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSy...
```

### Étape 4 : Vérifier que .env est ignoré par Git

```bash
# Vérifier que .env est dans .gitignore
cat .gitignore | grep .env

# Si absent, ajouter :
echo ".env" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## ☁️ Configuration Production (Vercel)

### ⚠️ NE JAMAIS commiter les fichiers .env sur Git !

Les variables d'environnement de production doivent être configurées **uniquement sur Vercel**.

### Étape 1 : Accéder aux paramètres Vercel

1. Aller sur https://vercel.com/conseil-maker/bilan-easy
2. Cliquer sur **Settings**
3. Cliquer sur **Environment Variables**

### Étape 2 : Ajouter les variables

Pour chaque variable :

1. Cliquer sur **Add New**
2. **Name** : Nom de la variable (ex: `VITE_GEMINI_API_KEY`)
3. **Value** : Valeur de la clé API
4. **Environments** : Sélectionner :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Cliquer sur **Save**

### Étape 3 : Redéployer

Après avoir ajouté/modifié les variables :

1. Aller dans **Deployments**
2. Cliquer sur les **3 points** du dernier déploiement
3. Cliquer sur **Redeploy**
4. Confirmer

---

## 🔐 Bonnes Pratiques de Sécurité

### ✅ À FAIRE

- ✅ Utiliser `.env` uniquement en local
- ✅ Ajouter `.env` et `.env.production` dans `.gitignore`
- ✅ Configurer les variables sur Vercel Dashboard
- ✅ Utiliser `.env.example` avec des placeholders pour la documentation
- ✅ Révoquer et regénérer les clés si elles sont exposées

### ❌ À NE PAS FAIRE

- ❌ Commiter les fichiers `.env` sur Git
- ❌ Partager les clés API publiquement
- ❌ Utiliser les mêmes clés en dev et prod
- ❌ Hardcoder les clés dans le code source

---

## 🚨 En Cas d'Exposition de Clés

Si vous avez accidentellement exposé des clés API :

### 1. Révoquer immédiatement les clés

#### Gemini
1. Aller sur https://aistudio.google.com/apikey
2. Trouver la clé exposée
3. Cliquer sur **Delete**

#### Supabase
1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Cliquer sur **Reset anon key** (si nécessaire)
3. ⚠️ Attention : Cela va casser toutes les applications en production

### 2. Générer de nouvelles clés

Suivre les étapes de la section "Obtenir les clés API" ci-dessus.

### 3. Mettre à jour partout

- Fichier `.env` local
- Variables d'environnement Vercel
- Redéployer l'application

### 4. Nettoyer l'historique Git (si nécessaire)

Si les clés sont dans l'historique Git :

```bash
# Utiliser BFG Repo-Cleaner ou git filter-branch
# ⚠️ Opération avancée, peut casser l'historique

# Alternative : Créer un nouveau repository
```

---

## 📝 Checklist de Sécurité

Avant chaque déploiement :

- [ ] `.env` est dans `.gitignore`
- [ ] Aucun fichier `.env` n'est tracké par Git
- [ ] Les variables sont configurées sur Vercel
- [ ] Les clés de prod sont différentes des clés de dev
- [ ] Aucune clé n'est hardcodée dans le code

---

## 🔍 Vérification

### Vérifier que .env n'est pas tracké

```bash
git status
# .env ne doit PAS apparaître dans les fichiers modifiés
```

### Vérifier .gitignore

```bash
cat .gitignore | grep .env
# Doit afficher :
# .env
# .env.production
```

### Vérifier les variables Vercel

```bash
# Via le dashboard Vercel
# Ou via CLI :
vercel env ls
```

---

## 📞 Support

En cas de problème :

1. Consulter la [documentation Vercel](https://vercel.com/docs/environment-variables)
2. Consulter la [documentation Supabase](https://supabase.com/docs/guides/api)
3. Consulter la [documentation Gemini](https://ai.google.dev/docs)

---

**🔒 La sécurité de vos clés API est primordiale ! Suivez ce guide attentivement.**
