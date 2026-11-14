// Owner: Karen. Elo rating algorithm for this-or-that dish rankings.

import type { DishRank } from "./types";

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
 * Dynamic K-Factor:
 * - New dishes (< 10 votes) have higher K (48) for rapid calibration.
 * - Developing dishes (10 - 29 votes) have standard K (32).
 * - Established dishes (30+ votes) have lower K (20) for rating stability.
 */
export function getDynamicKFactor(votes: number = 0): number {
  if (votes < 10) return 48;
  if (votes < 30) return 32;
  return 20;
}

/**
 * Calculates the new Elo ratings for a winner and a loser after a matchup.
 * Winner gets score = 1, Loser gets score = 0.
 *
 * @param winnerRating Current rating of the winning dish
 * @param loserRating Current rating of the losing dish
 * @param kFactor Optional fixed weight factor. If omitted, uses adaptive K-Factor based on votes.
 * @param winnerVotes Total votes cast on winner dish so far
 * @param loserVotes Total votes cast on loser dish so far
 */
export function calculateElo(
  winnerRating: number = DEFAULT_ELO,
  loserRating: number = DEFAULT_ELO,
  kFactor?: number,
  winnerVotes: number = 0,
  loserVotes: number = 0
): EloResult {
  const expectedWinner = getExpectedScore(winnerRating, loserRating);
  const expectedLoser = getExpectedScore(loserRating, winnerRating);

  const kWin = kFactor ?? getDynamicKFactor(winnerVotes);
  const kLose = kFactor ?? getDynamicKFactor(loserVotes);

  // Winner scored 1 (1 - expectedWinner), Loser scored 0 (0 - expectedLoser)
  const winnerDelta = Math.round(kWin * (1 - expectedWinner));
  const loserDelta = Math.round(kLose * (0 - expectedLoser));

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

export interface MatchupOptions {
  sameHall?: boolean;
  preferredHallId?: string;
}

/**
 * Smart Matchmaking Algorithm:
 * 1. Exploration: Prioritizes dishes with fewer votes using inverse square-root weighting.
 * 2. Informativeness: Pairs with a second dish of similar Elo rating (Gaussian proximity),
 *    maximizing information entropy and creating engaging, close 50/50 matchups.
 */
export function getSmartMatchup(
  dishes: DishRank[],
  options?: MatchupOptions
): [DishRank, DishRank] | null {
  if (dishes.length < 2) return null;

  let pool = [...dishes];
  if (options?.preferredHallId) {
    const hallFiltered = pool.filter((d) => d.hallId === options.preferredHallId);
    if (hallFiltered.length >= 2) {
      pool = hallFiltered;
    }
  }

  // Step 1: Pick first dish, favoring dishes with fewer votes (exploration)
  const weights = pool.map((d) => 1 / Math.sqrt((d.votes ?? 0) + 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let r1 = Math.random() * totalWeight;
  let firstIdx = 0;
  for (let i = 0; i < pool.length; i++) {
    r1 -= weights[i];
    if (r1 <= 0) {
      firstIdx = i;
      break;
    }
  }
  const dishA = pool[firstIdx];

  // Step 2: Pick candidate for dish B based on Elo similarity
  const candidates = pool.filter((_, idx) => idx !== firstIdx);
  if (candidates.length === 0) return null;

  const candidateScores = candidates.map((candidate) => {
    const eloDiff = Math.abs(candidate.elo - dishA.elo);
    // Gaussian falloff centered at 0 difference with std dev 200 Elo
    const eloScore = Math.exp(-Math.pow(eloDiff / 200, 2));
    const hallScore = options?.sameHall && candidate.hallId === dishA.hallId ? 1.5 : 1.0;
    return eloScore * hallScore;
  });

  const totalCandScore = candidateScores.reduce((sum, s) => sum + s, 0);
  let r2 = Math.random() * totalCandScore;
  let secondIdx = 0;
  for (let i = 0; i < candidates.length; i++) {
    r2 -= candidateScores[i];
    if (r2 <= 0) {
      secondIdx = i;
      break;
    }
  }
  const dishB = candidates[secondIdx];

  // Return with randomized visual placement
  return Math.random() > 0.5 ? [dishA, dishB] : [dishB, dishA];
}
