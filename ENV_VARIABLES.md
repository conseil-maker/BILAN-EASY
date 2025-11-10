# Environment Variables Documentation

Bu dokümantasyon, BILAN-EASY projesi için gerekli tüm environment variable'ları açıklar.

## 📋 Frontend (.env.local)

### Gerekli Variables

```bash
# Gemini AI API Key (ZORUNLU)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (Opsiyonel, default: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api

# Clerk Authentication (Production için gerekli)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Örnek .env.local

```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_API_URL=http://localhost:3001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 📋 Backend (.env)

### Gerekli Variables

```bash
# PostgreSQL Database URL (ZORUNLU)
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_easy

# Server Port (Opsiyonel, default: 3001)
PORT=3001

# Node Environment
NODE_ENV=development

# Frontend URL (CORS için)
FRONTEND_URL=http://localhost:3000

# Clerk Authentication (Production için gerekli)
CLERK_SECRET_KEY=sk_test_...

# Test Mode (Development için)
TEST_MODE=true
```

### Örnek .env

```bash
DATABASE_URL=postgresql://mikail@localhost:5432/bilan_easy
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
TEST_MODE=true
# CLERK_SECRET_KEY=sk_test_... (Production'da gerekli)
```

---

## 🐳 Docker Compose (.env)

Docker Compose için ayrı bir `.env` dosyası oluşturun:

```bash
# PostgreSQL
POSTGRES_USER=bilan_user
POSTGRES_PASSWORD=bilan_password
POSTGRES_DB=bilan_easy

# Backend
TEST_MODE=false
CLERK_SECRET_KEY=sk_test_...

# Frontend
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_GEMINI_API_KEY=AIzaSy...
```

---

## 🔐 Production Environment Variables

### Frontend (Vercel/Netlify)

```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_API_URL=https://api.yourdomain.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Backend (Railway/Render)

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
CLERK_SECRET_KEY=sk_live_...
TEST_MODE=false
```

---

## ⚠️ Güvenlik Notları

1. **Asla `.env` dosyalarını Git'e commit etmeyin**
2. **Production'da `TEST_MODE=false` kullanın**
3. **API key'leri düzenli olarak rotate edin**
4. **Clerk key'leri production ve test için farklı olmalı**

---

## 📝 Environment Variable Checklist

### Development
- [ ] `VITE_GEMINI_API_KEY` (Frontend)
- [ ] `DATABASE_URL` (Backend)
- [ ] `TEST_MODE=true` (Backend)

### Production
- [ ] `VITE_GEMINI_API_KEY` (Frontend)
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` (Frontend)
- [ ] `DATABASE_URL` (Backend)
- [ ] `CLERK_SECRET_KEY` (Backend)
- [ ] `TEST_MODE=false` (Backend)
- [ ] `NODE_ENV=production` (Backend)

