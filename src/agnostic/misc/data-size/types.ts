/**
 * Binary data units (base 1024).
 *
 * - `'kibibyte'` : 1024 bytes
 * - `'mebibyte'` : 1024² bytes
 * - `'gibibyte'` : 1024³ bytes
 * - `'tebibyte'` : 1024⁴ bytes
 * - `'pebibyte'` : 1024⁵ bytes
 * - `'exbibyte'` : 1024⁶ bytes
 */
export type BinaryUnit = 'kibibyte' | 'mebibyte' | 'gibibyte' | 'tebibyte' | 'pebibyte' | 'exbibyte'
/**
 * Short forms of binary data units.
 *
 * - `'KiB'`, `'MiB'`, `'GiB'`, `'TiB'`, `'PiB'`, `'EiB'`
 */
export type BinaryUnitShort = 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB'
/**
 * Decimal data units (base 1000).
 *
 * - `'bit'`, `'byte'`, `'kilobyte'`, `'megabyte'`, `'gigabyte'`, `'terabyte'`, `'petabyte'`, `'exabyte'`
 */
export type DecimalUnit = 'bit' | 'byte' | 'kilobyte' | 'megabyte' | 'gigabyte' | 'terabyte' | 'petabyte' | 'exabyte'
/**
 * Short forms of decimal data units.
 *
 * - `'b'`, `'B'`, `'KB'`, `'MB'`, `'GB'`, `'TB'`, `'PB'`, `'EB'`
 */
export type DecimalUnitShort = 'b' | 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB'
/**
 * Any supported data unit (binary or decimal).
 */
export type Unit = BinaryUnit | DecimalUnit
/**
 * Any supported short-form data unit (binary or decimal).
 */
export type UnitShort = BinaryUnitShort | DecimalUnitShort
