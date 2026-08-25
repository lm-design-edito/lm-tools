/**
 * The twelve 30-day months of the Republican year, in order.
 */
export enum RepublicanMonth {
  VENDEMIAIRE = 'Vendémiaire',
  BRUMAIRE = 'Brumaire',
  FRIMAIRE = 'Frimaire',
  NIVOSE = 'Nivôse',
  PLUVIOSE = 'Pluviôse',
  VENTOSE = 'Ventôse',
  GERMINAL = 'Germinal',
  FLOREAL = 'Floréal',
  PRAIRIAL = 'Prairial',
  MESSIDOR = 'Messidor',
  THERMIDOR = 'Thermidor',
  FRUCTIDOR = 'Fructidor'
}

/**
 * The complementary days ("les sansculottides"), in order. The 6th only exists
 * in sextile years.
 */
export enum ComplementaryDay {
  VERTU = 'Jour de la vertu',
  GENIE = 'Jour du génie',
  TRAVAIL = 'Jour du travail',
  OPINION = "Jour de l'opinion",
  RECOMPENSES = 'Jour des récompenses',
  REVOLUTION = 'Jour de la Révolution'
}

/**
 * The ten days of a décade, in order. Each month is three décades.
 */
export enum DecadeDay {
  PRIMIDI = 'Primidi',
  DUODI = 'Duodi',
  TRIDI = 'Tridi',
  QUARTIDI = 'Quartidi',
  QUINTIDI = 'Quintidi',
  SEXTIDI = 'Sextidi',
  SEPTIDI = 'Septidi',
  OCTIDI = 'Octidi',
  NONIDI = 'Nonidi',
  DECADI = 'Décadi'
}

/**
 * Fields shared by every Republican date, whether or not it is a complementary
 * day.
 */
type FrenchRepublicanDateCommon = {
  /** Republican year (An I = 1), counted from the 1792 equinox. */
  year: number
  /** Republican year in Roman numerals (e.g. `'VIII'`). */
  yearRoman: string
  /** 1-based day number within the month or the complementary period. */
  dayOfMonth: number
  /** 0-based day index within the Republican year (0–365). */
  dayOfYear: number
  /** Human-readable French label (e.g. `'18 Brumaire an VIII'`). */
  formatted: string
}

/**
 * A regular day, falling inside one of the twelve 30-day months.
 */
export type FrenchRepublicanMonthDate = FrenchRepublicanDateCommon & {
  isComplementary: false
  /** 0-based month index (0–11). */
  monthIndex: number
  monthName: RepublicanMonth
  /** Name of the day within its décade. */
  dayName: DecadeDay
  /** 1-based décade within the month (1–3). */
  decade: number
}

/**
 * A complementary day ("sansculottide"), falling outside any month at the end
 * of the year.
 */
export type FrenchRepublicanComplementaryDate = FrenchRepublicanDateCommon & {
  isComplementary: true
  monthIndex: null
  monthName: null
  dayName: ComplementaryDay
  decade: null
}

/**
 * A date expressed in the French Republican calendar. Discriminated on
 * `isComplementary`: month fields are populated for a regular day and `null`
 * for a complementary day.
 */
export type FrenchRepublicanDate = FrenchRepublicanMonthDate | FrenchRepublicanComplementaryDate
