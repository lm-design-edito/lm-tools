/**
 * Approximates a decimal number as a rational number using a simple iterative approach.
 *
 * Uses a naive algorithm that increments the numerator or denominator each round
 * to find the closest approximation. Stops early if an exact match is found.
 *
 * @param {number} target - The decimal number to approximate.
 * @param {number} maxRounds - The maximum number of iterations to perform.
 * @returns {[number, number]} A tuple `[numerator, denominator]` representing the rational approximation.
 */
export function approximateRationalDumb (
  target: number,
  maxRounds: number
): [number, number] {
  let numerator = 0
  let denominator = 1
  let currentRound = 0
  let foundExact = false
  const closestFound = {
    numerator,
    denominator,
    found: 0
  }
  const positiveTarget = Math.abs(target)
  while (currentRound < maxRounds && !foundExact) {
    currentRound++
    const roundResult = numerator / denominator
    if (roundResult === positiveTarget) {
      closestFound.numerator = numerator
      closestFound.denominator = denominator
      closestFound.found = roundResult
      foundExact = true
    } else {
      const roundAbsDiff = Math.abs(roundResult - positiveTarget)
      const closestAbsDiff = Math.abs(closestFound.found - positiveTarget)
      if (roundAbsDiff < closestAbsDiff) {
        closestFound.numerator = numerator
        closestFound.denominator = denominator
        closestFound.found = roundResult 
      }
      if (roundResult < positiveTarget) { numerator++ }
      else { denominator++ }
    }
  }
  if (target < 0) {
    closestFound.numerator = closestFound.numerator * -1
  }
  return [
    closestFound.numerator,
    closestFound.denominator
  ]
}

/**
 * Approximates a decimal number as a rational number (fraction) using continued fractions.
 *
 * Uses the continued fractions algorithm to find the best rational approximation
 * of a decimal number within the specified maximum denominator limit.
 *
 * @param {number} target - The decimal number to approximate.
 * @param {number} [maxDenominator=1000] - The maximum allowed denominator value.
 * @returns {[number, number]} A tuple `[numerator, denominator]` representing the rational approximation.
 */
export function approximateRational (
  target: number,
  maxDenominator: number = 1000
): [number, number] {
  const sign = target < 0 ? -1 : 1
  const absTarget = Math.abs(target)
  let h1 = 1, h2 = 0  // numerator convergents
  let k1 = 0, k2 = 1  // denominator convergents
  let b = absTarget
  do {
    const a = Math.floor(b)
    let temp = h1
    h1 = a * h1 + h2
    h2 = temp
    
    temp = k1
    k1 = a * k1 + k2
    k2 = temp
    
    if (k1 > maxDenominator) {
      k1 = k2
      h1 = h2
      break
    }
    
    b = 1 / (b - a)
  } while (Math.abs(absTarget - h1 / k1) > 1e-10 && Number.isFinite(b))
  return [sign * h1, k1]
}
