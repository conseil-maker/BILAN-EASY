# 🧪 Final Test Guide - BILAN-EASY

Bu dokümantasyon, BILAN-EASY projesini Docker üzerinde nasıl test edeceğinizi adım adım açıklar.

## 📋 Ön Gereksinimler

- Docker Desktop çalışıyor olmalı
- Port 3000, 3001, 5432 boş olmalı
- `.env.local` dosyasında `GEMINI_API_KEY` tanımlı olmalı

## 🚀 Hızlı Başlangıç

### 1. Tüm Servisleri Başlatma

```bash
# Proje dizinine git
cd /Users/mikail/Desktop/bilan-101120251636

# Docker container'ları başlat
docker-compose up -d

# Servis durumunu kontrol et
docker-compose ps
```

**Beklenen Çıktı:**
```
NAME             STATUS
bilan-postgres   Up (healthy)
bilan-backend    Up (healthy)
bilan-frontend   Up
```

### 2. Servislerin Çalıştığını Doğrulama

```bash
# PostgreSQL kontrolü
docker-compose exec postgres pg_isready -U bilan_user

# Backend health check
curl http://localhost:3001/health

# Frontend kontrolü
curl -I http://localhost:3000
```

**Beklenen Çıktı:**
- PostgreSQL: `postgres:5432 - accepting connections`
- Backend: `{"status":"ok","timestamp":"...","environment":"production"}`
- Frontend: `HTTP/1.1 200 OK`

## 🧪 Test Senaryoları

### Senaryo 1: Tam Akış Testi (End-to-End)

#### Adım 1: Frontend'i Açın
```
Tarayıcıda: http://localhost:3000
```

#### Adım 2: Welcome Screen
1. İsminizi girin (örn: "Test User")
2. "Commencer mon bilan" butonuna tıklayın
3. ✅ **Beklenen**: Paket seçim ekranı açılmalı

#### Adım 3: Paket Seçimi
1. Üç paketten birini seçin (örn: "Découverte")
2. "Sélectionner ce Forfait" butonuna tıklayın
3. ✅ **Beklenen**: 
   - Loading gösterilmeli
   - Toast bildirimi: "Bilan créé avec succès"
   - Ön faz ekranı açılmalı

#### Adım 4: Ön Faz
1. Coaching stilini seçin (Collaboratif/Analytique/Créatif)
2. "Commencer le Bilan" butonuna tıklayın
3. ✅ **Beklenen**: Kişiselleştirme ekranı açılmalı

#### Adım 5: Kişiselleştirme (Opsiyonel)
1. CV metnini yapıştırın VEYA
2. "Passer cette étape" butonuna tıklayın
3. ✅ **Beklenen**: Soru-cevap ekranı açılmalı

#### Adım 6: Soru-Cevap
1. AI'nın sorduğu sorulara cevap verin
2. Her cevaptan sonra:
   - ✅ **Beklenen**: Cevap backend'e kaydedilmeli
   - ✅ **Beklenen**: Toast bildirimi gösterilmeli
   - ✅ **Beklenen**: Sonraki soru gelmeli

#### Adım 7: Özet
1. Tüm soruları tamamlayın
2. ✅ **Beklenen**: 
   - Final özet ekranı açılmalı
   - Dashboard verileri gösterilmeli
   - PDF export butonu çalışmalı

### Senaryo 2: API Testleri (cURL)

#### Test 1: Assessment Oluşturma
```bash
curl -X POST http://localhost:3001/api/assessments \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: test-user-123" \
  -H "X-Session-Id: test-session-123" \
  -d '{
    "userName": "API Test User",
    "packageId": "decouverte",
    "packageName": "Découverte",
    "coachingStyle": "collaborative",
    "totalQuestions": 10
  }'
```

**Beklenen Çıktı:**
```json
{
  "id": "uuid-here",
  "userName": "API Test User",
  "packageId": "decouverte",
  "status": "in_progress",
  ...
}
```

#### Test 2: Assessment Listeleme
```bash
curl http://localhost:3001/api/assessments?status=completed \
  -H "X-Test-User-Id: test-user-123" \
  -H "X-Session-Id: test-session-123"
```

#### Test 3: Answer Ekleme
```bash
# Önce assessment ID'yi alın (yukarıdaki testten)
ASSESSMENT_ID="your-assessment-id-here"

curl -X POST http://localhost:3001/api/assessments/$ASSESSMENT_ID/answers \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: test-user-123" \
  -H "X-Session-Id: test-session-123" \
  -d '{
    "questionId": "question-1",
    "questionTitle": "Test Question",
    "questionType": "PARAGRAPH",
    "value": "Test Answer"
  }'
```

### Senaryo 3: Unit Testleri

#### Frontend Testleri
```bash
# Tüm frontend testleri
npm test

# Coverage raporu
npm test -- --coverage

# Vitest UI
npm run test:ui
```

**Beklenen Çıktı:**
```
Test Files  22 passed (22)
Tests  69 passed (69)
```

#### Backend Testleri
```bash
cd backend
npm test

# Coverage raporu
npm test -- --coverage
```

**Beklenen Çıktı:**
```
Test Files  7 passed (7)
Tests  25 passed (25)
```

## 🔍 Sorun Giderme

### Problem: Port zaten kullanımda

```bash
# Port'u kullanan process'i bul
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Process'i durdur
kill -9 <PID>
```

### Problem: Docker container başlamıyor

```bash
# Logları kontrol et
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Container'ı yeniden başlat
docker-compose restart backend
```

### Problem: Database bağlantı hatası

```bash
# PostgreSQL'in çalıştığını kontrol et
docker-compose exec postgres pg_isready -U bilan_user

# Schema'yı yeniden oluştur
docker-compose exec postgres psql -U bilan_user -d bilan_easy < /tmp/create_tables.sql
```

### Problem: Frontend backend'e bağlanamıyor

```bash
# Backend'in çalıştığını kontrol et
curl http://localhost:3001/health

# CORS header'larını kontrol et
curl -X OPTIONS http://localhost:3001/api/assessments \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

## 📊 Monitoring ve Loglar

### Logları İzleme

```bash
# Tüm servislerin logları
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece frontend
docker-compose logs -f frontend

# Sadece postgres
docker-compose logs -f postgres
```

### Database'e Bağlanma

```bash
# PostgreSQL'e bağlan
docker-compose exec postgres psql -U bilan_user -d bilan_easy

# Tabloları listele
\dt

# Assessment'ları görüntüle
SELECT id, user_name, package_name, status FROM assessments;

# Çıkış
\q
```

## 🧹 Temizlik ve Yeniden Başlatma

### Tüm Servisleri Durdurma

```bash
docker-compose down
```

### Volume'ları da Temizleme

```bash
docker-compose down -v
```

### Yeniden Build ve Başlatma

```bash
# Clean build
docker-compose build --no-cache

# Başlat
docker-compose up -d

# Logları izle
docker-compose logs -f
```

## ✅ Final Checklist

Test etmeden önce kontrol edin:

- [ ] Docker Desktop çalışıyor
- [ ] Port 3000, 3001, 5432 boş
- [ ] `.env.local` dosyasında `GEMINI_API_KEY` var
- [ ] `docker-compose ps` tüm servisleri "Up" gösteriyor
- [ ] `curl http://localhost:3001/health` başarılı
- [ ] `curl http://localhost:3000` başarılı
- [ ] Database schema oluşturulmuş (`\dt` komutu tabloları gösteriyor)

## 🎯 Hızlı Test Komutu

Tüm kontrolleri tek seferde yapmak için:

```bash
#!/bin/bash
echo "=== 🔍 BILAN-EASY FINAL TEST ==="
echo ""

echo "1. Docker container durumu:"
docker-compose ps

echo ""
echo "2. Backend health check:"
curl -s http://localhost:3001/health | python3 -m json.tool || curl -s http://localhost:3001/health

echo ""
echo "3. Frontend kontrolü:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000

echo ""
echo "4. Database tabloları:"
docker-compose exec -T postgres psql -U bilan_user -d bilan_easy -c "\dt" 2>&1 | grep -E "(assessments|answers|summaries)"

echo ""
echo "5. API test (assessment oluşturma):"
curl -s -X POST http://localhost:3001/api/assessments \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: final-test" \
  -H "X-Session-Id: final-session" \
  -d '{"userName":"Test","packageId":"decouverte","packageName":"Découverte","coachingStyle":"collaborative","totalQuestions":10}' | python3 -m json.tool | head -10 || echo "API test başarısız"

echo ""
echo "✅ Test tamamlandı!"
```

Bu script'i `test-final.sh` olarak kaydedip çalıştırabilirsiniz.

## 📝 Notlar

- **Test Modu**: Backend şu anda test modunda çalışıyor (Clerk authentication bypass)
- **Session-based Auth**: Her kullanıcı için otomatik session ID oluşturuluyor
- **Database**: PostgreSQL Docker container'ında çalışıyor
- **Frontend**: Nginx ile serve ediliyor (port 80 -> 3000)
- **Backend**: Node.js ile çalışıyor (port 3001)

## 🆘 Yardım

Sorun yaşarsanız:
1. Logları kontrol edin: `docker-compose logs -f`
2. Container durumunu kontrol edin: `docker-compose ps`
3. Health check yapın: `curl http://localhost:3001/health`
4. Database'e bağlanın: `docker-compose exec postgres psql -U bilan_user -d bilan_easy`

