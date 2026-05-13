-- ============================================================
-- KaptanlikApp - Row Level Security (RLS) Policies
-- ============================================================
--
-- RLS tüm tablolarda etkinleştirilir ve aşağıdaki kurallar uygulanır:
--
--   * profiles    : Kullanıcı kendi profilini görür/günceller, admin hepsini
--   * packages    : Herkes görür (public), admin CRUD
--   * questions   : Herkes görür (public), admin CRUD
--   * user_progress: Kullanıcı kendi ilerlemesini görür/günceller
--   * subscriptions: Kullanıcı kendi aboneliklerini görür
--   * user_stats  : Kullanıcı kendi istatistiklerini görür
--   * badges      : Herkes görür (public)
--   * user_badges : Kullanıcı kendi rozetlerini görür
--   * simulations : Kullanıcı kendi simülasyonlarını görür
--   * notifications: Kullanıcı kendi bildirimlerini görür/günceller
--
-- Roller:
--   * anon         : Giriş yapmamış kullanıcı
--   * authenticated: Giriş yapmış kullanıcı
--   * admin        : Yönetici (profiles.role = 'admin')
--   * service_role : Sunucu-tarafı tam erişim
--
-- ============================================================

-- ============================================================
-- Yardımcı Fonksiyon: Kullanıcının admin olup olmadığını kontrol et
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_uuid;
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Yardımcı Fonksiyon: auth.uid() UUID döndürür
-- ============================================================
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', ''),
        auth.uid()::text
    )::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═════════════════════════════════════════════════════════════
-- 1. PROFILES - RLS
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tüm mevcut politikaları temizle
DO $$ BEGIN
    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi profilini veya admin tümünü görsün
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Sadece trigger/service_role ekleyebilir
CREATE POLICY "profiles_insert_self"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid() OR public.is_admin(auth.uid()));

-- Update: Kullanıcı kendi profilini veya admin tümünü güncellesin
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- Delete: Sadece admin silebilir
CREATE POLICY "profiles_delete_admin"
    ON public.profiles FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 2. PACKAGES - RLS (Public read, Admin write)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "packages_select_public" ON public.packages;
    DROP POLICY IF EXISTS "packages_insert_admin" ON public.packages;
    DROP POLICY IF EXISTS "packages_update_admin" ON public.packages;
    DROP POLICY IF EXISTS "packages_delete_admin" ON public.packages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Herkes aktif paketleri görebilir
CREATE POLICY "packages_select_public"
    ON public.packages FOR SELECT
    USING (is_active = true OR public.is_admin(auth.uid()));

-- Insert: Sadece admin
CREATE POLICY "packages_insert_admin"
    ON public.packages FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Update: Sadece admin
CREATE POLICY "packages_update_admin"
    ON public.packages FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "packages_delete_admin"
    ON public.packages FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 3. QUESTIONS - RLS (Public read, Admin write)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "questions_select_public" ON public.questions;
    DROP POLICY IF EXISTS "questions_insert_admin" ON public.questions;
    DROP POLICY IF EXISTS "questions_update_admin" ON public.questions;
    DROP POLICY IF EXISTS "questions_delete_admin" ON public.questions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Herkes görebilir
CREATE POLICY "questions_select_public"
    ON public.questions FOR SELECT
    USING (true);

-- Insert: Sadece admin
CREATE POLICY "questions_insert_admin"
    ON public.questions FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Update: Sadece admin
CREATE POLICY "questions_update_admin"
    ON public.questions FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "questions_delete_admin"
    ON public.questions FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 4. USER_PROGRESS - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
    DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
    DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
    DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;
    DROP POLICY IF EXISTS "user_progress_admin_all" ON public.user_progress;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi ilerlemesini veya admin hepsini
CREATE POLICY "user_progress_select_own"
    ON public.user_progress FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Kullanıcı kendi ilerlemesini veya admin
CREATE POLICY "user_progress_insert_own"
    ON public.user_progress FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Update: Kullanıcı kendi ilerlemesini veya admin
CREATE POLICY "user_progress_update_own"
    ON public.user_progress FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Delete: Kullanıcı kendi ilerlemesini veya admin
CREATE POLICY "user_progress_delete_own"
    ON public.user_progress FOR DELETE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 5. SUBSCRIPTIONS - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
    DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
    DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
    DROP POLICY IF EXISTS "subscriptions_delete_admin" ON public.subscriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi aboneliklerini veya admin
CREATE POLICY "subscriptions_select_own"
    ON public.subscriptions FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Kullanıcı kendi veya admin
CREATE POLICY "subscriptions_insert_own"
    ON public.subscriptions FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Update: Kullanıcı kendi veya admin
CREATE POLICY "subscriptions_update_own"
    ON public.subscriptions FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "subscriptions_delete_admin"
    ON public.subscriptions FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 6. USER_STATS - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "user_stats_select_own" ON public.user_stats;
    DROP POLICY IF EXISTS "user_stats_insert_own" ON public.user_stats;
    DROP POLICY IF EXISTS "user_stats_update_own" ON public.user_stats;
    DROP POLICY IF EXISTS "user_stats_delete_admin" ON public.user_stats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi istatistiklerini veya admin
CREATE POLICY "user_stats_select_own"
    ON public.user_stats FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Sadece service_role/trigger (kullanıcı direkt ekleyemez)
CREATE POLICY "user_stats_insert_trigger"
    ON public.user_stats FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Update: Sadece service_role/trigger (kullanıcı direkt güncelleyemez)
CREATE POLICY "user_stats_update_trigger"
    ON public.user_stats FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "user_stats_delete_admin"
    ON public.user_stats FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 7. BADGES - RLS (Public read, Admin write)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "badges_select_public" ON public.badges;
    DROP POLICY IF EXISTS "badges_insert_admin" ON public.badges;
    DROP POLICY IF EXISTS "badges_update_admin" ON public.badges;
    DROP POLICY IF EXISTS "badges_delete_admin" ON public.badges;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Herkes görebilir
CREATE POLICY "badges_select_public"
    ON public.badges FOR SELECT
    USING (true);

-- Insert: Sadece admin
CREATE POLICY "badges_insert_admin"
    ON public.badges FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Update: Sadece admin
CREATE POLICY "badges_update_admin"
    ON public.badges FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "badges_delete_admin"
    ON public.badges FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 8. USER_BADGES - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
    DROP POLICY IF EXISTS "user_badges_insert_trigger" ON public.user_badges;
    DROP POLICY IF EXISTS "user_badges_delete_admin" ON public.user_badges;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi rozetlerini veya admin
CREATE POLICY "user_badges_select_own"
    ON public.user_badges FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Sadece trigger/admin (kullanıcı direkt ekleyemez)
CREATE POLICY "user_badges_insert_trigger"
    ON public.user_badges FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Delete: Sadece admin
CREATE POLICY "user_badges_delete_admin"
    ON public.user_badges FOR DELETE
    USING (public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 9. SIMULATIONS - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "simulations_select_own" ON public.simulations;
    DROP POLICY IF EXISTS "simulations_insert_own" ON public.simulations;
    DROP POLICY IF EXISTS "simulations_delete_own" ON public.simulations;
    DROP POLICY IF EXISTS "simulations_delete_admin" ON public.simulations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi simülasyonlarını veya admin
CREATE POLICY "simulations_select_own"
    ON public.simulations FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Kullanıcı kendi simülasyonlarını veya admin
CREATE POLICY "simulations_insert_own"
    ON public.simulations FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Delete: Kullanıcı kendi veya admin
CREATE POLICY "simulations_delete_own"
    ON public.simulations FOR DELETE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 10. NOTIFICATIONS - RLS (Kullanıcı kendi)
-- ═════════════════════════════════════════════════════════════
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
    DROP POLICY IF EXISTS "notifications_insert_trigger" ON public.notifications;
    DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
    DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Select: Kullanıcı kendi bildirimlerini veya admin
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Insert: Sadece trigger/admin
CREATE POLICY "notifications_insert_trigger"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Update: Kullanıcı kendi bildirimlerini (okundu işaretleme) veya admin
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Delete: Kullanıcı kendi veya admin
CREATE POLICY "notifications_delete_own"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
