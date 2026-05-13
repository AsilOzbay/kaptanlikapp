import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  Calculator,
} from 'lucide-react';
import type { Soru, QuizState } from './QuizPage';
import {
  renderMathText, getProgress, saveProgress, getFavorites,
  toggleFavoriteUtil, addWrong, removeWrong,
  OptionButton, SegmentedProgress, ExplanationPanel,
  FormulaSheet, QuestionNavigator, QuizTopBar, QuizBottomNav, CloseDialog,
} from './QuizPage';

export default function MixedQuizPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [sorular, setSorular] = useState<Soru[]>([]);
  const [paketBaslik, setPaketBaslik] = useState('Karışık Sorular');
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

  /* Load data and shuffle */
  useEffect(() => {
    fetch('/questions/questions_1_50.json')
      .then((r) => r.json())
      .then((data) => {
        const all: Soru[] = data.sorular;
        // sorular loaded
        setPaketBaslik(data.paket?.baslik + ' - Karışık' || 'Karışık Sorular');

        // Shuffle and pick 20
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 20);
        setSorular(selected);

        const savedProgress = getProgress();
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
      if (e.key >= '1' && e.key <= '5' && !quizState.showResult && currentSoru) {
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
    if (!correct) addWrong(currentSoru.soru_no);
    else removeWrong(currentSoru.soru_no);
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
    toggleFavoriteUtil(currentSoru.soru_no);
    setFavorites(getFavorites());
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

  const isFav = currentSoru ? favorites.includes(currentSoru.soru_no) : false;
  const optionLetters = Object.keys(currentSoru.secenekler);

  return (
    <div className="min-h-[100dvh] bg-navy-900 flex flex-col">
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: translateY(-50%) scale(0.9); opacity: 0; } to { transform: translateY(-50%) scale(1); opacity: 1; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        @keyframes stagger-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 400ms ease-out forwards; }
        .animate-fade-in { animation: fade-in 300ms ease-out forwards; }
        .animate-scale-in { animation: scale-in 300ms ease-out forwards; }
        .option-stagger { opacity: 0; animation: stagger-in 300ms ease-out forwards; }
      `}</style>

      <QuizTopBar
        title={paketBaslik}
        onClose={() => setShowCloseDialog(true)}
        onBookmark={handleToggleFavorite}
        isFav={isFav}
      />

      <SegmentedProgress
        current={quizState.currentQuestionIndex + 1}
        total={total}
        answers={quizState.answers}
      />

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div
          className={`px-4 py-4 max-w-2xl mx-auto transition-all duration-200 ${
            slideDir === 'left' ? '-translate-x-full opacity-0' : slideDir === 'right' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
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

          <div
            className="text-base font-medium text-white leading-relaxed mb-5"
            dangerouslySetInnerHTML={{ __html: renderMathText(currentSoru.soru_metni) }}
          />

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
                onClick={() => setQuizState((s) => ({ ...s, showResult: false, selectedAnswer: null }))}
                className="w-full h-14 rounded-xl font-semibold text-base bg-amber-500 hover:bg-amber-400 text-navy-950 transition-all active:scale-[0.97]"
              >
                Tekrar Dene ({2 - quizState.attempts} hakkın kaldı)
              </button>
            ) : null}
          </div>
        </div>

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

      <button
        onClick={() => setShowFormulaSheet(true)}
        className="fixed bottom-20 right-4 z-[55] w-14 h-14 rounded-full bg-gold-500 shadow-glow flex items-center justify-center text-navy-950 hover:bg-gold-400 transition-colors active:scale-90 animate-[scale-in_300ms_cubic-bezier(0.34,1.56,0.64,1)_500ms_both]"
      >
        <Calculator className="w-6 h-6" />
      </button>

      <QuizBottomNav
        current={quizState.currentQuestionIndex + 1}
        total={total}
        canGoNext={quizState.showResult}
        canGoPrev={quizState.currentQuestionIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenNavigator={() => setShowNavigator(true)}
      />

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
