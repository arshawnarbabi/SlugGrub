// Owner: Karen. Elo rating algorithm for this-or-that dish rankings.

export const DEFAULT_ELO = 1200;
export const DEFAULT_K_FACTOR = 32;

export interface EloResult {
  newWinnerElo: number;
  newLoserElo: number;
  winnerDelta: number;
  loserDelta: number;
}

/**
 * Calculates the expected score for player/dish A against player/dish B.
 * Formula: 1 / (1 + 10 ^ ((ratingB - ratingA) / 400))
 * Returns a probability between 0 and 1.
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates the new Elo ratings for a winner and a loser after a matchup.
 * Winner gets score = 1, Loser gets score = 0.
 *
 * @param winnerRating Current rating of the winning dish
 * @param loserRating Current rating of the losing dish
 * @param kFactor Weight factor determining how much ratings change (default 32)
 */
export function calculateElo(
  winnerRating: number = DEFAULT_ELO,
  loserRating: number = DEFAULT_ELO,
  kFactor: number = DEFAULT_K_FACTOR
): EloResult {
  const expectedWinner = getExpectedScore(winnerRating, loserRating);
  const expectedLoser = getExpectedScore(loserRating, winnerRating);

  // Winner scored 1 (1 - expectedWinner), Loser scored 0 (0 - expectedLoser)
  const winnerDelta = Math.round(kFactor * (1 - expectedWinner));
  const loserDelta = Math.round(kFactor * (0 - expectedLoser));

  return {
    newWinnerElo: winnerRating + winnerDelta,
    newLoserElo: Math.max(100, loserRating + loserDelta), // Ensure rating does not drop below 100
    winnerDelta,
    loserDelta,
  };
}

/**
 * Convenience helper to determine ranking change and percentage win probability.
 */
export function getWinProbability(ratingA: number, ratingB: number): number {
  return Math.round(getExpectedScore(ratingA, ratingB) * 100);
}
