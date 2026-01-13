// Constante K par défaut pour ajuster la vitesse de mise à jour du classement
export const K_FACTOR = 32

/**
 * Calcule la probabilité de gain de A en fonction des scores Elo de A et B.
 * @param eloA Le score Elo du joueur A.
 * @param eloB Le score Elo du joueur B.
 * @returns La probabilité que le joueur A gagne contre le joueur B.
 */
export function getWinProbability (
  eloA: number,
  eloB: number
): number {
  const exponent = (eloB - eloA) / 400
  return 1 / (1 + Math.pow(10, exponent))
}

/**
 * Calcule les nouveaux classements Elo pour les scénarios de victoire de A, de B et de match nul.
 * @param eloA Le score Elo actuel du joueur A.
 * @param eloB Le score Elo actuel du joueur B.
 * @param kFactor Facteur K pour les calculs Elo (facultatif, valeur par défaut = 32).
 * @returns Un objet contenant les nouveaux classements Elo pour chaque scénario de résultat.
 */
export function getOutcome (
  eloA: number,
  eloB: number,
  kFactor: number = K_FACTOR
) {
  const probA = getWinProbability(eloA, eloB)
  const probB = 1 - probA
  return {
    aWins: {
      eloA: Math.round(eloA + kFactor * (1 - probA)),
      eloB: Math.round(eloB + kFactor * (0 - probB))
    },
    bWins: {
      eloA: Math.round(eloA + kFactor * (0 - probA)),
      eloB: Math.round(eloB + kFactor * (1 - probB))
    },
    null: {
      eloA: Math.round(eloA + kFactor * (0.5 - probA)),
      eloB: Math.round(eloB + kFactor * (0.5 - probB))
    },
  }
}