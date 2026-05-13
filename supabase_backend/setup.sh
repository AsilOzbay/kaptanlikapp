#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# KaptanlikApp - Supabase Backend Setup Script
# ═══════════════════════════════════════════════════════════════
#
# Bu script:
#   1. Docker Compose stack'ini baslatir
#   2. PostgreSQL'in hazir olmasini bekler
#   3. Migration dosyalarini calistirir
#   4. Seed data yukler
#   5. Health check yapar
#
# Kullanim:
#   chmod +x setup.sh
#   ./setup.sh
# ═══════════════════════════════════════════════════════════════

set -e  # Herhangi bir komut basarisiz olursa scripti durdur

# Renkli cikti
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────
# Konfigurasyon
# ─────────────────────────────────────────────────────────────
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
MIGRATIONS_DIR="migrations"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="supabase_admin"
DB_NAME="postgres"
STUDIO_URL="http://localhost:54323"
API_URL="http://localhost:54321"

# ─────────────────────────────────────────────────────────────
# Yardimci Fonksiyonlar
# ─────────────────────────────────────────────────────────────
print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ─────────────────────────────────────────────────────────────
# Ön Kontroller
# ─────────────────────────────────────────────────────────────
print_header "KaptanlikApp - Supabase Backend Kurulumu"

# Docker kontrol
if ! command -v docker &> /dev/null; then
    print_error "Docker bulunamadi! Lutfen Docker'i yukleyin: https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker yuklu"

# Docker Compose kontrol
if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
    print_error "Docker Compose bulunamadi!"
    exit 1
fi
print_success "Docker Compose yuklu"

# .env dosyasi kontrol
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env dosyasi bulunamadi. .env.example'dan kopyalaniyor..."
        cp .env.example .env
        print_success ".env dosyasi olusturuldu. Lutfen degerleri kontrol edin."
    else
        print_error ".env.example dosyasi da bulunamadi!"
        exit 1
    fi
fi

# Docker daemon kontrol
if ! docker info &> /dev/null; then
    print_error "Docker calismiyor! Lutfen Docker'i baslatin."
    exit 1
fi
print_success "Docker calisiyor"

# ─────────────────────────────────────────────────────────────
# 1. Docker Compose Stack'ini Baslat
# ─────────────────────────────────────────────────────────────
print_header "1/5 - Docker Stack'i baslatiliyor..."

# Önceki container'lari temizle (isteğe bağlı)
if [ "${FORCE_RECREATE:-false}" = "true" ]; then
    print_warning "FORCE_RECREATE=true, container'lar yeniden olusturuluyor..."
    docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
fi

# Stack'i baslat
docker compose -f "$COMPOSE_FILE" up -d

print_success "Docker stack baslatildi"

# ─────────────────────────────────────────────────────────────
# 2. PostgreSQL'in Hazir Olmasini Bekle
# ─────────────────────────────────────────────────────────────
print_header "2/5 - PostgreSQL hazir oluyor bekleniyor..."

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
        print_success "PostgreSQL hazir!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "PostgreSQL ${MAX_RETRIES} denemede hazir olmadi!"
    print_info "Loglari kontrol edin: docker compose logs db"
    exit 1
fi

# Ek bekleme (schema initialization)
print_info "Schema initialization tamamlaniyor..."
sleep 5

# ─────────────────────────────────────────────────────────────
# 3. Migrations Calistir
# ─────────────────────────────────────────────────────────────
print_header "3/5 - Migrations calistiriliyor..."

# Container ici psql kullanarak migration calistir
docker compose -f "$COMPOSE_FILE" exec -T db psql -U "$DB_USER" -d "$DB_NAME" -q << 'SQL_COMMANDS'
-- Migration 001: Initial Schema
\echo '>> 001_initial_schema.sql calistiriliyor...'
\i /docker-entrypoint-initdb.d/001_initial_schema.sql

-- Migration 002: RLS Policies
\echo '>> 002_rls_policies.sql calistiriliyor...'
\i /docker-entrypoint-initdb.d/002_rls_policies.sql

-- Migration 003: Functions & Triggers
\echo '>> 003_functions_triggers.sql calistiriliyor...'
\i /docker-entrypoint-initdb.d/003_functions_triggers.sql

\echo '>> Tüm migrations tamamlandi!'
SQL_COMMANDS

if [ $? -eq 0 ]; then
    print_success "Migrations basariyla calistirildi"
else
    print_error "Migration calistirma basarisiz!"
    print_info "Loglari kontrol edin: docker compose logs db"
    exit 1
fi

# ─────────────────────────────────────────────────────────────
# 4. Seed Data Yukle
# ─────────────────────────────────────────────────────────────
print_header "4/5 - Seed data yukleniyor..."

docker compose -f "$COMPOSE_FILE" exec -T db psql -U "$DB_USER" -d "$DB_NAME" -q << 'SEED_COMMANDS'
\echo '>> 004_seed_data.sql calistiriliyor...'
\i /docker-entrypoint-initdb.d/004_seed_data.sql
\echo '>> Seed data yuklendi!'
SEED_COMMANDS

if [ $? -eq 0 ]; then
    print_success "Seed data basariyla yuklendi"
else
    print_warning "Seed data yuklenirken uyari olabilir (cakisma durumlari). Devam ediliyor..."
fi

# ─────────────────────────────────────────────────────────────
# 5. Health Check & Özet
# ─────────────────────────────────────────────────────────────
print_header "5/5 - Health Check..."

# Container durumlarini kontrol et
print_info "Servis durumlari kontrol ediliyor..."
docker compose -f "$COMPOSE_FILE" ps

echo ""
print_success "╔═══════════════════════════════════════════════════════════════╗"
print_success "║                                                               ║"
print_success "║   KaptanlikApp Supabase Backend hazir!                        ║"
print_success "║                                                               ║"
print_success "╠═══════════════════════════════════════════════════════════════╣"
print_success "║                                                               ║"
print_success "║   Supabase Studio:    http://localhost:54323                  ║"
print_success "║   REST API:           http://localhost:54321                  ║"
print_success "║   Auth (GoTrue):      http://localhost:54322                  ║"
print_success "║   Realtime (WS):      ws://localhost:54329                    ║"
print_success "║   PostgreSQL:         localhost:5432                          ║"
print_success "║                                                               ║"
print_success "╠═══════════════════════════════════════════════════════════════╣"
print_success "║                                                               ║"
print_success "║   Varsayilan hesaplar:                                        ║"
print_success "║                                                               ║"
print_success "║   Admin: admin@kaptanlik.app                                  ║"
print_success "║   (Sifre: Supabase Studio'dan tanimlayin)                     ║"
print_success "║                                                               ║"
print_success "╠═══════════════════════════════════════════════════════════════╣"
print_success "║                                                               ║"
print_success "║   CLI Komutlari:                                              ║"
print_success "║                                                               ║"
print_success "║   Loglari goster:   docker compose logs -f                    ║"
print_success "║   Stack durdur:     docker compose down                       ║"
print_success "║   Stack temizle:    docker compose down -v                    ║"
print_success "║                                                               ║"
print_success "╚═══════════════════════════════════════════════════════════════╝"

# Veritabani tablo kontrolü
print_info "Tablo kontrolu yapiliyor..."
docker compose -f "$COMPOSE_FILE" exec -T db psql -U "$DB_USER" -d "$DB_NAME" -tc "
SELECT 'profiles' as tablo, COUNT(*) as kayit FROM public.profiles
UNION ALL
SELECT 'packages', COUNT(*) FROM public.packages
UNION ALL
SELECT 'questions', COUNT(*) FROM public.questions
UNION ALL
SELECT 'badges', COUNT(*) FROM public.badges
UNION ALL
SELECT 'user_badges', COUNT(*) FROM public.user_badges;
" 2>/dev/null || print_warning "Tablo kontrolu yapilamadi (henuz hazir olmayabilir)"

print_info ""
print_info "Kurulum tamamlandi! KaptanlikApp'i kullanmaya baslayabilirsiniz."
print_info ""
