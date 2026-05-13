import { useState, useCallback } from 'react';

export interface Question {
  soru_no: number;
  konu: string;
  soru_metni: string;
  secenekler: Record<string, string>;
  dogru_cevap: string;
  aciklama: string;
  formuller: string[];
  gorsel: string;
  zorluk: string;
}

export interface SimulationSettings {
  packageId: string;
  packageName: string;
  questionCount: number;
  duration: number; // minutes
  difficulty: 'all' | 'kolay' | 'orta' | 'zor';
}

export interface SimulationState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  timeRemaining: number;
  totalTime: number;
  isPaused: boolean;
  isComplete: boolean;
  startTime: string;
  settings: SimulationSettings;
}

const STORAGE_KEY = 'kaptanlik_simulation_state';
const SETTINGS_KEY = 'kaptanlik_simulation_settings';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectQuestions(
  all: Question[],
  count: number,
  _difficulty: string
): Question[] {
  let pool = all;
  if (_difficulty !== 'all') {
    pool = all.filter((q) => q.zorluk === _difficulty);
  }
  if (pool.length <= count) return shuffleArray(pool);
  return shuffleArray(pool).slice(0, count);
}

export function loadSettings(): SimulationSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as SimulationSettings;
  } catch { /* ignore */ }
  return null;
}

export function saveSettings(settings: SimulationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSimulationState(): SimulationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SimulationState;
  } catch { /* ignore */ }
  return null;
}

export function saveSimulationState(state: SimulationState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearSimulationState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createSimulationState(
  allQuestions: Question[],
  settings: SimulationSettings
): SimulationState {
  const questions = selectQuestions(
    allQuestions,
    settings.questionCount,
    settings.difficulty
  );
  const state: SimulationState = {
    questions,
    currentIndex: 0,
    answers: {},
    timeRemaining: settings.duration * 60,
    totalTime: settings.duration * 60,
    isPaused: false,
    isComplete: false,
    startTime: new Date().toISOString(),
    settings,
  };
  saveSimulationState(state);
  return state;
}

export function useSimulation(initial?: SimulationState) {
  const [state, setState] = useState<SimulationState | null>(initial ?? null);

  const setAnswer = useCallback((questionIndex: number, choice: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const next: SimulationState = {
        ...prev,
        answers: { ...prev.answers, [questionIndex]: choice },
      };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const clamped = Math.max(0, Math.min(index, prev.questions.length - 1));
      const next = { ...prev, currentIndex: clamped };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const clamped = Math.min(prev.currentIndex + 1, prev.questions.length - 1);
      const next = { ...prev, currentIndex: clamped };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const prevQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const clamped = Math.max(prev.currentIndex - 1, 0);
      const next = { ...prev, currentIndex: clamped };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, isPaused: paused };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.isPaused || prev.isComplete) return prev;
      const nextTime = prev.timeRemaining - 1;
      if (nextTime <= 0) {
        const next: SimulationState = {
          ...prev,
          timeRemaining: 0,
          isComplete: true,
        };
        saveSimulationState(next);
        return next;
      }
      const next = { ...prev, timeRemaining: nextTime };
      // throttle localStorage writes
      if (nextTime % 5 === 0) saveSimulationState(next);
      return next;
    });
  }, []);

  const complete = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const next: SimulationState = { ...prev, isComplete: true };
      saveSimulationState(next);
      return next;
    });
  }, []);

  const init = useCallback((simState: SimulationState) => {
    setState(simState);
  }, []);

  return {
    state,
    init,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setPaused,
    tick,
    complete,
  };
}
