# 🧪 Final Test Örneği - BILAN-EASY

Bu dokümantasyon, BILAN-EASY projesini Docker üzerinde nasıl test edeceğinizi **adım adım** gösterir.

## ✅ Ön Kontrol

Test etmeden önce şu komutu çalıştırın:

```bash
cd /Users/mikail/Desktop/bilan-101120251636
./test-final.sh
```

**Beklenen Çıktı:**
```
🎉 TÜM TESTLER BAŞARILI!
✅ Başarılı: 9
❌ Başarısız: 0
```

## 🚀 Hızlı Başlangıç (3 Adım)

### 1. Servisleri Başlat

```bash
cd /Users/mikail/Desktop/bilan-101120251636
docker-compose up -d
```

### 2. Durumu Kontrol Et

```bash
docker-compose ps
```

**Beklenen:**
```
NAME             STATUS
bilan-postgres   Up (healthy)
bilan-backend    Up (healthy)
bilan-frontend   Up
```

### 3. Tarayıcıda Aç

```
http://localhost:3000
```

## 📋 Detaylı Test Senaryosu

### Senaryo: Tam Kullanıcı Akışı

#### Adım 1: Welcome Screen ✅

1. Tarayıcıda `http://localhost:3000` açın
2. **Beklenen**: "Bilan de Compétences" başlığı görünmeli
3. İsminizi girin (örn: "Test User")
4. "Commencer mon bilan" butonuna tıklayın

**✅ Başarı Kriteri:**
- Paket seçim ekranı açılmalı
- Console'da hata olmamalı

---

#### Adım 2: Paket Seçimi ✅

1. Üç paketten birini seçin (örn: "Découverte")
2. "Sélectionner ce Forfait" butonuna tıklayın

**✅ Başarı Kriteri:**
- Loading gösterilmeli ("Création en cours...")
- Toast bildirimi: "Bilan créé avec succès" (yeşil)
- Ön faz ekranı açılmalı
- Console'da: `✅ Assessment created: {...}`

**🔍 Kontrol:**
```bash
# Backend'de assessment oluşturuldu mu?
curl http://localhost:3001/api/assessments \
  -H "X-Test-User-Id: test-user" \
  -H "X-Session-Id: test-session" | python3 -m json.tool
```

---

#### Adım 3: Ön Faz (Phase Préliminaire) ✅

1. Coaching stilini seçin:
   - **Collaboratif** (bienveillant)
   - **Analytique** (structuré)
   - **Créatif** (inspirant)
2. "Commencer le Bilan" butonuna tıklayın

**✅ Başarı Kriteri:**
- Kişiselleştirme ekranı açılmalı
- Console'da: `✅ Preliminary phase confirmed`

---

#### Adım 4: Kişiselleştirme (Opsiyonel) ✅

**Seçenek A: CV Yükle**
1. CV metnini textarea'ya yapıştırın
2. "Personnaliser le bilan" butonuna tıklayın
3. ✅ **Beklenen**: Loading → Soru ekranı

**Seçenek B: Atla**
1. "Passer cette étape" butonuna tıklayın
2. ✅ **Beklenen**: Direkt soru ekranı

---

#### Adım 5: Soru-Cevap (Questionnaire) ✅

1. AI'nın sorduğu sorulara cevap verin
2. Her cevaptan sonra:

**✅ Başarı Kriteri:**
- Cevap backend'e kaydedilmeli
- Toast bildirimi gösterilmeli
- Sonraki soru gelmeli
- Dashboard güncellenmeli (her 5 soruda)

**🔍 Kontrol:**
```bash
# Assessment ID'yi alın (console'dan veya API'den)
ASSESSMENT_ID="your-assessment-id"

# Answers'ları kontrol edin
curl http://localhost:3001/api/assessments/$ASSESSMENT_ID/answers \
  -H "X-Test-User-Id: test-user" \
  -H "X-Session-Id: test-session" | python3 -m json.tool
```

**Özellikler:**
- 🎤 **Sesli Giriş**: Mikrofon butonuna tıklayın, konuşun
- 🔊 **Sesli Çıkış**: AI cevapları sesli okuyabilir
- 🎯 **Joker**: Soruyu yeniden formüle etmek için
- 📊 **Dashboard**: Gerçek zamanlı güncelleme

---

#### Adım 6: Final Özet (Summary) ✅

1. Tüm soruları tamamlayın
2. ✅ **Beklenen**:
   - Final özet ekranı açılmalı
   - Dashboard verileri gösterilmeli
   - PDF export butonu çalışmalı
   - Toast: "Synthèse sauvegardée avec succès"

**🔍 Kontrol:**
```bash
# Summary'yi kontrol edin
curl http://localhost:3001/api/assessments/$ASSESSMENT_ID/summary \
  -H "X-Test-User-Id: test-user" \
  -H "X-Session-Id: test-session" | python3 -m json.tool
```

---

#### Adım 7: Geçmiş (History) ✅

1. Ana ekranda "Consulter l'historique" butonuna tıklayın
2. ✅ **Beklenen**:
   - Tamamlanan bilan'lar listelenmeli
   - Her bilan için detay görüntülenebilmeli

**🔍 Kontrol:**
```bash
# Completed assessments'ları listeleyin
curl "http://localhost:3001/api/assessments?status=completed" \
  -H "X-Test-User-Id: test-user" \
  -H "X-Session-Id: test-session" | python3 -m json.tool
```

---

## 🧪 API Test Örnekleri

### Test 1: Assessment Oluşturma

```bash
curl -X POST http://localhost:3001/api/assessments \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: api-test-user" \
  -H "X-Session-Id: api-test-session" \
  -d '{
    "userName": "API Test",
    "packageId": "decouverte",
    "packageName": "Découverte",
    "coachingStyle": "collaborative",
    "totalQuestions": 10
  }' | python3 -m json.tool
```

**Beklenen:**
```json
{
  "id": "uuid-here",
  "userName": "API Test",
  "status": "in_progress",
  ...
}
```

### Test 2: Answer Ekleme

```bash
# Önce assessment ID'yi alın
ASSESSMENT_ID="your-assessment-id"

curl -X POST http://localhost:3001/api/assessments/$ASSESSMENT_ID/answers \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: api-test-user" \
  -H "X-Session-Id: api-test-session" \
  -d '{
    "questionId": "q1",
    "questionTitle": "Quelle est votre motivation principale?",
    "questionType": "PARAGRAPH",
    "value": "Je veux évoluer dans ma carrière"
  }' | python3 -m json.tool
```

### Test 3: Summary Oluşturma

```bash
curl -X POST http://localhost:3001/api/assessments/$ASSESSMENT_ID/summary \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: api-test-user" \
  -H "X-Session-Id: api-test-session" \
  -d '{
    "profileType": "Test Profile",
    "priorityThemes": ["Theme 1", "Theme 2"],
    "maturityLevel": "Intermediate",
    "keyStrengths": [{"text": "Strength 1", "sources": ["source1"]}],
    "areasForDevelopment": [{"text": "Area 1", "sources": ["source2"]}],
    "recommendations": ["Recommendation 1"],
    "actionPlan": {
      "shortTerm": [{"id": "1", "text": "Action 1"}],
      "mediumTerm": [{"id": "2", "text": "Action 2"}]
    }
  }' | python3 -m json.tool
```

## 🔍 Sorun Giderme

### Problem: Frontend açılmıyor

```bash
# Container loglarını kontrol et
docker-compose logs frontend

# Container'ı yeniden başlat
docker-compose restart frontend
```

### Problem: Backend yanıt vermiyor

```bash
# Health check
curl http://localhost:3001/health

# Logları kontrol et
docker-compose logs backend

# Container'ı yeniden başlat
docker-compose restart backend
```

### Problem: Database hatası

```bash
# PostgreSQL durumunu kontrol et
docker-compose exec postgres pg_isready -U bilan_user

# Schema'yı kontrol et
docker-compose exec postgres psql -U bilan_user -d bilan_easy -c "\dt"

# Schema'yı yeniden oluştur (gerekirse)
docker-compose exec postgres psql -U bilan_user -d bilan_easy < /tmp/create_tables.sql
```

### Problem: CORS hatası

```bash
# CORS header'larını kontrol et
curl -X OPTIONS http://localhost:3001/api/assessments \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v | grep -i "access-control"
```

## 📊 Monitoring

### Logları İzleme

```bash
# Tüm servisler
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Son 50 satır
docker-compose logs --tail=50 backend
```

### Database Sorguları

```bash
# PostgreSQL'e bağlan
docker-compose exec postgres psql -U bilan_user -d bilan_easy

# Assessment'ları listele
SELECT id, user_name, package_name, status, created_at 
FROM assessments 
ORDER BY created_at DESC 
LIMIT 10;

# Answers sayısı
SELECT assessment_id, COUNT(*) as answer_count 
FROM answers 
GROUP BY assessment_id;
```

## ✅ Final Checklist

Test etmeden önce:

- [ ] `./test-final.sh` başarılı
- [ ] `docker-compose ps` tüm servisleri "Up" gösteriyor
- [ ] `curl http://localhost:3001/health` başarılı
- [ ] `curl http://localhost:3000` HTTP 200 döndürüyor
- [ ] Database'de tablolar mevcut (`\dt` komutu)

## 🎯 Hızlı Test Komutu

Tek komutla tüm kontrolleri yapın:

```bash
./test-final.sh
```

Bu script:
- ✅ Docker kontrolü
- ✅ Container durumu
- ✅ PostgreSQL kontrolü
- ✅ Database schema
- ✅ Backend health check
- ✅ Frontend kontrolü
- ✅ API test
- ✅ CORS kontrolü

## 📝 Test Sonuçları

Başarılı test sonrası:

```
✅ Başarılı: 9
❌ Başarısız: 0

🎉 TÜM TESTLER BAŞARILI!

✅ Proje test edilmeye hazır:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - API: http://localhost:3001/api
```

## 🆘 Yardım

Sorun yaşarsanız:

1. **Logları kontrol edin**: `docker-compose logs -f`
2. **Container durumunu kontrol edin**: `docker-compose ps`
3. **Health check yapın**: `curl http://localhost:3001/health`
4. **Servisleri yeniden başlatın**: `docker-compose restart`

## 🎉 Başarılı Test Sonrası

Tüm testler başarılıysa:

1. ✅ Tarayıcıda `http://localhost:3000` açın
2. ✅ Tam kullanıcı akışını test edin
3. ✅ Console'da hata olmadığını kontrol edin
4. ✅ Backend'de verilerin kaydedildiğini doğrulayın

**Proje production'a hazır! 🚀**

