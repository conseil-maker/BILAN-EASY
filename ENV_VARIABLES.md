# Environment Variables Documentation

Bu dokümantasyon, BILAN-EASY projesi için gerekli tüm environment variable'ları açıklar.

## 📋 Frontend (.env.local)

### AI Provider API Keys (En az biri ZORUNLU)

Multi-provider AI sistemi ile Gemini, OpenAI ve Claude API'lerinden birini veya birkaçını kullanabilirsiniz. Bir provider başarısız olursa otomatik olarak diğerine geçer.

```bash
# Gemini AI API Key (Önerilen - En ucuz ve hızlı)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
# veya
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (Opsiyonel - Fallback için)
VITE_OPENAI_API_KEY=your_openai_api_key_here
# Model seçimi (opsiyonel, default: gpt-4o)
VITE_OPENAI_MODEL=gpt-4o  # veya gpt-4o-mini, gpt-4-turbo

# Claude (Anthropic) API Key (Opsiyonel - Fallback için)
VITE_CLAUDE_API_KEY=your_claude_api_key_here
# Model seçimi (opsiyonel, default: claude-3-5-sonnet-20241022)
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022  # veya claude-3-opus-20240229

# Backend API URL (Opsiyonel, default: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

### Örnek .env.local

**Minimum konfigürasyon (sadece Gemini):**
```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_API_URL=http://localhost:3001/api
```

**Tüm provider'lar ile (en güvenilir):**
```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_OPENAI_API_KEY=sk-...
VITE_CLAUDE_API_KEY=sk-ant-...
VITE_API_URL=http://localhost:3001/api
```

**Not:** En az bir AI provider API key'i gereklidir. Birden fazla provider yapılandırıldığında, birinde hata olursa otomatik olarak diğerine geçilir.

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
- [ ] En az bir AI provider API key'i (Gemini, OpenAI veya Claude)
  - [ ] `VITE_GEMINI_API_KEY` (Önerilen)
  - [ ] `VITE_OPENAI_API_KEY` (Opsiyonel - Fallback)
  - [ ] `VITE_CLAUDE_API_KEY` (Opsiyonel - Fallback)
- [ ] `DATABASE_URL` (Backend)
- [ ] `TEST_MODE=true` (Backend)

### Production
- [ ] En az bir AI provider API key'i (Gemini, OpenAI veya Claude)
  - [ ] `VITE_GEMINI_API_KEY` (Önerilen)
  - [ ] `VITE_OPENAI_API_KEY` (Opsiyonel - Fallback)
  - [ ] `VITE_CLAUDE_API_KEY` (Opsiyonel - Fallback)
- [ ] `DATABASE_URL` (Backend)
- [ ] `TEST_MODE=false` (Backend)
- [ ] `NODE_ENV=production` (Backend)

## 🤖 AI Provider Özellikleri

### Gemini (Google)
- ✅ **Önerilen**: En ucuz ve hızlı
- ✅ Google Search entegrasyonu
- ✅ Model: `gemini-2.5-flash` (soru üretimi), `gemini-2.5-pro` (özet)
- 📝 API Key: [Google AI Studio](https://aistudio.google.com/app/apikey)

### OpenAI
- ✅ Güçlü ve güvenilir
- ✅ Model: `gpt-4o` (default), `gpt-4o-mini`, `gpt-4-turbo`
- 📝 API Key: [OpenAI Platform](https://platform.openai.com/api-keys)

### Claude (Anthropic)
- ✅ Yüksek kaliteli çıktılar
- ✅ Model: `claude-3-5-sonnet-20241022` (default), `claude-3-opus-20240229`
- 📝 API Key: [Anthropic Console](https://console.anthropic.com/)

## 🔄 Fallback Mekanizması

Sistem otomatik olarak şu sırayla provider'ları dener:
1. Mevcut aktif provider
2. Sıradaki yapılandırılmış provider
3. Tüm provider'lar başarısız olursa hata döner

Bir provider 3 kez üst üste başarısız olursa geçici olarak devre dışı bırakılır.


