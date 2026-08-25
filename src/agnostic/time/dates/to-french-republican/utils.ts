import { RepublicanMonth, ComplementaryDay, DecadeDay } from './types.js'

// Ordered lookup tables derived from the enums (declaration order).

/** The twelve month names, indexed by 0-based month index. */
export const MONTH_NAMES = Object.values(RepublicanMonth)
/** The six complementary day names, indexed by 0-based complementary index. */
export const COMPLEMENTARY_DAY_NAMES = Object.values(ComplementaryDay)
/** The ten décade day names, indexed by 0-based day-of-décade index. */
export const DECADE_DAY_NAMES = Object.values(DecadeDay)

// Paris Observatory meridian: 2°20'14" E ≈ +9m21s, expressed in days.
// The Republican astronomers used the Paris meridian to decide which civil day
// hosts the equinox, so we keep using it for every year.
const PARIS_MERIDIAN_OFFSET_DAYS = (2 + 20 / 60 + 14 / 3600) / 360

const DEG_TO_RAD = Math.PI / 180

// --- Julian Day -------------------------------------------------------------

/**
 * Julian Day Number (integer, noon-based) for a proleptic Gregorian date.
 *
 * @param year - Gregorian year.
 * @param month - Month, 1–12.
 * @param day - Day of month, 1–31.
 * @returns The Julian Day Number.
 */
export function gregorianToJdn (year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045
  )
}

// --- Astronomy: September equinox (Meeus, "Astronomical Algorithms", ch. 27) --

// Periodic-term table 27.A: rows of [A, B (deg), C (deg)].
const EQUINOX_TERMS: Array<[number, number, number]> = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186],
  [182, 27.85, 445267.112], [156, 73.14, 45036.886], [136, 171.52, 22518.443],
  [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
  [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417],
  [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029],
  [14, 199.76, 31436.921], [12, 95.39, 14577.848], [12, 287.11, 31931.756],
  [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074]
]

// Instant of the September equinox for a Gregorian year, as a Julian Ephemeris
// Day (JDE) in Dynamical Time (TD). Valid roughly for years 1000..3000.
function septemberEquinoxJde (year: number): number {
  const y = (year - 2000) / 1000
  const jde0 = 2451810.21715
    + 365242.01767 * y
    - 0.11575 * y * y
    + 0.00337 * y * y * y
    + 0.00078 * y * y * y * y

  const t = (jde0 - 2451545.0) / 36525
  const w = (35999.373 * t - 2.47) * DEG_TO_RAD
  const deltaLambda = 1 + 0.0334 * Math.cos(w) + 0.0007 * Math.cos(2 * w)

  let s = 0
  for (const [a, b, c] of EQUINOX_TERMS) {
    s += a * Math.cos((b + c * t) * DEG_TO_RAD)
  }

  return jde0 + (0.00001 * s) / deltaLambda
}

// TD - UT, in seconds. Espenak & Meeus (2006) polynomial approximations,
// covering the range that matters here (18th–22nd century) with a parabolic
// fallback outside it.
function deltaTSeconds (year: number): number {
  let t: number
  if (year >= 2005 && year < 2050) {
    t = year - 2000
    return 62.92 + 0.32217 * t + 0.005589 * t * t
  }
  if (year >= 1986 && year < 2005) {
    t = year - 2000
    return (
      63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3
      + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5
    )
  }
  if (year >= 1961 && year < 1986) {
    t = year - 1975
    return 45.45 + 1.067 * t - (t * t) / 260 - (t ** 3) / 718
  }
  if (year >= 1941 && year < 1961) {
    t = year - 1950
    return 29.07 + 0.407 * t - (t * t) / 233 + (t ** 3) / 2547
  }
  if (year >= 1920 && year < 1941) {
    t = year - 1920
    return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3
  }
  if (year >= 1900 && year < 1920) {
    t = year - 1900
    return (
      -2.79 + 1.494119 * t - 0.0598939 * t * t
      + 0.0061966 * t ** 3 - 0.000197 * t ** 4
    )
  }
  if (year >= 1860 && year < 1900) {
    t = year - 1860
    return (
      7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t ** 3
      - 0.0004473624 * t ** 4 + (t ** 5) / 233174
    )
  }
  if (year >= 1800 && year < 1860) {
    t = year - 1800
    return (
      13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t ** 3
      - 0.00037436 * t ** 4 + 0.0000121272 * t ** 5
      - 0.0000001699 * t ** 6 + 0.000000000875 * t ** 7
    )
  }
  if (year >= 1700 && year < 1800) {
    t = year - 1700
    return 8.83 + 0.1603 * t - 0.0059285 * t * t + 0.00013336 * t ** 3 - (t ** 4) / 1174000
  }
  if (year >= 2050 && year < 2150) {
    return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year)
  }
  const u = (year - 1820) / 100
  return -20 + 32 * u * u
}

/**
 * JDN of 1 Vendémiaire — the civil day (Paris meridian) hosting the September
 * equinox of the given Gregorian year.
 *
 * @param gregorianYear - The Gregorian year whose equinox opens the Republican year.
 * @returns The Julian Day Number of that year's 1 Vendémiaire.
 */
export function republicanYearStartJdn (gregorianYear: number): number {
  const jde = septemberEquinoxJde(gregorianYear) // TD
  const ut = jde - deltaTSeconds(gregorianYear) / 86400
  const parisMeanTime = ut + PARIS_MERIDIAN_OFFSET_DAYS
  return Math.floor(parisMeanTime + 0.5)
}

// --- Roman numerals (years were written in Roman numerals: "an VIII") --------

/**
 * Formats a positive integer as a Roman numeral. Non-positive inputs are
 * returned as their decimal string.
 *
 * @param n - The number to format.
 * @returns The Roman numeral (e.g. `8` -> `'VIII'`).
 */
export function toRoman (n: number): string {
  if (n <= 0) return String(n)
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]
  let remaining = n
  let result = ''
  for (const [value, symbol] of table) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}
