#!/bin/bash

# BILAN-EASY Final Test Script
# Bu script tüm servislerin çalıştığını ve test edilebilir olduğunu doğrular

set -e

echo "=== 🧪 BILAN-EASY FINAL TEST ==="
echo ""

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test fonksiyonu
test_check() {
    local name=$1
    local command=$2
    
    echo -n "Testing $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# 1. Docker kontrolü
echo "📦 Docker Kontrolü:"
test_check "Docker çalışıyor" "docker ps"
test_check "docker-compose mevcut" "docker-compose --version"

# 2. Container durumu
echo ""
echo "🐳 Container Durumu:"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Container'lar çalışıyor${NC}"
    docker-compose ps
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Container'lar çalışmıyor, başlatılıyor...${NC}"
    docker-compose up -d
    sleep 5
    docker-compose ps
fi

# 3. PostgreSQL kontrolü
echo ""
echo "🗄️  PostgreSQL Kontrolü:"
test_check "PostgreSQL erişilebilir" "docker-compose exec -T postgres pg_isready -U bilan_user"

# 4. Database schema kontrolü
echo ""
echo "📊 Database Schema:"
TABLES=$(docker-compose exec -T postgres psql -U bilan_user -d bilan_easy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLES" -ge "3" ]; then
    echo -e "${GREEN}✅ Database schema mevcut ($TABLES tablo)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Schema eksik, oluşturuluyor...${NC}"
    # Schema oluşturma script'i buraya eklenecek
    ((FAILED++))
fi

# 5. Backend health check
echo ""
echo "🔧 Backend Kontrolü:"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend çalışıyor${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
    ((PASSED++))
else
    echo -e "${RED}❌ Backend yanıt vermiyor${NC}"
    ((FAILED++))
fi

# 6. Frontend kontrolü
echo ""
echo "🌐 Frontend Kontrolü:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend çalışıyor (HTTP $FRONTEND_STATUS)${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Frontend yanıt vermiyor (HTTP $FRONTEND_STATUS)${NC}"
    ((FAILED++))
fi

# 7. API test (Assessment oluşturma)
echo ""
echo "🧪 API Test (Assessment Oluşturma):"
API_RESPONSE=$(curl -s -X POST http://localhost:3001/api/assessments \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: final-test-user" \
  -H "X-Session-Id: final-test-session" \
  -d '{
    "userName": "Final Test User",
    "packageId": "decouverte",
    "packageName": "Découverte",
    "coachingStyle": "collaborative",
    "totalQuestions": 10
  }' 2>/dev/null)

if echo "$API_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✅ API test başarılı${NC}"
    echo "$API_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$API_RESPONSE" | head -5
    ((PASSED++))
else
    echo -e "${RED}❌ API test başarısız${NC}"
    echo "$API_RESPONSE"
    ((FAILED++))
fi

# 8. CORS kontrolü
echo ""
echo "🔐 CORS Kontrolü:"
CORS_HEADERS=$(curl -s -X OPTIONS http://localhost:3001/api/assessments \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,X-Test-User-Id,X-Session-Id" \
  -i 2>/dev/null | grep -i "access-control")

if echo "$CORS_HEADERS" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS header'ları doğru${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  CORS header'ları kontrol edilemedi${NC}"
    ((FAILED++))
fi

# Özet
echo ""
echo "=== 📊 TEST ÖZETİ ==="
echo -e "${GREEN}✅ Başarılı: $PASSED${NC}"
echo -e "${RED}❌ Başarısız: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TÜM TESTLER BAŞARILI!${NC}"
    echo ""
    echo "✅ Proje test edilmeye hazır:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:3001"
    echo "   - API: http://localhost:3001/api"
    echo ""
    echo "📝 Tarayıcıda http://localhost:3000 adresini açıp test edebilirsiniz."
    exit 0
else
    echo -e "${RED}⚠️  BAZI TESTLER BAŞARISIZ${NC}"
    echo ""
    echo "🔍 Sorun giderme:"
    echo "   1. Logları kontrol edin: docker-compose logs -f"
    echo "   2. Container durumunu kontrol edin: docker-compose ps"
    echo "   3. Servisleri yeniden başlatın: docker-compose restart"
    exit 1
fi

