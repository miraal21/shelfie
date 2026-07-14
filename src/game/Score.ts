/**
 * Information about one completed puzzle.
 */
export interface GameResult {
  puzzleId: string;
  puzzleNumber: number;
  completedAt: string;
  seconds: number;
  moves: number;
  checks: number;
  hints: number;
  stars: number;
}

/**
 * Statistics shown on the Stats page.
 */
export interface PlayerStats {
  gamesPlayed: number;
  currentStreak: number;
  longestStreak: number;
  totalSeconds: number;
  totalMoves: number;
  totalHints: number;
  bestSeconds: number | null;
  completedPuzzleIds: string[];
  results: GameResult[];
  lastPlayedDate: string | null;
}

const STATS_KEY = "shelfie-player-stats";

/**
 * Create a new empty statistics object.
 */
export function createEmptyStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSeconds: 0,
    totalMoves: 0,
    totalHints: 0,
    bestSeconds: null,
    completedPuzzleIds: [],
    results: [],
    lastPlayedDate: null
  };
}

/**
 * Load saved statistics.
 */
export function loadStats(): PlayerStats {
  const storedValue =
    localStorage.getItem(STATS_KEY);

  if (!storedValue) {
    return createEmptyStats();
  }

  try {
    const parsed =
      JSON.parse(storedValue) as PlayerStats;

    return {
      ...createEmptyStats(),
      ...parsed
    };
  } catch (error) {
    console.error(
      "Could not load Shelfie statistics.",
      error
    );

    return createEmptyStats();
  }
}

/**
 * Save statistics.
 */
export function saveStats(
  stats: PlayerStats
): void {
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify(stats)
  );
}

/**
 * Return today's local date as YYYY-MM-DD.
 */
function getTodayString(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Calculate the number of days between two date strings.
 */
function daysBetween(
  firstDate: string,
  secondDate: string
): number {
  const firstTime = new Date(
    `${firstDate}T00:00:00`
  ).getTime();

  const secondTime = new Date(
    `${secondDate}T00:00:00`
  ).getTime();

  return Math.round(
    Math.abs(secondTime - firstTime) /
      86_400_000
  );
}

/**
 * Calculate a star rating.
 */
export function calculateStars(
  seconds: number,
  moves: number,
  hints: number
): number {
  let stars = 5;

  if (seconds > 180) {
    stars -= 1;
  }

  if (moves > 12) {
    stars -= 1;
  }

  if (hints > 0) {
    stars -= 1;
  }

  if (hints > 2) {
    stars -= 1;
  }

  return Math.max(1, stars);
}

/**
 * Save one completed game.
 */
export function recordGameResult(
  result: GameResult
): PlayerStats {
  const stats = loadStats();

  /**
   * Do not count the same puzzle twice.
   */
  if (
    stats.completedPuzzleIds.includes(
      result.puzzleId
    )
  ) {
    return stats;
  }

  const today = getTodayString();

  /**
   * Update the streak.
   */
  if (!stats.lastPlayedDate) {
    stats.currentStreak = 1;
  } else {
    const difference = daysBetween(
      stats.lastPlayedDate,
      today
    );

    if (difference === 1) {
      stats.currentStreak += 1;
    } else if (difference > 1) {
      stats.currentStreak = 1;
    }
  }

  stats.longestStreak = Math.max(
    stats.longestStreak,
    stats.currentStreak
  );

  stats.gamesPlayed += 1;
  stats.totalSeconds += result.seconds;
  stats.totalMoves += result.moves;
  stats.totalHints += result.hints;

  stats.bestSeconds =
    stats.bestSeconds === null
      ? result.seconds
      : Math.min(
          stats.bestSeconds,
          result.seconds
        );

  stats.completedPuzzleIds.push(
    result.puzzleId
  );

  stats.results.push(result);
  stats.lastPlayedDate = today;

  saveStats(stats);

  return stats;
}

/**
 * Format seconds as MM:SS.
 */
export function formatSeconds(
  totalSeconds: number
): string {
  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds = totalSeconds % 60;

  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  );
}

/**
 * Create spoiler-free result text.
 */
export function createShareText(
  result: GameResult
): string {
  const stars = "⭐".repeat(result.stars);

  return [
    `Shelfie #${result.puzzleNumber}`,
    stars,
    `Time: ${formatSeconds(result.seconds)}`,
    `Moves: ${result.moves}`,
    `Hints: ${result.hints}`
  ].join("\n");
}

/**
 * Delete all statistics.
 */
export function resetStats(): void {
  localStorage.removeItem(STATS_KEY);
}