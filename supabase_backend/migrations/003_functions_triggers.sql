-- ============================================================
-- KaptanlikApp - Functions & Triggers
-- ============================================================
--
-- 1. handle_new_user()       - Auth kayıt sonrası otomatik profil oluşturma
-- 2. update_user_stats()     - Soru çözüldükçe istatistik güncelleme
-- 3. check_and_award_badges()- Rozet kazanım kontrolü
-- 4. create_notification()   - Bildirim oluşturma
-- 5. on_answer_submit()      - Cevap gönderildiğinde çalışan ana trigger
-- ============================================================

-- ============================================================
-- 1. HANDLE_NEW_USER() - Yeni kullanıcı kaydı sonrası profil oluşturma
-- ============================================================
-- Auth.users tablosuna yeni kayıt eklendiğinde otomatik olarak
-- profiles tablosunda ilgili kaydı oluşturur.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'user';
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', default_role),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auth users tablosuna ekleme sonrası çalışır
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. UPDATE_USER_STATS() - Soru çözüldükçe istatistik güncelleme
-- ============================================================
-- user_progress tablosuna yeni cevap eklendiğinde/güncellendiğinde
-- ilgili user_stats kaydını günceller.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_user_stats(
    p_user_id UUID,
    p_package_id UUID,
    p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_stats (
        user_id,
        package_id,
        total_solved,
        total_correct,
        total_wrong,
        last_activity,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_package_id,
        1,
        CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        CASE WHEN p_is_correct THEN 0 ELSE 1 END,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, package_id)
    DO UPDATE SET
        total_solved = public.user_stats.total_solved + 1,
        total_correct = public.user_stats.total_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        total_wrong = public.user_stats.total_wrong + CASE WHEN p_is_correct THEN 0 ELSE 1 END,
        last_activity = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 3. CHECK_AND_AWARD_BADGES() - Rozet kazanım kontrolü
-- ============================================================
-- Kullanıcının mevcut durumuna göre rozet kazanımını kontrol eder
-- ve yeni rozetleri user_badges tablosuna ekler.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE (
    badge_id UUID,
    badge_name TEXT,
    newly_earned BOOLEAN
) AS $$
DECLARE
    badge_rec RECORD;
    user_stat_rec RECORD;
    progress_rec RECORD;
    simulation_rec RECORD;
    condition_met BOOLEAN;
BEGIN
    -- Kullanıcı istatistiklerini al
    SELECT * INTO user_stat_rec
    FROM public.user_stats
    WHERE user_id = p_user_id
    ORDER BY total_solved DESC
    LIMIT 1;

    -- Tüm rozetleri kontrol et
    FOR badge_rec IN
        SELECT * FROM public.badges
        ORDER BY condition_value ASC
    LOOP
        condition_met := false;
        newly_earned := false;

        CASE badge_rec.condition_type

            -- Toplam çözülen soru sayısı
            WHEN 'total_solved' THEN
                SELECT (COALESCE(SUM(total_solved), 0) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.user_stats
                WHERE user_id = p_user_id;

            -- Ardışık doğru cevap sayısı
            WHEN 'correct_streak' THEN
                -- En son 20 cevaptaki ardışık doğru streak hesapla
                WITH streaks AS (
                    SELECT last_answer, correct_answer,
                           CASE WHEN last_answer = correct_answer THEN 1 ELSE 0 END as is_correct
                    FROM public.user_progress up
                    JOIN public.questions q ON up.question_id = q.id
                    WHERE up.user_id = p_user_id
                    ORDER BY up.last_attempt_at DESC NULLS LAST
                    LIMIT 100
                ),
                numbered AS (
                    SELECT is_correct,
                           ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) as rn,
                           SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) OVER (ORDER BY (SELECT NULL)) as grp
                    FROM streaks
                )
                SELECT COALESCE(MAX(cnt), 0) >= badge_rec.condition_value
                INTO condition_met
                FROM (
                    SELECT COUNT(*) as cnt
                    FROM numbered
                    WHERE is_correct = 1
                    GROUP BY grp
                    ORDER BY cnt DESC
                    LIMIT 1
                ) t;

            -- Simülasyon geçme sayısı
            WHEN 'simulation_pass' THEN
                SELECT (COUNT(*) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.simulations
                WHERE user_id = p_user_id AND passed = true;

            -- İlk giriş rozeti
            WHEN 'first_login' THEN
                SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id)
                INTO condition_met;

            -- Paket tamamlama yüzdesi
            WHEN 'package_complete' THEN
                SELECT EXISTS(
                    SELECT 1 FROM public.user_stats us
                    JOIN public.packages p ON us.package_id = p.id
                    WHERE us.user_id = p_user_id
                      AND p.total_questions > 0
                      AND (us.total_solved::NUMERIC / p.total_questions * 100) >= badge_rec.condition_value
                )
                INTO condition_met;

            -- Favori soru sayısı
            WHEN 'favorite_count' THEN
                SELECT (COUNT(*) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.user_progress
                WHERE user_id = p_user_id AND is_favorite = true;

            -- Gece çözümü (22:00 - 06:00)
            WHEN 'night_owl' THEN
                SELECT (COUNT(*) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.user_progress
                WHERE user_id = p_user_id
                  AND EXTRACT(HOUR FROM last_attempt_at) >= 22
                   OR EXTRACT(HOUR FROM last_attempt_at) < 6;

            -- Sabah çözümü (06:00 - 09:00)
            WHEN 'early_bird' THEN
                SELECT (COUNT(*) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.user_progress
                WHERE user_id = p_user_id
                  AND EXTRACT(HOUR FROM last_attempt_at) >= 6
                  AND EXTRACT(HOUR FROM last_attempt_at) < 9;

            -- Mükemmel simülasyon (100%)
            WHEN 'perfect_simulation' THEN
                SELECT EXISTS(
                    SELECT 1 FROM public.simulations
                    WHERE user_id = p_user_id AND percentage = 100
                )
                INTO condition_met;

            -- Hızlı çözüm (30 dakikadan az süren simülasyon)
            WHEN 'speed_demon' THEN
                SELECT (COUNT(*) >= badge_rec.condition_value)
                INTO condition_met
                FROM public.simulations
                WHERE user_id = p_user_id
                  AND EXTRACT(EPOCH FROM (created_at - created_at))/60 < 30;

            -- Tüm paketlerden çözüm
            WHEN 'all_packages' THEN
                SELECT (
                    COUNT(DISTINCT package_id) >= badge_rec.condition_value
                )
                INTO condition_met
                FROM public.user_stats
                WHERE user_id = p_user_id;

            ELSE
                condition_met := false;
        END CASE;

        -- Rozet kazanıldı mı ve daha önce eklenmemiş mi kontrol et
        IF condition_met AND NOT EXISTS(
            SELECT 1 FROM public.user_badges
            WHERE user_id = p_user_id AND badge_id = badge_rec.id
        ) THEN
            INSERT INTO public.user_badges (user_id, badge_id, earned_at)
            VALUES (p_user_id, badge_rec.id, NOW());

            -- Bildirim oluştur
            PERFORM public.create_notification(
                p_user_id,
                'Yeni Rozet Kazandın!',
                badge_rec.name || ' rozeti kazandın: ' || badge_rec.description,
                'badge_earned',
                jsonb_build_object('badge_id', badge_rec.id, 'badge_name', badge_rec.name)
            );

            newly_earned := true;
        END IF;

        badge_id := badge_rec.id;
        badge_name := badge_rec.name;
        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 4. CREATE_NOTIFICATION() - Bildirim oluşturma
-- ============================================================
-- Belirtilen kullanıcı için yeni bildirim kaydı oluşturur.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_type TEXT DEFAULT 'general',
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, body, type, data, created_at)
    VALUES (p_user_id, p_title, p_body, p_type, p_data, NOW())
    RETURNING id INTO new_notification_id;

    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 5. ON_ANSWER_SUBMIT() - Cevap gönderildiğinde ana trigger
-- ============================================================
-- Kullanıcı bir soruya cevap verdiğinde:
-- 1. user_progress kaydını günceller
-- 2. user_stats istatistiklerini günceller
-- 3. Rozet kontrolü yapar
-- ============================================================

CREATE OR REPLACE FUNCTION public.on_answer_submit()
RETURNS TRIGGER AS $$
DECLARE
    v_package_id UUID;
    v_correct_answer TEXT;
    v_is_correct BOOLEAN;
    v_user_id UUID;
    v_question_id UUID;
    v_answer TEXT;
BEGIN
    -- Parametreleri al
    v_user_id := NEW.user_id;
    v_question_id := NEW.question_id;
    v_answer := NEW.last_answer;

    -- Sorunun doğru cevabını ve paketini al
    SELECT q.package_id, q.correct_answer
    INTO v_package_id, v_correct_answer
    FROM public.questions q
    WHERE q.id = v_question_id;

    IF v_correct_answer IS NULL THEN
        RAISE EXCEPTION 'Soru bulunamadi: %', v_question_id;
    END IF;

    -- Doğru mu kontrol et
    v_is_correct := (v_answer = v_correct_answer);

    -- user_progress güncelleme değerlerini ayarla
    NEW.attempts := COALESCE((SELECT attempts FROM public.user_progress
                              WHERE user_id = v_user_id AND question_id = v_question_id), 0) + 1;
    NEW.correct_count := CASE WHEN v_is_correct
                               THEN COALESCE((SELECT correct_count FROM public.user_progress
                                              WHERE user_id = v_user_id AND question_id = v_question_id), 0) + 1
                               ELSE COALESCE((SELECT correct_count FROM public.user_progress
                                              WHERE user_id = v_user_id AND question_id = v_question_id), 0) END;
    NEW.wrong_count := CASE WHEN NOT v_is_correct
                             THEN COALESCE((SELECT wrong_count FROM public.user_progress
                                            WHERE user_id = v_user_id AND question_id = v_question_id), 0) + 1
                             ELSE COALESCE((SELECT wrong_count FROM public.user_progress
                                            WHERE user_id = v_user_id AND question_id = v_question_id), 0) END;
    NEW.is_wrong := NOT v_is_correct;
    NEW.last_attempt_at := NOW();

    -- İstatistikleri güncelle
    PERFORM public.update_user_stats(v_user_id, v_package_id, v_is_correct);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: user_progress INSERT/UPDATE öncesinde çalışır
DROP TRIGGER IF EXISTS trg_on_answer_submit ON public.user_progress;
CREATE TRIGGER trg_on_answer_submit
    BEFORE INSERT OR UPDATE OF last_answer ON public.user_progress
    FOR EACH ROW
    WHEN (NEW.last_answer IS NOT NULL)
    EXECUTE FUNCTION public.on_answer_submit();


-- ============================================================
-- 6. CHECK_BADGES_AFTER_SIMULATION() - Simülasyon sonrası rozet kontrolü
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_badges_after_simulation()
RETURNS TRIGGER AS $$
BEGIN
    -- Rozet kontrolü yap
    PERFORM public.check_and_award_badges(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_badges_simulation ON public.simulations;
CREATE TRIGGER trg_check_badges_simulation
    AFTER INSERT ON public.simulations
    FOR EACH ROW
    EXECUTE FUNCTION public.check_badges_after_simulation();


-- ============================================================
-- 7. AUTO_CREATE_USER_STATS() - Yeni abonelikte istatistik kaydı oluşturma
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id, package_id, total_solved, total_correct, total_wrong, created_at, updated_at)
    VALUES (NEW.user_id, NEW.package_id, 0, 0, 0, NOW(), NOW())
    ON CONFLICT (user_id, package_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_create_user_stats ON public.subscriptions;
CREATE TRIGGER trg_auto_create_user_stats
    AFTER INSERT ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_user_stats();


-- ============================================================
-- 8. NOTIFY_ON_NEW_QUESTION() - Yeni soru eklendiğinde bildirim
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_on_new_question()
RETURNS TRIGGER AS $$
DECLARE
    sub_rec RECORD;
BEGIN
    -- Bu pakete abone olan tüm kullanıcılara bildirim gönder
    FOR sub_rec IN
        SELECT s.user_id
        FROM public.subscriptions s
        WHERE s.package_id = NEW.package_id
          AND s.status = 'active'
    LOOP
        PERFORM public.create_notification(
            sub_rec.user_id,
            'Yeni Soru Eklendi!',
            NEW.topic || ' konusuna yeni bir soru eklendi. Soru #' || NEW.question_number,
            'new_questions',
            jsonb_build_object(
                'question_id', NEW.id,
                'package_id', NEW.package_id,
                'topic', NEW.topic,
                'question_number', NEW.question_number
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_question ON public.questions;
CREATE TRIGGER trg_notify_new_question
    AFTER INSERT ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_new_question();


-- ============================================================
-- 9. SUBSCRIPTION_REMINDER() - Abonelik bitimine 3 gün kala hatırlatma
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS VOID AS $$
DECLARE
    sub_rec RECORD;
BEGIN
    -- 3 gün içinde bitecek abonelikleri kontrol et
    FOR sub_rec IN
        SELECT s.id, s.user_id, s.package_id, s.expires_at, p.title as package_title
        FROM public.subscriptions s
        JOIN public.packages p ON s.package_id = p.id
        WHERE s.status = 'active'
          AND s.expires_at IS NOT NULL
          AND s.expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    LOOP
        PERFORM public.create_notification(
            sub_rec.user_id,
            'Aboneliğiniz Bitiyor',
            sub_rec.package_title || ' paketinizin aboneliği ' ||
            EXTRACT(DAY FROM (sub_rec.expires_at - NOW()))::TEXT || ' gün içinde bitecek.',
            'subscription',
            jsonb_build_object(
                'subscription_id', sub_rec.id,
                'package_id', sub_rec.package_id,
                'expires_at', sub_rec.expires_at
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
