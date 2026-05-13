import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  X,
  CheckCircle,
  XCircle,
  Circle,
  Target,
  Clock,
  Zap,
  Hourglass,
  RotateCcw,
  Play,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import {
  loadSimulationState,
  clearSimulationState,
} from '@/hooks/useSimulation';
import type { SimulationState } from '@/hooks/useSimulation';

type FilterType = 'all' | 'correct' | 'wrong' | 'empty';

export default function SimulationResultPage() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<SimulationState | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const saved = loadSimulationState();
    if (saved && saved.isComplete) {
      setState(saved);
    } else {
      navigate('/simulation');
    }
  }, [navigate]);

  const results = useMemo(() => {
    if (!state) return { correct: 0, wrong: 0, empty: 0, score: 0, total: 0 };
    const total = state.questions.length;
    let correct = 0;
    let wrong = 0;
    state.questions.forEach((q, idx) => {
      const ans = state.answers[idx];
      if (!ans) return;
      if (ans === q.dogru_cevap) correct++;
      else wrong++;
    });
    const empty = total - correct - wrong;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, empty, score, total };
  }, [state]);

  // Confetti for passing score
  useEffect(() => {
    if (results.score >= 70 && !showConfetti) {
      setShowConfetti(true);
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4A017', '#10B981', '#F0C94A', '#E5B83A'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4A017', '#10B981', '#F0C94A', '#E5B83A'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [results.score, showConfetti]);

  // Save to recent simulations
  useEffect(() => {
    if (!state || !results.total) return;
    try {
      const raw = localStorage.getItem('kaptanlik_recent_simulations');
      const recent = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now().toString(),
        topic: state.settings.packageName,
        score: results.score,
        count: results.total,
        duration: state.settings.duration,
        date: new Date().toLocaleDateString('tr-TR'),
        completed: true,
      };
      const updated = [entry, ...recent].slice(0, 10);
      localStorage.setItem('kaptanlik_recent_simulations', JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [state, results]);

  // Topic breakdown
  const topicStats = useMemo(() => {
    if (!state) return [];
    const map: Record<string, { total: number; correct: number }> = {};
    state.questions.forEach((q, idx) => {
      if (!map[q.konu]) map[q.konu] = { total: 0, correct: 0 };
      map[q.konu].total++;
      const ans = state.answers[idx];
      if (ans === q.dogru_cevap) map[q.konu].correct++;
    });
    return Object.entries(map).map(([topic, s]) => ({
      topic,
      total: s.total,
      correct: s.correct,
      pct: Math.round((s.correct / s.total) * 100),
    }));
  }, [state]);

  const filteredQuestions = useMemo(() => {
    if (!state) return [];
    return state.questions
      .map((q, idx) => ({ ...q, idx }))
      .filter((q) => {
        const ans = state.answers[q.idx];
        if (filter === 'correct') return ans === q.dogru_cevap;
        if (filter === 'wrong') return ans !== undefined && ans !== q.dogru_cevap;
        if (filter === 'empty') return ans === undefined;
        return true;
      });
  }, [state, filter]);

  const handleRetry = useCallback(() => {
    clearSimulationState();
    navigate('/simulation');
  }, [navigate]);

  const handleNewSim = useCallback(() => {
    clearSimulationState();
    navigate('/simulation');
  }, [navigate]);

  const handleShare = useCallback(() => {
    const text = `KaptanlikApp Simulasyon Sonucu\n${state?.settings.packageName}\nSkor: %${results.score}\nDogru: ${results.correct}/${results.total}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setShowShare(false);
  }, [state, results]);

  if (!state) {
    return (
      <div className="min-h-[100dvh] bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Tumu (${results.total})` },
    { key: 'correct', label: `Dogru (${results.correct})` },
    { key: 'wrong', label: `Yanlis (${results.wrong})` },
    { key: 'empty', label: `Bos (${results.empty})` },
  ];

  return (
    <div className="min-h-[100dvh] bg-navy-900 pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 flex items-center justify-between px-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-white">Simulasyon Sonuclari</h1>
        <button
          onClick={() => setShowShare(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <div className="pt-14">
        {/* Score Hero */}
        <section className="bg-navy-800 px-4 py-8 border-b border-navy-700">
          <div className="text-center">
            {/* Status Badge */}
            <span
              className={cn(
                'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5',
                results.score >= 70
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}
            >
              {results.score >= 70 ? 'BASARILI' : 'TEKRAR DENEYIN'}
            </span>

            {/* Circular Progress */}
            <div className="w-40 h-40 mx-auto mb-5 relative">
              <CircularProgressbar
                value={results.score}
                text={`${results.score}%`}
                strokeWidth={6}
                styles={buildStyles({
                  pathColor: '#D4A017',
                  trailColor: '#1B2E6B',
                  textColor: '#F8FAFC',
                  textSize: '28px',
                  pathTransitionDuration: 1.5,
                })}
              />
              <p className="text-xs text-gray-400 mt-1">
                {results.correct + results.wrong}/{results.total} soru
              </p>
            </div>

            {/* Score Details */}
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">{results.correct} Dogru</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">{results.wrong} Yanlis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{results.empty} Bos</span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="px-2 py-0.5 rounded-full border border-gold-500 text-gold-400 font-semibold">
                {state.settings.packageName}
              </span>
              <span>{state.settings.duration} dk</span>
              <span>{new Date().toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </section>

        {/* Stats Breakdown */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold text-white mb-3">Detayli Istatistikler</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-navy-800 rounded-xl p-4 border border-navy-700/50">
              <Target className="w-5 h-5 text-gold-500 mb-2" />
              <p className="text-2xl font-bold text-white">%{results.score}</p>
              <p className="text-xs text-gray-400">Basari Orani</p>
              <p className="text-xs text-gray-600 mt-0.5">Hedef: %70</p>
            </div>
            <div className="bg-navy-800 rounded-xl p-4 border border-navy-700/50">
              <Clock className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round((state.settings.duration * 60) / results.total)} sn
              </p>
              <p className="text-xs text-gray-400">Soru Basina Sure</p>
              <p className="text-xs text-green-400 mt-0.5">Hedef: &lt;60 sn</p>
            </div>
            <div className="bg-navy-800 rounded-xl p-4 border border-navy-700/50">
              <Zap className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-white">
                {state.settings.duration} dk
              </p>
              <p className="text-xs text-gray-400">Toplam Sure</p>
            </div>
            <div className="bg-navy-800 rounded-xl p-4 border border-navy-700/50">
              <Hourglass className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-white">{results.total}</p>
              <p className="text-xs text-gray-400">Toplam Soru</p>
              <p className="text-xs text-gray-600 mt-0.5">{results.correct} dogru</p>
            </div>
          </div>
        </section>

        {/* Topic Breakdown */}
        {topicStats.length > 0 && (
          <section className="px-4 py-4">
            <h2 className="text-lg font-semibold text-white mb-3">Konu Bazli Analiz</h2>
            <div className="space-y-3">
              {topicStats.map((t) => {
                const barColor = t.pct >= 70 ? 'bg-green-500' : t.pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-100">{t.topic}</span>
                      <span className="text-xs font-semibold text-gold-500">{t.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.correct}/{t.total} dogru
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Question Review */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold text-white mb-3">Soru Incelemesi</h2>
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                  filter === tab.key
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-navy-800 border border-navy-700 text-gray-100 hover:border-navy-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Review Cards */}
          <div className="space-y-2">
            {filteredQuestions.map((q) => {
              const ans = state.answers[q.idx];
              const isCorrect = ans === q.dogru_cevap;
              const isWrong = ans !== undefined && !isCorrect;
              const isEmpty = ans === undefined;
              const isExpanded = expandedIndex === q.idx;

              return (
                <div
                  key={q.idx}
                  className="bg-navy-800 rounded-xl border border-navy-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : q.idx)}
                    className="w-full p-4 text-left flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-700 text-gray-300">
                          Soru {q.idx + 1}
                        </span>
                        {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                        {isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        {isEmpty && <Circle className="w-4 h-4 text-gray-400 shrink-0" />}
                      </div>
                      <p className={cn(
                        'text-sm leading-snug',
                        isCorrect ? 'text-green-300' : isWrong ? 'text-red-300' : 'text-gray-400'
                      )}>
                        {q.soru_metni.length > 120 ? q.soru_metni.slice(0, 120) + '...' : q.soru_metni}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn('text-xs', isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-gray-400')}>
                          Sizin cevabiniz: [{ans || '-'}]
                        </span>
                        {isWrong && (
                          <span className="text-xs text-green-500">
                            Dogru cevap: [{q.dogru_cevap}]
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-navy-700/50 pt-3">
                      <p className="text-sm text-white mb-3 whitespace-pre-line">{q.soru_metni}</p>
                      <div className="space-y-1.5 mb-3">
                        {Object.entries(q.secenekler).map(([key, text]) => {
                          const isSelected = ans === key;
                          const isAnswer = q.dogru_cevap === key;
                          return (
                            <div
                              key={key}
                              className={cn(
                                'flex items-start gap-2 px-3 py-2 rounded-lg text-sm',
                                isAnswer
                                  ? 'bg-green-500/10 border border-green-500/30'
                                  : isSelected && !isAnswer
                                  ? 'bg-red-500/10 border border-red-500/30'
                                  : 'bg-navy-700/50 border border-transparent'
                              )}
                            >
                              <span className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                isAnswer ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-navy-600 text-gray-300'
                              )}>
                                {key}
                              </span>
                              <span className={cn(
                                'pt-0.5',
                                isAnswer ? 'text-green-300' : isSelected ? 'text-red-300' : 'text-gray-300'
                              )}>
                                {text}
                              </span>
                              {isAnswer && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 ml-auto" />}
                              {isSelected && !isAnswer && <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-auto" />}
                            </div>
                          );
                        })}
                      </div>
                      {q.aciklama && (
                        <div className="bg-navy-700/40 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gold-400 mb-1">Aciklama</p>
                          <p className="text-xs text-gray-100 leading-relaxed">{q.aciklama}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-navy-950 to-navy-900/95 border-t border-navy-700/30">
        <div className="flex gap-3 max-w-lg mx-auto">
          {results.wrong > 0 && (
            <button
              onClick={handleRetry}
              className="flex-1 h-12 rounded-xl border border-gold-500 text-gold-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gold-500/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Yanlislari Tekrar Coz
            </button>
          )}
          <button
            onClick={handleNewSim}
            className="flex-1 h-12 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gold-400 shadow-glow transition-all"
          >
            <Play className="w-4 h-4" />
            Yeni Simulasyon
          </button>
        </div>
      </div>

      {/* Share Bottom Sheet */}
      {showShare && (
        <>
          <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-[60]" onClick={() => setShowShare(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-navy-800 rounded-t-2xl p-6 animate-[slideUp_400ms_ease-out]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Sonuclari Paylas</h3>
            <button
              onClick={handleShare}
              className="w-full h-12 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm hover:bg-gold-400 transition-colors mb-3"
            >
              Metin Olarak Kopyala
            </button>
            <button
              onClick={() => setShowShare(false)}
              className="w-full h-11 rounded-xl border border-navy-600 text-gray-100 font-semibold text-sm hover:bg-navy-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
