# 🔍 Sentry Error Tracking Setup

Sentry entegrasyonu tamamlandı! Bu dokümantasyon, Sentry'yi nasıl yapılandıracağınızı açıklar.

## 📋 Gereksinimler

1. **Sentry Account**: [sentry.io](https://sentry.io) üzerinde ücretsiz bir hesap oluşturun
2. **Project Oluşturma**: Frontend ve Backend için iki ayrı proje oluşturun (veya tek bir proje kullanabilirsiniz)

## 🔧 Frontend Konfigürasyonu

### 1. Sentry'den DSN Alın

1. Sentry dashboard'a gidin
2. Projenizi seçin
3. **Settings** → **Projects** → **Client Keys (DSN)**
4. DSN'i kopyalayın

### 2. Environment Variables Ekle

`.env.local` dosyanıza ekleyin:

```bash
# Sentry Configuration (Frontend)
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ORG=your-org-slug
VITE_SENTRY_PROJECT=your-project-slug
VITE_SENTRY_AUTH_TOKEN=your-auth-token  # Source maps için (opsiyonel)
VITE_SENTRY_ENABLE_DEV=false  # Development'ta Sentry'yi aktif etmek için true yapın
```

**Not**: `VITE_SENTRY_AUTH_TOKEN` sadece source maps upload için gereklidir. Production build'lerde source maps yüklemek istiyorsanız ekleyin.

### 3. Auth Token Oluşturma (Source Maps için)

1. Sentry → **Settings** → **Account** → **Auth Tokens**
2. **Create New Token** → `project:releases` scope'u seçin
3. Token'ı kopyalayın ve `.env.local`'e ekleyin

## 🔧 Backend Konfigürasyonu

### 1. Environment Variables Ekle

Backend `.env` veya `.env.local` dosyanıza ekleyin:

```bash
# Sentry Configuration (Backend)
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENABLE_DEV=false  # Development'ta Sentry'yi aktif etmek için true yapın
```

## 🚀 Kullanım

### Frontend

Sentry otomatik olarak:
- ✅ React Error Boundary'deki hataları yakalar
- ✅ Unhandled promise rejections'ları yakalar
- ✅ Network errors'ları filtreler (CORS, Failed to fetch gibi)
- ✅ User context'i ekler (userId, sessionId)
- ✅ Performance monitoring yapar (traces)
- ✅ Session replay kaydeder (production'da)

### Backend

Sentry otomatik olarak:
- ✅ Tüm unhandled errors'ları yakalar
- ✅ Hono error handler'daki hataları yakalar
- ✅ Request context'i ekler (path, method, userId)
- ✅ Performance monitoring yapar (traces)
- ✅ Profiling yapar (production'da)

## 📊 Sentry Dashboard'da Göreceğiniz Bilgiler

- **Errors**: Tüm yakalanan hatalar
- **Performance**: API response times, slow queries
- **Releases**: Her deployment için release tracking
- **User Context**: Hangi kullanıcıda hata oluştu
- **Breadcrumbs**: Hata öncesi yapılan işlemler
- **Source Maps**: Minified kod yerine orijinal kod görüntüleme

## 🎯 Özellikler

### 1. Error Filtering

Sentry otomatik olarak şu hataları filtreler:
- Development'ta (eğer `VITE_SENTRY_ENABLE_DEV=false` ise)
- Network errors (CORS, Failed to fetch)
- Validation errors (beklenen hatalar)

### 2. User Context

Frontend'de otomatik olarak eklenir:
- `userId`: localStorage'dan alınan user ID
- `sessionId`: localStorage'dan alınan session ID

### 3. Performance Monitoring

- **Frontend**: Page load times, component render times
- **Backend**: API response times, database query times

### 4. Session Replay

Production'da kullanıcı session'larını replay edebilirsiniz (privacy mode: text ve media maskelenir).

## 🔍 Test Etme

### Frontend'de Test

```typescript
// Test için bir hata fırlatın
throw new Error('Test Sentry error');
```

### Backend'de Test

```typescript
// Test için bir hata fırlatın
throw new Error('Test Sentry error');
```

## 📝 Notlar

- **Development**: Varsayılan olarak development'ta Sentry kapalıdır (spam'i önlemek için)
- **Production**: Production'da otomatik olarak aktif olur
- **Source Maps**: Production build'lerde source maps yüklemek için `VITE_SENTRY_AUTH_TOKEN` gerekli
- **Privacy**: Session replay'de tüm text ve media otomatik olarak maskelenir

## 🆘 Sorun Giderme

### Sentry hataları görmüyorum

1. DSN'in doğru olduğundan emin olun
2. Environment variable'ların yüklendiğini kontrol edin
3. Browser console'da Sentry initialization loglarını kontrol edin
4. Development'ta `VITE_SENTRY_ENABLE_DEV=true` yapın

### Source maps yüklenmiyor

1. `VITE_SENTRY_AUTH_TOKEN`'ın doğru olduğundan emin olun
2. Auth token'ın `project:releases` scope'una sahip olduğunu kontrol edin
3. Build sırasında Sentry plugin'in çalıştığını kontrol edin

## 📚 Daha Fazla Bilgi

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/)

