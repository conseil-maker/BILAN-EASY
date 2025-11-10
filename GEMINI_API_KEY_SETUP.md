# 🔑 Gemini API Key Kurulumu

Bu dokümantasyon, BILAN-EASY projesinde Gemini API key'ini nasıl yapılandıracağınızı açıklar.

## 📋 Gereksinimler

1. Google AI Studio'dan API key alın: https://aistudio.google.com/apikey
2. `.env.local` dosyası oluşturun veya düzenleyin

## 🚀 Hızlı Kurulum

### Adım 1: .env.local Dosyası Oluştur

Proje root dizininde `.env.local` dosyası oluşturun:

```bash
cd /Users/mikail/Desktop/bilan-101120251636
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local
```

**Önemli:** `your_api_key_here` yerine gerçek API key'inizi yazın!

### Adım 2: Docker Container'ı Rebuild Et

API key build-time'da gerekli olduğu için frontend container'ını yeniden build etmeniz gerekir:

```bash
# .env.local'den API key'i al ve build et
export $(grep -E "^VITE_GEMINI_API_KEY=|^GEMINI_API_KEY=" .env.local | head -1 | xargs)
docker-compose build --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" frontend

# Container'ı yeniden başlat
docker-compose up -d frontend
```

### Adım 3: Kontrol Et

```bash
# Frontend'in çalıştığını kontrol et
curl http://localhost:3000

# Tarayıcıda açın ve console'u kontrol edin
# http://localhost:3000
```

## 🔍 Sorun Giderme

### Problem: "Clé API Gemini manquante" hatası

**Çözüm 1: .env.local dosyasını kontrol edin**

```bash
# .env.local dosyasının var olduğunu kontrol et
ls -la .env.local

# İçeriğini kontrol et (API key gizli)
grep -E "GEMINI|API_KEY" .env.local
```

**Çözüm 2: Docker container'ı rebuild edin**

API key build-time variable olduğu için container rebuild edilmelidir:

```bash
# Mevcut container'ı durdur
docker-compose down frontend

# .env.local'den API key'i al
source .env.local 2>/dev/null || export $(grep -E "^VITE_GEMINI_API_KEY=" .env.local | xargs)

# Rebuild et
docker-compose build --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" frontend

# Başlat
docker-compose up -d frontend
```

**Çözüm 3: .env.local formatını kontrol edin**

`.env.local` dosyası şu formatta olmalı:

```bash
# Doğru format
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# VEYA
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Yanlış formatlar:**
```bash
# ❌ Boşluk var
VITE_GEMINI_API_KEY = your_key

# ❌ Tırnak içinde
VITE_GEMINI_API_KEY="your_key"

# ❌ Yorum satırı
# VITE_GEMINI_API_KEY=your_key
```

### Problem: Local development'ta çalışıyor ama Docker'da çalışmıyor

**Neden:** Docker build-time'da environment variable'ları kullanır, runtime'da değil.

**Çözüm:** Container'ı rebuild edin (yukarıdaki Çözüm 2'ye bakın).

### Problem: API key'i nereden alacağım?

1. https://aistudio.google.com/apikey adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API key'inizi kopyalayın
5. `.env.local` dosyasına ekleyin

## 📝 Örnek .env.local Dosyası

```bash
# Gemini API Key (Google AI Studio'dan alın)
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Backend API URL (Docker için)
VITE_API_URL=http://localhost:3001/api
```

## 🔐 Güvenlik Notları

1. **`.env.local` dosyasını Git'e commit etmeyin!**
   - `.gitignore` dosyasında olmalı
   - API key'ler public repository'lerde paylaşılmamalı

2. **Production'da:**
   - Environment variable'ları Docker secrets veya cloud provider'ın secret management sistemini kullanın
   - API key'leri hardcode etmeyin

3. **API Key Rotasyonu:**
   - Düzenli olarak API key'leri değiştirin
   - Eski key'leri revoke edin

## ✅ Doğrulama

API key'in doğru yapılandırıldığını kontrol etmek için:

1. **Tarayıcı Console:**
   - `http://localhost:3000` açın
   - F12 → Console
   - Hata mesajı olmamalı

2. **Network Tab:**
   - F12 → Network
   - Gemini API'ye istek yapıldığında 200 OK dönmeli

3. **Test:**
   - Welcome screen'de isim girin
   - Paket seçin
   - Soru-cevap ekranında AI sorular sormalı

## 🆘 Hala Çalışmıyor mu?

1. **Logları kontrol edin:**
   ```bash
   docker-compose logs frontend | grep -i "gemini\|api\|key"
   ```

2. **Container environment'ı kontrol edin:**
   ```bash
   docker-compose exec frontend env | grep GEMINI
   ```

3. **Build loglarını kontrol edin:**
   ```bash
   docker-compose build frontend 2>&1 | grep -i "gemini\|api\|key"
   ```

4. **Manuel test:**
   ```bash
   # .env.local'den API key'i oku
   source .env.local
   echo "API Key: ${VITE_GEMINI_API_KEY:0:20}..."
   ```

## 📚 Daha Fazla Bilgi

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

