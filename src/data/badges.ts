export interface Badge {
  id: string;
  name: string;
  desc: string;
  condition: {
    type: 'count' | 'percentage' | 'streak' | 'time' | 'explore';
    value: number;
  };
}

export const badges: Badge[] = [
  { id: 'first-solve', name: 'Ilk Adim', desc: 'Ilk soruyu coz', condition: { type: 'count', value: 1 } },
  { id: 'solver-10', name: 'Cozumcu', desc: '10 soru coz', condition: { type: 'count', value: 10 } },
  { id: 'solver-50', name: 'Usta Cozumcu', desc: '50 soru coz', condition: { type: 'count', value: 50 } },
  { id: 'solver-100', name: 'Uzman', desc: '100 soru coz', condition: { type: 'count', value: 100 } },
  { id: 'accuracy-70', name: 'Dikkatli', desc: '%70 dogruluk', condition: { type: 'percentage', value: 70 } },
  { id: 'accuracy-90', name: 'Mukemmel', desc: '%90 dogruluk', condition: { type: 'percentage', value: 90 } },
  { id: 'perfect-solve', name: 'Kusursuz', desc: '10 soruyu ust uste dogru coz', condition: { type: 'streak', value: 10 } },
  { id: 'night-owl', name: 'Gece Kusu', desc: "Gece 12'den sonra calis", condition: { type: 'time', value: 0 } },
  { id: 'formula-master', name: 'Formul Ustasi', desc: '10 formul goruntule', condition: { type: 'count', value: 10 } },
  { id: 'simulation-pass', name: 'Sinavi Gecti', desc: 'Bir simulasyonda %70 basari', condition: { type: 'percentage', value: 70 } },
  { id: 'explorer', name: 'Kasif', desc: 'Tum calisma modlarini dene', condition: { type: 'explore', value: 4 } },
  { id: 'favorite-10', name: 'Koleksiyoncu', desc: '10 favori soru', condition: { type: 'count', value: 10 } },
];

export interface BadgeWithStatus extends Badge {
  earned: boolean;
  earnedDate?: string;
  progress: number;
  progressMax: number;
}

/**
 * Check if a badge is earned based on user stats
 */
export function checkBadgeEarned(badge: Badge, stats: {
  totalSolved: number;
  accuracy: number;
  streak: number;
  formulasViewed: number;
  simulationsPassed: number;
  modesExplored: number;
  favoritesCount: number;
  nightStudy: boolean;
  maxCorrectStreak: number;
}): boolean {
  switch (badge.condition.type) {
    case 'count':
      if (badge.id === 'formula-master') return stats.formulasViewed >= badge.condition.value;
      if (badge.id === 'favorite-10') return stats.favoritesCount >= badge.condition.value;
      return stats.totalSolved >= badge.condition.value;
    case 'percentage':
      if (badge.id === 'simulation-pass') return stats.simulationsPassed >= 1 && stats.accuracy >= badge.condition.value;
      return stats.accuracy >= badge.condition.value;
    case 'streak':
      return stats.maxCorrectStreak >= badge.condition.value;
    case 'time':
      return stats.nightStudy;
    case 'explore':
      return stats.modesExplored >= badge.condition.value;
    default:
      return false;
  }
}

/**
 * Get progress for a badge (current / max)
 */
export function getBadgeProgress(badge: Badge, stats: {
  totalSolved: number;
  accuracy: number;
  streak: number;
  formulasViewed: number;
  favoritesCount: number;
  modesExplored: number;
  maxCorrectStreak: number;
  simulationsPassed: number;
}): { progress: number; max: number } {
  switch (badge.condition.type) {
    case 'count':
      if (badge.id === 'formula-master') return { progress: stats.formulasViewed, max: badge.condition.value };
      if (badge.id === 'favorite-10') return { progress: stats.favoritesCount, max: badge.condition.value };
      return { progress: stats.totalSolved, max: badge.condition.value };
    case 'percentage':
      if (badge.id === 'simulation-pass') return { progress: stats.simulationsPassed > 0 ? stats.accuracy : 0, max: badge.condition.value };
      return { progress: Math.round(stats.accuracy), max: badge.condition.value };
    case 'streak':
      return { progress: stats.maxCorrectStreak, max: badge.condition.value };
    case 'explore':
      return { progress: stats.modesExplored, max: badge.condition.value };
    default:
      return { progress: 0, max: badge.condition.value };
  }
}

/**
 * Compute badge status list with earned/locked state
 */
export function computeBadgeStatuses(
  badgesList: Badge[],
  stats: {
    totalSolved: number;
    accuracy: number;
    streak: number;
    formulasViewed: number;
    simulationsPassed: number;
    modesExplored: number;
    favoritesCount: number;
    nightStudy: boolean;
    maxCorrectStreak: number;
  }
): BadgeWithStatus[] {
  return badgesList.map((badge) => {
    const earned = checkBadgeEarned(badge, stats);
    const progressData = getBadgeProgress(badge, stats);
    return {
      ...badge,
      earned,
      progress: progressData.progress,
      progressMax: progressData.max,
      earnedDate: earned ? new Date().toISOString() : undefined,
    };
  });
}
