/** Default K-factor used in Elo rating updates. Determines the maximum change in rating per game. */
export const DEFAULT_K_FACTOR = 32

/** Default scale used in Elo probability calculation. Represents the rating difference that corresponds to ~90% win probability. */
export const DEFAULT_SCALE = 400

/**
 * Calculates the expected probability of player A winning against player B.
 *
 * @param {number} eloA - Elo rating of player A.
 * @param {number} eloB - Elo rating of player B.
 * @param {number} [scale=DEFAULT_SCALE] - Scale factor controlling sensitivity to rating differences.
 * @returns {number} Probability that player A wins (between 0 and 1).
 */
export function getWinProbability (
  eloA: number,
  eloB: number,
  scale: number = DEFAULT_SCALE
): number {
  const exponent = (eloB - eloA) / scale
  return 1 / (1 + Math.pow(10, exponent))
}

/**
 * Updates a player's Elo rating based on the expected probability and actual outcome.
 *
 * @param {number} winProbability - Expected probability of winning (from getWinProbability).
 * @param {number} actualOutcome - Actual result of the match (0 = loss, 0.5 = draw, 1 = win; can be fractional for weighted outcomes).
 * @param {number} currentElo - Player's current Elo rating.
 * @param {number} [kFactor=DEFAULT_K_FACTOR] - Maximum rating change per game.
 * @returns {number} Updated Elo rating.
 */
export function updateRating (
  winProbability: number,
  actualOutcome: number,
  currentElo: number,
  kFactor: number = DEFAULT_K_FACTOR
): number {
  return currentElo + kFactor * (actualOutcome - winProbability)
}
