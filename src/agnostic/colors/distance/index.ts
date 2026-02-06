import { type Color, type Laba, type DistanceMethod } from '../types.js'
import { toLab } from '../convert/index.js'

function distanceCiede2000 (c1: Laba, c2: Laba): number {
  const deg2rad = (deg: number): number => (Math.PI / 180) * deg
  const rad2deg = (rad: number): number => (180 / Math.PI) * rad

  // Step 1: Compute C* and mean C*
  const C1 = Math.sqrt(c1.a * c1.a + c1.b * c1.b)
  const C2 = Math.sqrt(c2.a * c2.a + c2.b * c2.b)
  const meanC = (C1 + C2) / 2

  // Step 2: Compute G
  const meanC7 = Math.pow(meanC, 7)
  const G = 0.5 * (1 - Math.sqrt(meanC7 / (meanC7 + Math.pow(25, 7))))

  // Step 3: a' values
  const a1p = (1 + G) * c1.a
  const a2p = (1 + G) * c2.a

  // Step 4: C' and h'
  const C1p = Math.sqrt(a1p * a1p + c1.b * c1.b)
  const C2p = Math.sqrt(a2p * a2p + c2.b * c2.b)
  const h1p = Math.atan2(c1.b, a1p)
  const h2p = Math.atan2(c2.b, a2p)

  // Step 5: ΔL', ΔC', ΔH'
  const dLp = c2.l - c1.l
  const dCp = C2p - C1p
  let dhp = h2p - h1p
  if (dhp > Math.PI) dhp -= 2 * Math.PI
  if (dhp < -Math.PI) dhp += 2 * Math.PI
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2)

  // Step 6: mean L', mean C', mean h'
  const meanLp = (c1.l + c2.l) / 2
  let meanHp = (h1p + h2p) / 2
  if (Math.abs(h1p - h2p) > Math.PI) { meanHp += Math.PI }

  // Step 7: T
  const T = 1
    - 0.17 * Math.cos(meanHp - deg2rad(30))
    + 0.24 * Math.cos(2 * meanHp)
    + 0.32 * Math.cos(3 * meanHp + deg2rad(6))
    - 0.20 * Math.cos(4 * meanHp - deg2rad(63))

  // Step 8: SL, SC, SH
  const SL = 1 + (0.015 * (meanLp - 50) * (meanLp - 50)) / Math.sqrt(20 + (meanLp - 50) * (meanLp - 50))
  const SC = 1 + 0.045 * meanC
  const SH = 1 + 0.015 * meanC * T

  // Step 9: RT
  const deltaTheta = deg2rad(60) * Math.exp(-((rad2deg(meanHp) - 275) / 25) * ((rad2deg(meanHp) - 275) / 25))
  const RC = Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7)))
  const RT = -2 * RC * Math.sin(deltaTheta)

  // Step 10: return ΔE00
  return Math.sqrt(
    (dLp / SL) * (dLp / SL)
      + (dCp / SC) * (dCp / SC)
      + (dHp / SH) * (dHp / SH)
      + RT * (dCp / SC) * (dHp / SH)
  )
}

// [WIP] maybe other implementations too (cie76, cie94, cmc, euclidean), but the output range can be different, so maybe should we normalize the output to 0-100?
/**
 * Calculates the perceptual distance between two colors using the specified method.
 *
 * @param {Color} c1 - The first color.
 * @param {Color} c2 - The second color.
 * @param {DistanceMethod} [method='ciede2000'] - The calculation method to use.
 * @returns {number} The perceptual distance between the colors. Lower values indicate more similar colors.
 */
export function distance (c1: Color, c2: Color, method: DistanceMethod = 'ciede2000'): number {
  switch (method) {
    case 'ciede2000': return distanceCiede2000(toLab(c1), toLab(c2))
  }
}
