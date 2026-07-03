/**
 * Computes the modulo of a number, always returning a non-negative result.
 *
 * @param nbr - The number to modulo.
 * @param modulo - The modulus.
 * @returns The non-negative remainder of `nbr` modulo `modulo`.
 */
export function absoluteModulo (nbr: number, modulo: number): number {
  return ((nbr % modulo) + modulo) % modulo
}
