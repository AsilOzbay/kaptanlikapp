-- ============================================================
-- KaptanlikApp - Initial Schema Migration
-- ============================================================
-- Bu migration, Kaptanlik ehliyet sınavı hazırlık uygulaması için
-- temel veritabanı şemasını oluşturur.
--
-- Tablolar:
--   1. profiles          - Kullanıcı profilleri
--   2. packages          - Sınav paketleri
--   3. questions         - Sorular
--   4. user_progress     - Kullanıcı ilerlemesi
--   5. subscriptions     - Abonelikler
--   6. user_stats        - Kullanıcı istatistikleri
--   7. badges            - Rozet tanımları
--   8. user_badges       - Kazanılan rozetler
--   9. simulations       - Sınav simülasyonları
--   10. notifications    - Bildirimler
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES - Kullanıcı Profilleri
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    display_name    TEXT,
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Kullanıcı profilleri - auth.users ile birebir ilişkili';
COMMENT ON COLUMN public.profiles.role IS 'Kullanıcı rolü: user veya admin';

-- ─────────────────────────────────────────────────────────────
-- 2. PACKAGES - Sınav Paketleri
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.packages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    description     TEXT,
    pdf_url         TEXT,
    total_questions INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.packages IS 'Sınav paketleri - her bir PDF soru seti';

-- ─────────────────────────────────────────────────────────────
-- 3. QUESTIONS - Sorular
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id      UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    topic           TEXT NOT NULL DEFAULT 'Genel',
    question_number INTEGER NOT NULL,
    question_text   TEXT NOT NULL,
    option_a        TEXT,
    option_b        TEXT,
    option_c        TEXT,
    option_d        TEXT,
    option_e        TEXT,
    correct_answer  TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D','E')),
    explanation     TEXT,
    formulas        TEXT[] DEFAULT '{}',
    image_url       TEXT,
    difficulty      TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Bir pakette aynı soru numarası tekil olsun
    CONSTRAINT unique_question_number_per_package
        UNIQUE (package_id, question_number)
);

COMMENT ON TABLE public.questions IS 'Sınav soruları - her bir sorunun detayları';
COMMENT ON COLUMN public.questions.correct_answer IS 'Doğru cevap: A, B, C, D veya E';
COMMENT ON COLUMN public.questions.difficulty IS 'Zorluk seviyesi: easy, medium, hard';

-- ─────────────────────────────────────────────────────────────
-- 4. USER_PROGRESS - Kullanıcı İlerlemesi
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    attempts        INTEGER NOT NULL DEFAULT 0,
    correct_count   INTEGER NOT NULL DEFAULT 0,
    wrong_count     INTEGER NOT NULL DEFAULT 0,
    is_favorite     BOOLEAN NOT NULL DEFAULT false,
    is_wrong        BOOLEAN NOT NULL DEFAULT false,
    last_answer     TEXT CHECK (last_answer IS NULL OR last_answer IN ('A','B','C','D','E')),
    last_attempt_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Bir kullanıcı bir soruyu bir kez ilerlesin
    CONSTRAINT unique_user_question_progress
        UNIQUE (user_id, question_id)
);

COMMENT ON TABLE public.user_progress IS 'Kullanıcı soru çözüm ilerlemesi';

-- ─────────────────────────────────────────────────────────────
-- 5. SUBSCRIPTIONS - Abonelikler
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id      UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','pending')),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Bir kullanıcının bir pakete bir aktif aboneliği olsun
    CONSTRAINT unique_user_active_package
        UNIQUE (user_id, package_id)
);

COMMENT ON TABLE public.subscriptions IS 'Kullanıcı paket abonelikleri';

-- ─────────────────────────────────────────────────────────────
-- 6. USER_STATS - Kullanıcı İstatistikleri
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_stats (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id      UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    total_solved    INTEGER NOT NULL DEFAULT 0,
    total_correct   INTEGER NOT NULL DEFAULT 0,
    total_wrong     INTEGER NOT NULL DEFAULT 0,
    last_activity   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Bir kullanıcının bir pakette bir istatistiği olsun
    CONSTRAINT unique_user_package_stats
        UNIQUE (user_id, package_id)
);

COMMENT ON TABLE public.user_stats IS 'Kullanıcı paket bazında istatistikleri';

-- ─────────────────────────────────────────────────────────────
-- 7. BADGES - Rozet Tanımları
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    description     TEXT NOT NULL,
    icon            TEXT NOT NULL DEFAULT 'trophy',
    condition_type  TEXT NOT NULL CHECK (condition_type IN (
        'total_solved',          -- Toplam çözülen soru sayısı
        'streak_days',           -- Ardışık gün sayısı
        'correct_streak',        -- Ardışık doğru cevap sayısı
        'package_complete',      -- Paket tamamlama yüzdesi
        'simulation_pass',       -- Simülasyon geçme sayısı
        'perfect_simulation',    -- Mükemmel simülasyon
        'first_login',           -- İlk giriş
        'all_packages',          -- Tüm paketlerden çözüm
        'favorite_count',        -- Favori soru sayısı
        'night_owl',             -- Gece çözümü
        'early_bird',            -- Sabah çözümü
        'speed_demon'            -- Hızlı çözüm
    )),
    condition_value INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.badges IS 'Kazanılabilir rozet tanımları';

-- ─────────────────────────────────────────────────────────────
-- 8. USER_BADGES - Kazanılan Rozetler
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id        UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Bir kullanıcı bir rozeti bir kez kazansın
    CONSTRAINT unique_user_badge
        UNIQUE (user_id, badge_id)
);

COMMENT ON TABLE public.user_badges IS 'Kullanıcıların kazandığı rozetler';

-- ─────────────────────────────────────────────────────────────
-- 9. SIMULATIONS - Sınav Simülasyonları
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.simulations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id      UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    question_count  INTEGER NOT NULL DEFAULT 30,
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    correct_count   INTEGER NOT NULL DEFAULT 0,
    wrong_count     INTEGER NOT NULL DEFAULT 0,
    empty_count     INTEGER NOT NULL DEFAULT 0,
    percentage      NUMERIC(5,2) NOT NULL DEFAULT 0,
    passed          BOOLEAN NOT NULL DEFAULT false,
    answers         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.simulations IS 'Kullanıcı sınav simülasyon kayıtları';
COMMENT ON COLUMN public.simulations.answers IS '{"question_id": "A", ...} formatında cevaplar';

-- ─────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS - Bildirimler
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'general' CHECK (type IN (
        'general',        -- Genel bildirim
        'badge_earned',   -- Rozet kazanımı
        'subscription',   -- Abonelik bildirimi
        'reminder',       -- Hatırlatma
        'new_questions',  -- Yeni sorular
        'achievement',    -- Başarım
        'system'          -- Sistem bildirimi
    )),
    is_read         BOOLEAN NOT NULL DEFAULT false,
    data            JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Kullanıcı bildirimleri';

-- ============================================================
-- INDEXES - Performans İndeksleri
-- ============================================================

-- questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_package_id 
    ON public.questions(package_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_number 
    ON public.questions(question_number);
CREATE INDEX IF NOT EXISTS idx_questions_topic 
    ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
    ON public.questions(difficulty);

-- user_progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
    ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_question_id 
    ON public.user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_is_favorite 
    ON public.user_progress(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_progress_is_wrong 
    ON public.user_progress(user_id, is_wrong) WHERE is_wrong = true;

-- subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id 
    ON public.subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
    ON public.subscriptions(status);

-- user_stats indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id 
    ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_package_id 
    ON public.user_stats(package_id);

-- user_badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
    ON public.user_badges(user_id);

-- simulations indexes
CREATE INDEX IF NOT EXISTS idx_simulations_user_id 
    ON public.simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_package_id 
    ON public.simulations(package_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at 
    ON public.simulations(created_at DESC);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
    ON public.notifications(user_id, is_read) WHERE is_read = false;

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role 
    ON public.profiles(role);

-- ============================================================
-- UPDATED_AT otomatik güncelleme trigger'ı
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- user_progress updated_at
DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER trg_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- subscriptions updated_at
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- user_stats updated_at
DROP TRIGGER IF EXISTS trg_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER trg_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
