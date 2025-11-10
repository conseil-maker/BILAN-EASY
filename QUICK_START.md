# 🚀 QUICK START - BILAN-EASY

Guide de démarrage rapide pour lancer le projet en local.

---

## ⚠️ PRÉREQUIS

- **Node.js** 18+ (vérifier avec `node -v`)
- **PostgreSQL** 15+ (ou compte Railway gratuit)
- **npm** ou **yarn**

---

## 📦 ÉTAPE 1 : CLONER LE PROJET

```bash
git clone https://github.com/lekesiz/BILAN-EASY.git
cd BILAN-EASY
```

---

## 🗄️ ÉTAPE 2 : SETUP BASE DE DONNÉES

### Option A : PostgreSQL Local

```bash
# Installer PostgreSQL si pas déjà fait
# macOS: brew install postgresql@15
# Ubuntu: sudo apt install postgresql-15

# Créer la base de données
createdb bilan_easy

# Ou via psql
psql -U postgres
CREATE DATABASE bilan_easy;
\q
```

### Option B : Railway (Cloud, Gratuit)

1. Aller sur https://railway.app/
2. Créer un compte (gratuit)
3. New Project → Deploy PostgreSQL
4. Copier la `DATABASE_URL` dans les variables

---

## 🔐 ÉTAPE 3 : CRÉER UN COMPTE CLERK

1. Aller sur https://clerk.com/
2. Créer un compte gratuit
3. New Application → Choisir un nom
4. Copier les clés :
   - `CLERK_PUBLISHABLE_KEY` (commence par `pk_test_...`)
   - `CLERK_SECRET_KEY` (commence par `sk_test_...`)

---

## ⚙️ ÉTAPE 4 : CONFIGURATION

### Backend

```bash
cd backend
npm install

# Créer .env avec vos vraies clés
cp .env.example .env
nano .env  # ou vim, code, etc.
```

**Remplacer dans `backend/.env`** :
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_easy  # Votre BDD
CLERK_SECRET_KEY=sk_test_...  # Votre clé Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...  # Votre clé Clerk publique
```

### Frontend

```bash
cd ..  # Retour à la racine
npm install

# Éditer .env.local
nano .env.local
```

**Remplacer dans `.env.local`** :
```bash
GEMINI_API_KEY=votre_clé_gemini  # https://aistudio.google.com/app/apikey
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Même que backend
```

---

## 🗃️ ÉTAPE 5 : CRÉER LES TABLES

```bash
cd backend

# Générer les migrations
npm run db:generate

# Appliquer à la BDD (créer les tables)
npm run db:push

# Vérifier avec Drizzle Studio (interface web)
npm run db:studio
# → Ouvre http://localhost:4983/
```

---

## 🚀 ÉTAPE 6 : LANCER L'APPLICATION

### Terminal 1 : Backend

```bash
cd backend
npm run dev

# ✅ Devrait afficher:
# 🚀 Server is running on http://localhost:3001
# 📋 Health check: http://localhost:3001/health
```

### Terminal 2 : Frontend

```bash
# Depuis la racine
npm run dev

# ✅ Devrait afficher:
# ➜  Local:   http://localhost:3000/
```

---

## ✅ ÉTAPE 7 : TESTER

1. **Ouvrir** : http://localhost:3000/
2. **Se connecter** avec Clerk (créer un compte test)
3. **Créer un bilan** et répondre aux questions
4. **Vérifier la BDD** : `npm run db:studio` dans le backend

---

## 🐛 PROBLÈMES COURANTS

### "Cannot connect to database"
```bash
# Vérifier que PostgreSQL tourne
pg_isready
# ou
sudo systemctl status postgresql

# Tester la connexion
psql $DATABASE_URL
```

### "Clerk auth failed"
- Vérifier que `VITE_CLERK_PUBLISHABLE_KEY` commence par `pk_test_`
- Vérifier que `CLERK_SECRET_KEY` commence par `sk_test_`
- Les deux doivent venir de la même application Clerk

### "Module not found"
```bash
# Backend
cd backend && npm install

# Frontend
npm install
```

### Port 3000 ou 3001 déjà utilisé
```bash
# Changer le port backend dans backend/.env
PORT=3002

# Changer le port frontend
npm run dev -- --port 3001
```

---

## 📚 PROCHAINES ÉTAPES

Une fois que ça marche en local :

1. **Tester le flow complet** : Créer un bilan, répondre, voir la synthèse
2. **Lire** `BACKEND_IMPLEMENTATION.md` pour comprendre l'architecture
3. **Déployer** :
   - Backend : Railway (5€/mois)
   - Frontend : Vercel (gratuit)
4. **Consulter** `DESCRIPTIF_PROJET.md` pour la roadmap complète

---

## 🆘 BESOIN D'AIDE ?

- **Documentation complète** : Lire `BACKEND_IMPLEMENTATION.md`
- **Prompt AI Studio** : Copier `PROMPT_AISTUDIO.txt` dans https://aistudio.google.com/
- **Issues GitHub** : https://github.com/lekesiz/BILAN-EASY/issues

---

## ✨ LANGUAGES SUPPORTÉS (ROADMAP)

Actuellement : **Français** uniquement

Prévus :
- 🇬🇧 Anglais
- 🇪🇸 Espagnol
- 🇩🇪 **Allemand** (demandé)
- 🇹🇷 **Turc** (demandé)

---

<div align="center">

**Bonne chance ! 🚀**

Si tout fonctionne, vous avez un backend production-ready !

</div>
