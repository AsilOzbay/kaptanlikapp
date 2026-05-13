import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  X, Bookmark, Check, ChevronRight, ChevronLeft,
  Calculator, ChevronDown, CheckCircle, XCircle,
} from 'lucide-react';

/* ─── Types ─── */
export interface Soru {
  soru_no: number;
  konu: string;
  soru_metni: string;
  secenekler: Record<string, string>;
  dogru_cevap: string;
  aciklama: string;
  formuller: Array<{ isim: string; formul: string; aciklama?: string }>;
  zorluk: string;
  gorsel?: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  attempts: number;
  answers: Record<number, { answer: string; correct: boolean; attempts: number }>;
}

/* ─── localStorage helpers ─── */
export const PROGRESS_KEY = 'kaptanlik_progress';
export const FAVORITES_KEY = 'kaptanlik_favorites';
export const WRONG_KEY = 'kaptanlik_wrong';

export function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function setStorage<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function getProgress(): Record<number, { answer: string; correct: boolean; attempts: number }> {
  return getStorage(PROGRESS_KEY, {});
}

export function saveProgress(answers: Record<number, { answer: string; correct: boolean; attempts: number }>) {
  setStorage(PROGRESS_KEY, answers);
}

export function getFavorites(): number[] {
  return getStorage(FAVORITES_KEY, []);
}

export function toggleFavoriteUtil(soruNo: number): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(soruNo);
  if (idx >= 0) {
    favs.splice(idx, 1);
    setStorage(FAVORITES_KEY, favs);
    return false;
  }
  favs.push(soruNo);
  setStorage(FAVORITES_KEY, favs);
  return true;
}

export function addWrong(soruNo: number) {
  const wrong = getStorage<number[]>(WRONG_KEY, []);
  if (!wrong.includes(soruNo)) {
    wrong.push(soruNo);
    setStorage(WRONG_KEY, wrong);
  }
}

export function removeWrong(soruNo: number) {
  const wrong = getStorage<number[]>(WRONG_KEY, []);
  const idx = wrong.indexOf(soruNo);
  if (idx >= 0) {
    wrong.splice(idx, 1);
    setStorage(WRONG_KEY, wrong);
  }
}

/* ─── MathJax-like simple renderer ─── */
export function renderMathText(text: string): string {
  return text
    .replace(/\\\n/g, '\n')
    .replace(/\$([^$]+)\$/g, '<span class="font-mono text-gold-400 bg-navy-900/60 px-1 py-0.5 rounded">$1</span>');
}

/* ─── Option Button ─── */
export interface OptionButtonProps {
  letter: string;
  text: string;
  state: 'default' | 'selected' | 'correct' | 'wrong';
  disabled: boolean;
  onClick: () => void;
  index: number;
}

export function OptionButton({ letter, text, state, disabled, onClick, index }: OptionButtonProps) {
  const baseClasses = 'w-full min-h-[56px] flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.98]';

  const stateClasses: Record<string, string> = {
    default: 'bg-navy-800 border-navy-700 hover:border-gold-500/50',
    selected: 'bg-[rgba(212,160,23,0.08)] border-gold-500',
    correct: 'bg-[rgba(16,185,129,0.08)] border-green-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    wrong: 'bg-[rgba(239,68,68,0.08)] border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-shake',
  };

  const circleClasses: Record<string, string> = {
    default: 'bg-navy-700 text-gold-500',
    selected: 'bg-gold-500 text-navy-950',
    correct: 'bg-green-500 text-white',
    wrong: 'bg-red-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses[state]}`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${circleClasses[state]}`}>
        {state === 'correct' ? <Check className="w-4 h-4" /> : state === 'wrong' ? <X className="w-4 h-4" /> : letter}
      </span>
      <span
        className="flex-1 text-[15px] leading-relaxed text-gray-100"
        dangerouslySetInnerHTML={{ __html: renderMathText(text) }}
      />
      {state === 'correct' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
      {state === 'wrong' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
    </button>
  );
}

/* ─── Question Progress Bar ─── */
export function SegmentedProgress({ current, total, answers }: { current: number; total: number; answers: Record<number, unknown> }) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex gap-[2px] h-1">
        {Array.from({ length: total }, (_, i) => {
          const qNum = i + 1;
          const isAnswered = answers[qNum] !== undefined;
          const isCurrent = qNum === current;
          return (
            <div
              key={qNum}
              className={`flex-1 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'bg-gold-500 animate-pulse-glow'
                  : isAnswered
                  ? 'bg-gold-500/70'
                  : 'bg-navy-700'
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{current}/{total}</span>
        <span className="text-xs text-gold-500">
          %{total > 0 ? Math.round((Object.keys(answers).length / total) * 100) : 0} tamamlandı
        </span>
      </div>
    </div>
  );
}

/* ─── Explanation Panel ─── */
export function ExplanationPanel({
  isCorrect,
  correctAnswer,
  explanation,
  formulas,
  onNext,
  onBookmark,
  isFav,
}: {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  formulas: Array<{ isim: string; formul: string; aciklama?: string }>;
  onNext: () => void;
  onBookmark: () => void;
  isFav: boolean;
}) {
  return (
    <div className="border-t border-navy-700/50 bg-navy-800/80 backdrop-blur-md animate-slide-up">
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-gray-600" />
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Status header */}
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-bold text-green-500">Doğru!</h3>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-500">Yanlış</h3>
            </>
          )}
        </div>

        {/* Correct answer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gold-500 uppercase tracking-wider">Doğru Cevap:</span>
          <span className="text-base font-bold text-white">{correctAnswer}</span>
        </div>

        {/* Explanation */}
        <div>
          <h4 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-1.5">Açıklama</h4>
          <p className="text-sm text-gray-100 leading-relaxed">{explanation}</p>
        </div>

        {/* Formulas */}
        {formulas.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gold-500 uppercase tracking-wider mb-2">Formüller</h4>
            <div className="space-y-2">
              {formulas.map((f, i) => (
                <div key={i} className="bg-navy-900 border border-navy-700 rounded-lg p-3">
                  <p className="text-sm font-semibold text-white">{f.isim}</p>
                  <p className="font-mono text-gold-400 text-base mt-1">{f.formul}</p>
                  {f.aciklama && (
                    <p className="text-xs text-gray-400 mt-1">{f.aciklama}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onNext}
            className="flex-1 h-12 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Sonraki Soru
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBookmark}
            className={`h-12 px-4 rounded-xl border font-semibold transition-colors flex items-center gap-2 ${
              isFav
                ? 'border-gold-500 text-gold-500 bg-[rgba(212,160,23,0.08)]'
                : 'border-navy-600 text-gray-300 hover:border-gold-500/50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFav ? 'fill-gold-500' : ''}`} />
            {isFav ? 'Favoriden Çıkar' : 'Favoriye Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Formula Bottom Sheet ─── */
export function FormulaSheet({
  open,
  onClose,
  questionFormulas,
}: {
  open: boolean;
  onClose: () => void;
  questionFormulas: Array<{ isim: string; formul: string; aciklama?: string }>;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const allFormulas = useMemo(() => {
    const base = [
      { isim: 'Deplasman', formul: 'D = L x B x d x Cb x p', aciklama: 'Geminin taşıdığı su hacmi' },
      { isim: 'Metasentrik Yükseklik', formul: 'GM = KM - KG', aciklama: 'Gemi kararlılığı' },
      { isim: 'Moment', formul: 'M = F x d', aciklama: 'Kuvvetin döndürme etkisi' },
      { isim: 'Ton Per Centimetre (TPC)', formul: 'TPC = (Awp x p) / 100', aciklama: 'Draft değişimi için gerekli kuvvet' },
      { isim: 'Fribord', formul: 'Fribord = H - d', aciklama: 'Güverte ile su çizgisi arası mesafe' },
      { isim: 'Hacim Deplasmanı', formul: 'V = W / p', aciklama: 'Ağırlık / Yoğunluk' },
      { isim: 'Özgül Ağırlık', formul: 'p = W / V', aciklama: 'Kütlenin hacme oranı' },
    ];
    if (questionFormulas.length > 0) {
      return [...questionFormulas, ...base.filter(b => !questionFormulas.some(q => q.isim === b.isim))];
    }
    return base;
  }, [questionFormulas]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[rgba(3,4,94,0.7)] backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-navy-800 backdrop-blur-xl rounded-t-2xl z-[70] animate-slide-up overflow-y-auto scrollbar-hide">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-navy-800 z-10">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        <div className="px-4 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-gold-500" />
            <h3 className="text-lg font-bold text-white">Formül Kitapçığı</h3>
          </div>

          {questionFormulas.length > 0 && (
            <div className="mb-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl">
              <p className="text-xs font-semibold text-gold-400 uppercase mb-1">Bu Soru İçin İlgili Formüller</p>
              <div className="space-y-1">
                {questionFormulas.map((f, i) => (
                  <div key={i} className="font-mono text-gold-300 text-sm">
                    {f.isim}: {f.formul}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-0">
            {allFormulas.map((f, i) => (
              <div key={i} className="border-b border-navy-700 last:border-0">
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full py-3 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{f.isim}</p>
                    <p className="font-mono text-gold-400 text-sm mt-0.5">{f.formul}</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedIdx === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedIdx === i && f.aciklama && (
                  <div className="pb-3 animate-fade-in">
                    <p className="text-xs text-gray-400">{f.aciklama}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full h-12 bg-navy-700 hover:bg-navy-600 text-gray-200 font-semibold rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Question Navigator ─── */
export function QuestionNavigator({
  total,
  current,
  answers,
  favorites,
  onSelect,
  onClose,
}: {
  total: number;
  current: number;
  answers: Record<number, unknown>;
  favorites: number[];
  onSelect: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-[rgba(3,4,94,0.8)] backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto max-h-[70vh] bg-navy-800 rounded-2xl z-[70] p-4 overflow-y-auto scrollbar-hide animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Sorulara Atla</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-700 text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: total }, (_, i) => {
            const qNum = i + 1;
            const answered = answers[qNum] !== undefined;
            const isCurrent = qNum === current;
            const isFav = favorites.includes(qNum);
            return (
              <button
                key={qNum}
                onClick={() => { onSelect(qNum); onClose(); }}
                className={`relative w-8 h-8 rounded-md text-xs font-semibold transition-all active:scale-90 ${
                  isCurrent
                    ? 'ring-2 ring-gold-500 bg-navy-800 text-gold-500'
                    : answered
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-navy-700 text-gray-400'
                }`}
              >
                {qNum}
                {isFav && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <Bookmark className="w-2.5 h-2.5 text-gold-400 fill-gold-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ─── Top Bar ─── */
export function QuizTopBar({
  title,
  onClose,
  onBookmark,
  isFav,
}: {
  title: string;
  onClose: () => void;
  onBookmark: () => void;
  isFav: boolean;
}) {
  return (
    <div className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 px-3 py-3 flex items-center justify-between">
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-navy-800 transition-colors active:scale-90"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 text-center px-2 min-w-0">
        <h2 className="text-sm font-semibold text-gray-100 truncate">{title}</h2>
      </div>

      <button
        onClick={onBookmark}
        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-navy-800 transition-colors active:scale-90"
      >
        <Bookmark className={`w-5 h-5 ${isFav ? 'text-gold-500 fill-gold-500' : 'text-gray-400'}`} />
      </button>
    </div>
  );
}

/* ─── Bottom Nav ─── */
export function QuizBottomNav({
  current,
  total,
  canGoNext,
  canGoPrev,
  onPrev,
  onNext,
  onOpenNavigator,
}: {
  current: number;
  total: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenNavigator: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-navy-800/95 backdrop-blur-md border-t border-navy-700/30 flex items-center justify-between px-4">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`flex items-center gap-1 text-sm font-semibold transition-opacity ${
          canGoPrev ? 'text-gray-200 hover:text-white' : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Önceki
      </button>

      <button
        onClick={onOpenNavigator}
        className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-sm font-bold text-white hover:bg-navy-600 transition-colors"
      >
        {current}
      </button>

      {current >= total ? (
        <button
          onClick={onNext}
          className="flex items-center gap-1 text-sm font-semibold text-gold-500 hover:text-gold-400 animate-pulse-glow"
        >
          Bitir
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`flex items-center gap-1 text-sm font-semibold transition-opacity ${
            canGoNext ? 'text-gray-200 hover:text-white' : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ─── Close Confirmation Dialog ─── */
export function CloseDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-[rgba(3,4,94,0.7)] backdrop-blur-sm z-[80]" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-navy-800 rounded-2xl z-[90] p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-white mb-2">Çözümden Çık?</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Çözümden çıkmak istiyor musunuz? İlerlemeniz kaydedilecektir.
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 h-11 bg-navy-700 hover:bg-navy-600 text-gray-200 font-semibold rounded-xl transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-colors"
          >
            Çık
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main QuizPage ─── */
export default function QuizPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [sorular, setSorular] = useState<Soru[]>([]);
  const [paketBaslik, setPaketBaslik] = useState('Şubat 2024 Stabilite');
  const [loading, setLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: null,
    attempts: 0,
    answers: {},
  });

  const prevAnswersRef = useRef<Record<number, { answer: string; correct: boolean; attempts: number }>>({});

  /* Load data */
  useEffect(() => {
    fetch('/questions/questions_1_50.json')
      .then((r) => r.json())
      .then((data) => {
        setSorular(data.sorular);
        setPaketBaslik(data.paket?.baslik || 'Şubat 2024 Stabilite');
        const savedProgress = getProgress();
        prevAnswersRef.current = savedProgress;
        setQuizState((s) => ({ ...s, answers: savedProgress }));
        setFavorites(getFavorites());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentSoru = sorular[quizState.currentQuestionIndex];
  const total = sorular.length;

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (showFormulaSheet || showNavigator || showCloseDialog) return;

      if (e.key >= '1' && e.key <= '5' && !quizState.showResult) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        handleSelect(letters[parseInt(e.key) - 1]);
      } else if ((e.key === 'Enter' || e.key === ' ') && quizState.selectedAnswer && !quizState.showResult) {
        e.preventDefault();
        handleCheck();
      } else if (e.key === 'ArrowRight' && quizState.showResult) {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        setShowFormulaSheet(true);
      } else if (e.key === 'b' || e.key === 'B') {
        if (currentSoru) handleToggleFavorite();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleSelect = useCallback((letter: string) => {
    if (quizState.showResult) return;
    setQuizState((s) => ({ ...s, selectedAnswer: letter }));
  }, [quizState.showResult]);

  const handleCheck = useCallback(() => {
    if (!quizState.selectedAnswer || !currentSoru) return;
    const correct = quizState.selectedAnswer === currentSoru.dogru_cevap;
    const newAttempts = quizState.attempts + 1;
    const newAnswers = {
      ...quizState.answers,
      [currentSoru.soru_no]: {
        answer: quizState.selectedAnswer,
        correct,
        attempts: newAttempts,
      },
    };
    saveProgress(newAnswers);
    if (!correct) {
      addWrong(currentSoru.soru_no);
    } else {
      removeWrong(currentSoru.soru_no);
    }
    setQuizState((s) => ({
      ...s,
      showResult: true,
      isCorrect: correct,
      attempts: newAttempts,
      answers: newAnswers,
    }));
  }, [quizState.selectedAnswer, quizState.attempts, quizState.answers, currentSoru]);

  const handleNext = useCallback(() => {
    if (!currentSoru) return;
    if (quizState.currentQuestionIndex >= total - 1) {
      // Finish
      navigate(`/packages/${params.id || 'stab_2024_02'}`);
      return;
    }
    setSlideDir('left');
    setTimeout(() => {
      setQuizState((s) => ({
        ...s,
        currentQuestionIndex: s.currentQuestionIndex + 1,
        selectedAnswer: null,
        showResult: false,
        isCorrect: null,
        attempts: 0,
      }));
      setSlideDir(null);
    }, 200);
  }, [currentSoru, quizState.currentQuestionIndex, total, navigate, params.id]);

  const handlePrev = useCallback(() => {
    if (quizState.currentQuestionIndex <= 0) return;
    setSlideDir('right');
    setTimeout(() => {
      setQuizState((s) => ({
        ...s,
        currentQuestionIndex: s.currentQuestionIndex - 1,
        selectedAnswer: s.answers[sorular[s.currentQuestionIndex - 1]?.soru_no]?.answer || null,
        showResult: false,
        isCorrect: null,
        attempts: 0,
      }));
      setSlideDir(null);
    }, 200);
  }, [quizState.currentQuestionIndex, sorular]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentSoru) return;
    const isFav = toggleFavoriteUtil(currentSoru.soru_no);
    setFavorites(getFavorites());
    return isFav;
  }, [currentSoru]);

  const handleJumpTo = useCallback((qNum: number) => {
    const idx = sorular.findIndex((s) => s.soru_no === qNum);
    if (idx >= 0) {
      const dir = idx > quizState.currentQuestionIndex ? 'left' : 'right';
      setSlideDir(dir);
      setTimeout(() => {
        setQuizState((s) => ({
          ...s,
          currentQuestionIndex: idx,
          selectedAnswer: s.answers[qNum]?.answer || null,
          showResult: false,
          isCorrect: null,
          attempts: 0,
        }));
        setSlideDir(null);
      }, 200);
    }
  }, [sorular, quizState.currentQuestionIndex]);

  const getOptionState = useCallback((letter: string): 'default' | 'selected' | 'correct' | 'wrong' => {
    if (!quizState.showResult) {
      return quizState.selectedAnswer === letter ? 'selected' : 'default';
    }
    if (letter === currentSoru?.dogru_cevap) return 'correct';
    if (letter === quizState.selectedAnswer && !quizState.isCorrect) return 'wrong';
    return 'default';
  }, [quizState.showResult, quizState.selectedAnswer, quizState.isCorrect, currentSoru]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-navy-900">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentSoru) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-navy-900">
        <p className="text-gray-400">Soru bulunamadı.</p>
      </div>
    );
  }

  const isFav = favorites.includes(currentSoru.soru_no);
  const optionLetters = Object.keys(currentSoru.secenekler);

  return (
    <div className="min-h-[100dvh] bg-navy-900 flex flex-col">
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-right {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: translateY(-50%) scale(0.9); opacity: 0; }
          to { transform: translateY(-50%) scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes bounce-correct {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 400ms ease-out forwards; }
        .animate-fade-in { animation: fade-in 300ms ease-out forwards; }
        .animate-scale-in { animation: scale-in 300ms ease-out forwards; }
        .animate-shake { animation: shake 300ms ease-in-out; }
        .animate-bounce-correct { animation: bounce-correct 300ms cubic-bezier(0.34,1.56,0.64,1); }
        .option-stagger {
          opacity: 0;
          animation: stagger-in 300ms ease-out forwards;
        }
        .slide-left-anim {
          animation: slide-left 400ms cubic-bezier(0.25,0.1,0.25,1) forwards;
        }
        .slide-right-anim {
          animation: slide-right 400ms cubic-bezier(0.25,0.1,0.25,1) forwards;
        }
      `}</style>

      {/* Top Bar */}
      <QuizTopBar
        title={paketBaslik}
        onClose={() => setShowCloseDialog(true)}
        onBookmark={handleToggleFavorite}
        isFav={isFav}
      />

      {/* Progress */}
      <SegmentedProgress
        current={quizState.currentQuestionIndex + 1}
        total={total}
        answers={quizState.answers}
      />

      {/* Question area */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div
          className={`px-4 py-4 max-w-2xl mx-auto transition-all duration-200 ${
            slideDir === 'left' ? '-translate-x-full opacity-0' : slideDir === 'right' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          {/* Question badge + topic */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold-500 text-navy-950 text-xs font-bold">
              SORU {currentSoru.soru_no}
            </span>
            <span className="text-xs text-gray-400">{currentSoru.konu}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              currentSoru.zorluk === 'kolay' ? 'bg-green-500/20 text-green-400' :
              currentSoru.zorluk === 'orta' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentSoru.zorluk}
            </span>
          </div>

          {/* Question text */}
          <div
            className="text-base font-medium text-white leading-relaxed mb-5"
            dangerouslySetInnerHTML={{ __html: renderMathText(currentSoru.soru_metni) }}
          />

          {/* Options */}
          <div className="space-y-2.5">
            {optionLetters.map((letter, idx) => (
              <div
                key={`${currentSoru.soru_no}-${letter}`}
                className="option-stagger"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <OptionButton
                  letter={letter}
                  text={currentSoru.secenekler[letter]}
                  state={getOptionState(letter)}
                  disabled={quizState.showResult && quizState.isCorrect === false && quizState.attempts >= 2}
                  onClick={() => handleSelect(letter)}
                  index={idx}
                />
              </div>
            ))}
          </div>

          {/* Check / Next button */}
          <div className="mt-5">
            {!quizState.showResult ? (
              <button
                onClick={handleCheck}
                disabled={!quizState.selectedAnswer}
                className={`w-full h-14 rounded-xl font-semibold text-base transition-all duration-150 ${
                  quizState.selectedAnswer
                    ? 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-glow active:scale-[0.97]'
                    : 'bg-navy-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Kontrol Et
              </button>
            ) : quizState.isCorrect === false && quizState.attempts < 2 ? (
              <button
                onClick={() => {
                  setQuizState((s) => ({ ...s, showResult: false, selectedAnswer: null }));
                }}
                className="w-full h-14 rounded-xl font-semibold text-base bg-amber-500 hover:bg-amber-400 text-navy-950 transition-all active:scale-[0.97]"
              >
                Tekrar Dene ({2 - quizState.attempts} hakkın kaldı)
              </button>
            ) : null}
          </div>
        </div>

        {/* Explanation panel */}
        {quizState.showResult && (
          <ExplanationPanel
            isCorrect={quizState.isCorrect === true}
            correctAnswer={currentSoru.dogru_cevap}
            explanation={currentSoru.aciklama}
            formulas={currentSoru.formuller || []}
            onNext={handleNext}
            onBookmark={handleToggleFavorite}
            isFav={isFav}
          />
        )}
      </div>

      {/* FAB - Formula button */}
      <button
        onClick={() => setShowFormulaSheet(true)}
        className="fixed bottom-20 right-4 z-[55] w-14 h-14 rounded-full bg-gold-500 shadow-glow flex items-center justify-center text-navy-950 hover:bg-gold-400 transition-colors active:scale-90 animate-[scale-in_300ms_cubic-bezier(0.34,1.56,0.64,1)_500ms_both]"
      >
        <Calculator className="w-6 h-6" />
      </button>

      {/* Bottom nav */}
      <QuizBottomNav
        current={quizState.currentQuestionIndex + 1}
        total={total}
        canGoNext={quizState.showResult}
        canGoPrev={quizState.currentQuestionIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenNavigator={() => setShowNavigator(true)}
      />

      {/* Overlays */}
      {showCloseDialog && (
        <CloseDialog
          onConfirm={() => navigate(`/packages/${params.id || 'stab_2024_02'}`)}
          onCancel={() => setShowCloseDialog(false)}
        />
      )}

      {showFormulaSheet && (
        <FormulaSheet
          open={showFormulaSheet}
          onClose={() => setShowFormulaSheet(false)}
          questionFormulas={currentSoru.formuller || []}
        />
      )}

      {showNavigator && (
        <QuestionNavigator
          total={total}
          current={quizState.currentQuestionIndex + 1}
          answers={quizState.answers}
          favorites={favorites}
          onSelect={(n) => handleJumpTo(n)}
          onClose={() => setShowNavigator(false)}
        />
      )}
    </div>
  );
}
