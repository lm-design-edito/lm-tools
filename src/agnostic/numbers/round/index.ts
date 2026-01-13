/**
 * Rounds a number to/down a specified number of decimal places.
 *
 * @param {number} number - The number to round.
 * @param {number} nbDecimals - Number of decimal places. Defaults to 0
 * @returns {number} The rounded number.
 */
export function round (
  number: number,
  nbDecimals: number = 0
): number {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.round(number * multiplier) / multiplier
}

/**
 * Ceils a number up to a specified number of decimal places.
 *
 * @param {number} number - The number to round up.
 * @param {number} nbDecimals - Number of decimal places. Defaults to 0
 * @returns {number} The ceiled-up number.
 */
export function ceil (
  number: number,
  nbDecimals: number = 0
): number {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.ceil(number * multiplier) / multiplier
}

/**
 * Floors a number down to a specified number of decimal places.
 *
 * @param {number} number - The number to round down.
 * @param {number} nbDecimals - Number of decimal places. Defaults to 0
 * @returns {number} The floored-down number.
 */
export function floor (
  number: number,
  nbDecimals: number = 0
): number {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.floor(number * multiplier) / multiplier
}
