# 🚀 Deployment Guide

Bu dokümantasyon, BILAN-EASY projesini production'a deploy etmek için adım adım rehberdir.

## 📋 Ön Gereksinimler

- [ ] PostgreSQL database (Railway, Supabase, veya self-hosted)
- [ ] Clerk account (authentication için)
- [ ] Google Gemini API key
- [ ] Vercel/Netlify account (frontend için)
- [ ] Railway/Render account (backend için)

---

## 🐳 Docker ile Local Deployment

### 1. Environment Variables Ayarla

```bash
# .env dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle
```

### 2. Docker Compose ile Başlat

```bash
docker-compose up -d
```

### 3. Database Migration

```bash
# Backend container'a gir
docker exec -it bilan-backend sh

# Migration çalıştır
npm run db:push
```

### 4. Kontrol Et

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

---

## ☁️ Production Deployment

### Frontend (Vercel)

1. **Vercel'e bağla**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables Ekle**
   - `VITE_GEMINI_API_KEY`
   - `VITE_API_URL` (backend URL)
   - `VITE_CLERK_PUBLISHABLE_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Backend (Railway)

1. **Railway'a bağla**
   - GitHub repo'yu bağla
   - `backend/` klasörünü seç

2. **PostgreSQL Service Ekle**
   - Railway dashboard'dan PostgreSQL ekle
   - `DATABASE_URL` otomatik oluşur

3. **Environment Variables Ekle**
   - `DATABASE_URL` (otomatik)
   - `PORT=3001`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (Vercel URL)
   - `CLERK_SECRET_KEY`
   - `TEST_MODE=false`

4. **Deploy**
   - Railway otomatik deploy eder

---

## 🔄 CI/CD Pipeline

GitHub Actions ile otomatik test ve build:

```bash
# Push to main branch
git push origin main

# CI otomatik çalışır:
# 1. Frontend tests
# 2. Backend tests
# 3. Docker build
```

---

## 📊 Health Checks

### Backend Health Check

```bash
curl http://your-backend-url/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T12:00:00Z"
}
```

### Frontend Check

```bash
curl http://your-frontend-url
# Should return HTML
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check DATABASE_URL format
postgresql://user:password@host:port/dbname

# Test connection
psql $DATABASE_URL
```

### CORS Error

```bash
# Backend .env'de FRONTEND_URL'i kontrol et
FRONTEND_URL=https://your-frontend-url.com
```

### Build Error

```bash
# Clear cache
rm -rf node_modules dist
npm ci
npm run build
```

---

## 📝 Post-Deployment Checklist

- [ ] Frontend accessible
- [ ] Backend health check OK
- [ ] Database connection OK
- [ ] Authentication working (Clerk)
- [ ] Gemini API working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL certificates valid
- [ ] Monitoring setup (optional)

---

## 🔐 Security Checklist

- [ ] `TEST_MODE=false` in production
- [ ] Clerk keys are production keys
- [ ] API keys are secure
- [ ] CORS properly configured
- [ ] Database credentials secure
- [ ] HTTPS enabled
- [ ] Environment variables not exposed

---

## 📚 Additional Resources

- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Docker Compose](https://docs.docker.com/compose/)
- [Clerk Setup](https://clerk.com/docs)

