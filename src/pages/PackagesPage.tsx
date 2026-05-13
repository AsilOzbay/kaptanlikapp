import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Anchor, Lock, ChevronRight, CheckCircle } from 'lucide-react';

interface Soru {
  soru_no: number;
  konu: string;
}

interface Paket {
  id: string;
  baslik: string;
  toplam_soru: number;
  konular: string[];
}

interface ProgressData {
  answers: Record<number, { answer: string; correct: boolean; attempts: number }>;
}

const konuIcons: Record<string, string> = {
  'Y\u00fckleme Markalar\u0131': '\u2693',
  'Gemi Boyutlar\u0131 ve K\u0131saltmalar': '\ud83d\udcf1',
  'Deplasman': '\u2696\ufe0f',
  'Draft ve Fribord': '\ud83d\udcca',
  'Deplasman Problemleri': '\ud83d�',
  'A\u011f\u0131rl\u0131k ve Hacim Birimleri': '\u2697\ufe0f',
  'Y\u00fczme Ko\u015fulu': '\ud83c\udf0a',
};

function getProgress(): ProgressData {
  try {
    const raw = localStorage.getItem('kaptanlik_progress');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { answers: {} };
}

function countSolvedByTopic(sorular: Soru[], progress: ProgressData): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of sorular) {
    if (progress.answers[s.soru_no]) {
      counts[s.konu] = (counts[s.konu] || 0) + 1;
    }
  }
  return counts;
}

export default function PackagesPage() {
  const [, navigate] = useLocation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sorular, setSorular] = useState<Soru[]>([]);
  const [paket, setPaket] = useState<Paket | null>(null);
  const [progress, setProgress] = useState<ProgressData>({ answers: {} });

  useEffect(() => {
    fetch('/questions/questions_1_50.json')
      .then((r) => r.json())
      .then((data) => {
        setPaket(data.paket);
        setSorular(data.sorular.map((s: { soru_no: number; konu: string }) => ({
          soru_no: s.soru_no,
          konu: s.konu,
        })));
        setProgress(getProgress());
      })
      .catch(() => {});

    const stored = localStorage.getItem('kaptanlik_subscribed');
    if (stored === 'true') setIsSubscribed(true);
  }, []);

  const solvedCount = useMemo(() => Object.keys(progress.answers).length, [progress]);
  const totalCount = paket?.toplam_soru || 50;
  const solvedByTopic = useMemo(() => countSolvedByTopic(sorular, progress), [sorular, progress]);
  const isUnlocked = isSubscribed || solvedCount < 10;
  const remainingFree = Math.max(0, 10 - solvedCount);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem('kaptanlik_subscribed', 'true');
  };

  const handlePackageClick = () => {
    if (!isSubscribed && solvedCount >= 10) return;
    navigate(`/packages/${paket?.id || 'stab_2024_02'}`);
  };

  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-[100dvh] bg-navy-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 px-4 py-3">
        <h1 className="text-lg font-bold text-white text-center">Paketler</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Package Card */}
        <button
          onClick={handlePackageClick}
          disabled={!isUnlocked}
          className={`w-full text-left relative rounded-2xl border p-4 transition-all duration-200 ${
            isUnlocked
              ? 'bg-navy-800 border-navy-700 hover:border-gold-500/40 hover:-translate-y-0.5 shadow-card'
              : 'bg-navy-800/50 border-navy-700/50 opacity-70'
          }`}
        >
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-900/50 rounded-2xl z-10">
              <div className="flex items-center gap-2 bg-navy-800 border border-navy-700 rounded-full px-4 py-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-400">Kilitli</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Anchor className="w-6 h-6 text-gold-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white truncate">
                  {paket?.baslik || 'Şubat 2024 Stabilite'}
                </h2>
                {isUnlocked ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalCount} soru - {solvedCount} çözüldü
              </p>

              {/* Progress bar */}
              <div className="mt-2 h-1 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Topic badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(paket?.konular || []).slice(0, 4).map((k) => (
                  <span
                    key={k}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-gold-500/30 text-gold-400"
                  >
                    {k}
                  </span>
                ))}
                {(paket?.konular || []).length > 4 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-gray-400">
                    +{(paket?.konular || []).length - 4}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
          </div>
        </button>

        {/* Free question counter */}
        {!isSubscribed && (
          <div className="rounded-xl bg-navy-800 border border-gold-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Ücretsiz Soru Hakkı</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {remainingFree > 0
                    ? `${remainingFree} ücretsiz soru kaldı`
                    : 'Günlük limit doldu, abone olun'}
                </p>
              </div>
              <span className="text-lg font-bold text-gold-500">
                {Math.min(solvedCount, 10)}/10
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(solvedCount, 10) * 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        {!isSubscribed && (
          <div className="rounded-xl bg-navy-800 border border-gold-500 p-4 animate-pulse-glow">
            <p className="text-sm font-semibold text-white text-center">
              Tüm paketlere erişim için abone olun
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              50 sorunun tamamını çözün, tüm konulara erişin
            </p>
            <button
              onClick={handleSubscribe}
              className="mt-3 w-full h-12 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Abone Ol
            </button>
          </div>
        )}

        {/* Topics breakdown */}
        <div className="rounded-2xl bg-navy-800 border border-navy-700/50 p-4">
          <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
            Konular
          </h3>
          <div className="space-y-2.5">
            {(paket?.konular || []).map((konu) => {
              const solved = solvedByTopic[konu] || 0;
              const total = sorular.filter((s) => s.konu === konu).length;
              return (
                <div key={konu} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-sm">
                    {konuIcons[konu] || '\ud83d\udcda'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 truncate">{konu}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 rounded-full transition-all"
                          style={{ width: total > 0 ? `${(solved / total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {solved}/{total}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
