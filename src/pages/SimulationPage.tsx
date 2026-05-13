import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Pause,
  X,
  Play,
  CheckCircle,
  LogOut,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSimulation,
  loadSimulationState,
  clearSimulationState,
} from '@/hooks/useSimulation';

export default function SimulationPage() {
  const [, navigate] = useLocation();
  const {
    state,
    init,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setPaused,
    tick,
    complete,
  } = useSimulation();

  const [showPause, setShowPause] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init state on mount
  useEffect(() => {
    const saved = loadSimulationState();
    if (saved && saved.questions.length > 0 && !saved.isComplete) {
      init(saved);
    } else if (saved && saved.isComplete) {
      navigate('/simulation/results');
    } else {
      navigate('/simulation');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (!state || state.isPaused || state.isComplete) return;
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state?.isPaused, state?.isComplete, tick]);

  // Auto-submit on time up
  useEffect(() => {
    if (state && state.timeRemaining <= 0 && !state.isComplete) {
      complete();
    }
  }, [state?.timeRemaining, state?.isComplete, complete]);

  // Navigate to results when complete
  useEffect(() => {
    if (state?.isComplete) {
      const t = setTimeout(() => {
        navigate('/simulation/results');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state?.isComplete, navigate]);

  // Pause when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state && !state.isComplete) {
        setPaused(true);
        setShowPause(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state, setPaused]);

  const currentQ = state?.questions[state?.currentIndex ?? 0];
  const totalQ = state?.questions.length ?? 0;
  const currentIdx = state?.currentIndex ?? 0;
  const timeRem = state?.timeRemaining ?? 0;
  const totalTime = state?.totalTime ?? 1;
  const timePct = (timeRem / totalTime) * 100;
  const timerColor = timePct > 50 ? 'text-green-500' : timePct > 20 ? 'text-amber-500' : 'text-red-500';
  const barGradient = timePct > 50
    ? 'from-green-500 to-green-400'
    : timePct > 20
    ? 'from-amber-500 to-amber-400'
    : 'from-red-500 to-red-400';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = useCallback(
    (choice: string) => {
      if (!state || isTransitioning) return;
      setSelectedOption(choice);
      setAnswer(currentIdx, choice);

      // Auto-advance after 1 second
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        if (currentIdx < totalQ - 1) {
          setIsTransitioning(true);
          setTimeout(() => {
            nextQuestion();
            setSelectedOption(null);
            setIsTransitioning(false);
          }, 350);
        }
      }, 1000);
    },
    [state, isTransitioning, setAnswer, currentIdx, totalQ, nextQuestion]
  );

  const handleManualNext = useCallback(() => {
    if (currentIdx < totalQ - 1) {
      setIsTransitioning(true);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      setTimeout(() => {
        nextQuestion();
        setSelectedOption(state?.answers[currentIdx + 1] ?? null);
        setIsTransitioning(false);
      }, 350);
    }
  }, [currentIdx, totalQ, nextQuestion, state?.answers]);

  const handleManualPrev = useCallback(() => {
    if (currentIdx > 0) {
      setIsTransitioning(true);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      setTimeout(() => {
        prevQuestion();
        setSelectedOption(state?.answers[currentIdx - 1] ?? null);
        setIsTransitioning(false);
      }, 350);
    }
  }, [currentIdx, prevQuestion, state?.answers]);

  const handleJumpToQuestion = useCallback(
    (idx: number) => {
      setShowDrawer(false);
      setIsTransitioning(true);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      setTimeout(() => {
        goToQuestion(idx);
        setSelectedOption(state?.answers[idx] ?? null);
        setIsTransitioning(false);
      }, 200);
    },
    [goToQuestion, state?.answers]
  );

  const handleFinishEarly = useCallback(() => {
    complete();
    setShowPause(false);
  }, [complete]);

  const handleExit = useCallback(() => {
    clearSimulationState();
    navigate('/');
  }, [navigate]);

  const handlePause = useCallback(() => {
    setPaused(true);
    setShowPause(true);
  }, [setPaused]);

  const handleResume = useCallback(() => {
    setPaused(false);
    setShowPause(false);
  }, [setPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!state || state.isComplete) return;
      if (showPause || showExitConfirm || showDrawer) {
        if (e.key === 'Escape') {
          setShowPause(false);
          setShowExitConfirm(false);
          setShowDrawer(false);
        }
        return;
      }
      if (e.key >= '1' && e.key <= '5') {
        const opts = ['A', 'B', 'C', 'D', 'E'];
        handleSelectOption(opts[Number(e.key) - 1]);
      } else if (e.key === 'ArrowRight') {
        handleManualNext();
      } else if (e.key === 'ArrowLeft') {
        handleManualPrev();
      } else if (e.key === 'Escape') {
        handlePause();
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowDrawer(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, showPause, showExitConfirm, showDrawer, handleSelectOption, handleManualNext, handleManualPrev, handlePause]);

  if (!state || !currentQ) {
    return (
      <div className="min-h-[100dvh] bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (state.isComplete && state.timeRemaining <= 0) {
    return (
      <div className="min-h-[100dvh] bg-navy-900 flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-extrabold text-red-500 mb-3 animate-pulse">Sure Doldu!</h1>
        <p className="text-gray-100 text-center">Cevaplariniz otomatik olarak gonderildi.</p>
      </div>
    );
  }

  const options = Object.entries(currentQ.secenekler);
  const answeredCount = Object.keys(state.answers).length;

  return (
    <div className="min-h-[100dvh] bg-navy-950 flex flex-col relative overflow-hidden">
      {/* SimHeader */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/20 flex items-center justify-between px-4">
        <span className="px-2 py-0.5 rounded-full border border-gold-500 text-gold-400 text-[10px] font-bold uppercase tracking-wider">
          Simulasyon
        </span>
        <span className="text-xs text-gray-100 truncate max-w-[50%]">
          {state.settings.packageName}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handlePause} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 transition-colors" aria-label="Duraklat">
            <Pause className="w-5 h-5" />
          </button>
          <button onClick={() => setShowExitConfirm(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-navy-800 transition-colors" aria-label="Cikis">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Timer Bar */}
      <div className="fixed top-12 left-0 right-0 z-45 h-2 bg-navy-700">
        <div
          className={cn('h-full bg-gradient-to-r transition-all duration-1000 ease-linear', barGradient)}
          style={{ width: `${timePct}%` }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-navy-800 border border-navy-700 rounded-md px-2.5 py-0.5">
          <span className={cn('text-sm font-bold tabular-nums', timerColor)}>
            {formatTime(timeRem)}
          </span>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-20 px-4">
        <p className="text-xs text-gray-400 mb-3">
          Soru {currentIdx + 1} / {totalQ}
        </p>

        <div
          key={currentQ.soru_no}
          className={cn(
            'transition-all duration-300',
            isTransitioning ? 'opacity-0 translate-x-[-40%]' : 'opacity-100 translate-x-0'
          )}
        >
          <p className="text-base font-medium text-white leading-relaxed mb-4 whitespace-pre-line">
            {currentQ.soru_metni}
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {options.map(([key, text], i) => {
              const isSelected = selectedOption === key || state.answers[currentIdx] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-150 text-left relative overflow-hidden min-h-[56px]',
                    isSelected
                      ? 'border-gold-500 bg-gold-500/[0.08]'
                      : 'border-navy-700 bg-navy-800 hover:border-gold-500/50'
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Auto-advance progress line */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gold-500 animate-[fill_1s_linear_forwards]" style={{ width: '100%' }} />
                  )}
                  <span
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                      isSelected
                        ? 'bg-gold-500 text-navy-950'
                        : 'bg-navy-700 text-gray-400'
                    )}
                  >
                    {key}
                  </span>
                  <span className="text-sm text-gray-100 leading-snug pt-0.5">{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SimNavBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-navy-900/95 backdrop-blur-md border-t border-navy-700/20 flex items-center justify-between px-4">
        <button
          onClick={handleManualPrev}
          disabled={currentIdx === 0}
          className={cn(
            'flex items-center gap-1 text-sm font-medium transition-all',
            currentIdx === 0 ? 'text-gray-600 opacity-30' : 'text-gray-100 hover:text-gold-400'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Onceki
        </button>

        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors"
        >
          <LayoutGrid className="w-5 h-5 text-gray-100" />
          <span className={cn('text-sm font-semibold', answeredCount === totalQ ? 'text-gold-500' : 'text-gray-100')}>
            {answeredCount}/{totalQ}
          </span>
        </button>

        {currentIdx < totalQ - 1 ? (
          <button
            onClick={handleManualNext}
            className="flex items-center gap-1 text-sm font-medium text-gray-100 hover:text-gold-400 transition-all"
          >
            Sonraki
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinishEarly}
            className="px-4 py-1.5 bg-gold-500 text-navy-950 text-sm font-bold rounded-lg hover:bg-gold-400 animate-pulse-glow transition-all"
          >
            Bitir
          </button>
        )}
      </nav>

      {/* Question Drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-[60]" onClick={() => setShowDrawer(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-navy-800 rounded-t-2xl max-h-[70vh] overflow-y-auto animate-[slideUp_350ms_ease-out]">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Sorular</h3>
              <span className="text-xs text-gray-400">{answeredCount}/{totalQ} yanitlandi</span>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {state.questions.map((_, idx) => {
                  const isAnswered = state.answers[idx] !== undefined;
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={cn(
                        'h-12 rounded-lg text-sm font-semibold transition-all active:scale-90',
                        isCurrent
                          ? 'ring-2 ring-gold-500 bg-navy-800 text-gold-500'
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : 'bg-navy-700 text-gray-400 hover:bg-navy-600'
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="flex-1 h-12 rounded-xl border border-navy-600 text-gray-100 font-semibold text-sm hover:bg-navy-700 transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={handleFinishEarly}
                  className="flex-1 h-12 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm hover:bg-gold-400 transition-colors"
                >
                  Simulasyonu Bitir
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pause Menu */}
      {showPause && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={handleResume} />
          <div className="relative bg-navy-800 rounded-2xl p-8 max-w-xs w-full text-center animate-[scaleIn_300ms_ease-out]">
            <Pause className="w-12 h-12 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Duraklatildi</h2>
            <p className="text-lg font-semibold text-gold-400 mb-6">
              Kalan Sure: {formatTime(timeRem)}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleResume}
                className="w-full h-12 bg-gold-500 text-navy-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 active:scale-[0.97] transition-all"
              >
                <Play className="w-5 h-5" />
                Devam Et
              </button>
              <button
                onClick={handleFinishEarly}
                className="w-full h-12 border border-gold-500 text-gold-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gold-500/10 active:scale-[0.97] transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Simulasyonu Bitir
              </button>
              <button
                onClick={() => { setShowPause(false); setShowExitConfirm(true); }}
                className="w-full h-12 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-[0.97] transition-all"
              >
                <LogOut className="w-5 h-5" />
                Cikis Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-navy-800 rounded-2xl p-6 max-w-xs w-full text-center animate-[scaleIn_300ms_ease-out]">
            <h3 className="text-lg font-semibold text-white mb-2">Simulasyondan Cik?</h3>
            <p className="text-sm text-gray-100 mb-5">
              Ilerlemeniz kaydedilecektir ancak bu simulasyon tamamlanmis sayilmayacak.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-navy-600 text-gray-100 font-semibold text-sm hover:bg-navy-700 transition-colors"
              >
                Kal
              </button>
              <button
                onClick={handleExit}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 transition-colors"
              >
                Cik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .z-45 { z-index: 45; }
      `}</style>
    </div>
  );
}
