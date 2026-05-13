import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft, BookOpen, Shuffle, AlertTriangle, Bookmark,
  Anchor, ChevronRight,
} from 'lucide-react';

interface Soru {
  soru_no: number;
  konu: string;
  zorluk: string;
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
  'Deplasman Problemleri': '\ud83d\udd27',
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

function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem('kaptanlik_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getWrong(): number[] {
  try {
    const raw = localStorage.getItem('kaptanlik_wrong');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function countByTopic(sorular: Soru[], progress: ProgressData, konu: string): { solved: number; total: number; correct: number; wrong: number } {
  const topicSorular = sorular.filter((s) => s.konu === konu);
  const total = topicSorular.length;
  let solved = 0;
  let correct = 0;
  let wrong = 0;
  for (const s of topicSorular) {
    const ans = progress.answers[s.soru_no];
    if (ans) {
      solved++;
      if (ans.correct) correct++;
      else wrong++;
    }
  }
  return { solved, total, correct, wrong };
}

export default function PackageDetailPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [sorular, setSorular] = useState<Soru[]>([]);
  const [paket, setPaket] = useState<Paket | null>(null);
  const [progress, setProgress] = useState<ProgressData>({ answers: {} });
  const [favorites, setFavorites] = useState<number[]>([]);
  const [wrongIds, setWrongIds] = useState<number[]>([]);

  useEffect(() => {
    fetch('/questions/questions_1_50.json')
      .then((r) => r.json())
      .then((data) => {
        setPaket(data.paket);
        setSorular(data.sorular.map((s: { soru_no: number; konu: string; zorluk: string }) => ({
          soru_no: s.soru_no,
          konu: s.konu,
          zorluk: s.zorluk,
        })));
        setProgress(getProgress());
        setFavorites(getFavorites());
        setWrongIds(getWrong());
      })
      .catch(() => {});
  }, []);

  const solvedCount = useMemo(() => Object.keys(progress.answers).length, [progress]);
  const totalCount = paket?.toplam_soru || 50;
  const favCount = favorites.length;
  const wrongCount = wrongIds.length;
  const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const correctCount = useMemo(() => {
    let count = 0;
    for (const [_, val] of Object.entries(progress.answers)) {
      if ((val as { correct: boolean }).correct) count++;
    }
    return count;
  }, [progress]);

  const topicStats = useMemo(() => {
    if (!paket) return [];
    return paket.konular.map((konu) => {
      const stats = countByTopic(sorular, progress, konu);
      return { konu, ...stats };
    });
  }, [paket, sorular, progress]);

  const pkgId = params.id || paket?.id || 'stab_2024_02';

  return (
    <div className="min-h-[100dvh] bg-navy-900 pb-8">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 px-3 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/packages')}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-navy-800 transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white flex-1 truncate">
          {paket?.baslik || 'Şubat 2024 Stabilite'}
        </h1>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Summary Card */}
        <div className="rounded-2xl bg-navy-800 border border-navy-700/50 p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Anchor className="w-7 h-7 text-gold-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{paket?.baslik || 'Şubat 2024 Stabilite'}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{totalCount} soru · {paket?.konular.length || 0} konu</p>
            </div>
          </div>

          {/* Circular progress */}
          <div className="flex items-center justify-center mt-4 mb-2">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1B2E6B" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#D4A017" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - solvedPercent / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{solvedPercent}%</span>
                <span className="text-[10px] text-gray-400">{solvedCount}/{totalCount}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-2.5 rounded-xl bg-navy-900/60">
              <p className="text-lg font-bold text-green-400">{correctCount}</p>
              <p className="text-[11px] text-gray-400">Doğru</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-navy-900/60">
              <p className="text-lg font-bold text-red-400">{wrongCount}</p>
              <p className="text-[11px] text-gray-400">Yanlış</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-navy-900/60">
              <p className="text-lg font-bold text-gold-400">{favCount}</p>
              <p className="text-[11px] text-gray-400">Favori</p>
            </div>
          </div>
        </div>

        {/* Study Modes */}
        <div>
          <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3 px-1">
            Çalışma Modları
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Normal Quiz */}
            <button
              onClick={() => navigate(`/packages/${pkgId}/quiz`)}
              className="rounded-xl bg-navy-800 border border-navy-700/50 p-4 text-left hover:border-gold-500/40 transition-all active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-sm font-semibold text-white">Konu Konu</p>
              <p className="text-xs text-gray-400 mt-0.5">{totalCount} soru</p>
            </button>

            {/* Mixed */}
            <button
              onClick={() => navigate(`/packages/${pkgId}/mixed`)}
              className="rounded-xl bg-navy-800 border border-navy-700/50 p-4 text-left hover:border-gold-500/40 transition-all active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Shuffle className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-white">Karışık</p>
              <p className="text-xs text-gray-400 mt-0.5">20 rastgele soru</p>
            </button>

            {/* Wrong */}
            <button
              onClick={() => navigate(`/packages/${pkgId}/wrong`)}
              disabled={wrongCount === 0}
              className={`rounded-xl border p-4 text-left transition-all active:scale-[0.97] ${
                wrongCount > 0
                  ? 'bg-navy-800 border-navy-700/50 hover:border-red-500/40'
                  : 'bg-navy-800/50 border-navy-700/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-white">Yanlışlar</p>
              <p className="text-xs text-gray-400 mt-0.5">{wrongCount} soru</p>
            </button>

            {/* Favorites */}
            <button
              onClick={() => navigate(`/packages/${pkgId}/fav`)}
              disabled={favCount === 0}
              className={`rounded-xl border p-4 text-left transition-all active:scale-[0.97] ${
                favCount > 0
                  ? 'bg-navy-800 border-navy-700/50 hover:border-gold-500/40'
                  : 'bg-navy-800/50 border-navy-700/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                <Bookmark className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-sm font-semibold text-white">Favoriler</p>
              <p className="text-xs text-gray-400 mt-0.5">{favCount} soru</p>
            </button>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="rounded-2xl bg-navy-800 border border-navy-700/50 p-4">
          <h3 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-3">
            Konu Bazında İlerleme
          </h3>
          <div className="space-y-3">
            {topicStats.map(({ konu, solved, total, correct, wrong }) => {
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              return (
                <div key={konu} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center text-base flex-shrink-0">
                    {konuIcons[konu] || '\ud83d\udcda'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-100 truncate">{konu}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{solved}/{total}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {correct > 0 && (
                        <span className="text-[10px] text-green-400">{correct}D</span>
                      )}
                      {wrong > 0 && (
                        <span className="text-[10px] text-red-400">{wrong}Y</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick start button */}
        <button
          onClick={() => navigate(`/packages/${pkgId}/quiz`)}
          className="w-full h-14 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold rounded-xl transition-colors shadow-glow active:scale-[0.97] flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Soru Çözmeye Başla
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
