export type BinaryUnit = 'kibibyte' | 'mebibyte' | 'gibibyte' | 'tebibyte' | 'pebibyte' | 'exbibyte'
export type BinaryUnitShort = 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB'
export type DecimalUnit = 'bit' | 'byte' | 'kilobyte' | 'megabyte' | 'gigabyte' | 'terabyte' | 'petabyte' | 'exabyte'
export type DecimalUnitShort = 'b' | 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB'
export type Unit = BinaryUnit | DecimalUnit
export type UnitShort = BinaryUnitShort | DecimalUnitShort

export class DataSize {
  value: number
  unit: Unit
  
  constructor (value: number, unit: Unit | UnitShort) {
    this.value = value
    if (unit === 'b' || unit === 'bit') { this.unit = 'bit' }
    else if (unit === 'B' || unit === 'byte') { this.unit = 'byte' }
    else if (unit === 'KB' || unit === 'kilobyte') { this.unit = 'kilobyte' }
    else if (unit === 'MB' || unit === 'megabyte') { this.unit = 'megabyte' }
    else if (unit === 'GB' || unit === 'gigabyte') { this.unit = 'gigabyte' }
    else if (unit === 'TB' || unit === 'terabyte') { this.unit = 'terabyte' }
    else if (unit === 'PB' || unit === 'petabyte') { this.unit = 'petabyte' }
    else if (unit === 'EB' || unit === 'exabyte') { this.unit = 'exabyte' }
    else if (unit === 'KiB' || unit === 'kibibyte') { this.unit = 'kibibyte' }
    else if (unit === 'MiB' || unit === 'mebibyte') { this.unit = 'mebibyte' }
    else if (unit === 'GiB' || unit === 'gibibyte') { this.unit = 'gibibyte' }
    else if (unit === 'TiB' || unit === 'tebibyte') { this.unit = 'tebibyte' }
    else if (unit === 'PiB' || unit === 'pebibyte') { this.unit = 'pebibyte' }
    else if (unit === 'EiB' || unit === 'exbibyte') { this.unit = 'exbibyte' }
    else { this.unit = 'byte' } // defaults to byte

    this.toBits = this.toBits.bind(this)
    this.toBytes = this.toBytes.bind(this)

    this.toKiloBytes = this.toKiloBytes.bind(this)
    this.toMegabytes = this.toMegabytes.bind(this)
    this.toGigabytes = this.toGigabytes.bind(this)
    this.toTerabytes = this.toTerabytes.bind(this)
    this.toPetabytes = this.toPetabytes.bind(this)
    this.toExabytes = this.toExabytes.bind(this)
    this.toKibibytes = this.toKibibytes.bind(this)
    this.toMebibytes = this.toMebibytes.bind(this)
    this.toGibibytes = this.toGibibytes.bind(this)
    this.toTebibytes = this.toTebibytes.bind(this)
    this.toPebibytes = this.toPebibytes.bind(this)
    this.toExbibytes = this.toExbibytes.bind(this)      
  }

  toBits (): number {
    if (this.unit === 'bit') return this.value
    if (this.unit === 'byte') return this.value * 8
    if (this.unit === 'kilobyte') return this.value * 8 * 1000
    if (this.unit === 'megabyte') return this.value * 8 * 1000 * 1000
    if (this.unit === 'gigabyte') return this.value * 8 * 1000 * 1000 * 1000
    if (this.unit === 'terabyte') return this.value * 8 * 1000 * 1000 * 1000 * 1000
    if (this.unit === 'petabyte') return this.value * 8 * 1000 * 1000 * 1000 * 1000 * 1000
    if (this.unit === 'exabyte') return this.value * 8 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000
    if (this.unit === 'kibibyte') return this.value * 8 * 1024
    if (this.unit === 'mebibyte') return this.value * 8 * 1024 * 1024
    if (this.unit === 'gibibyte') return this.value * 8 * 1024 * 1024 * 1024
    if (this.unit === 'tebibyte') return this.value * 8 * 1024 * 1024 * 1024 * 1024
    if (this.unit === 'pebibyte') return this.value * 8 * 1024 * 1024 * 1024 * 1024 * 1024
    if (this.unit === 'exbibyte') return this.value * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
    return this.value // defaults to bits
  }

  toBytes (): number {
    const bits = this.toBits()
    return bits / 8
  }
  toB = this.toBytes.bind(this)

  toKiloBytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000
  }
  toKB = this.toKiloBytes.bind(this)

  toMegabytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000 / 1000
  }
  toMB = this.toMegabytes.bind(this)

  toGigabytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000 / 1000 / 1000
  }
  toGB = this.toGigabytes.bind(this)

  toTerabytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000 / 1000 / 1000 / 1000
  }
  toTB = this.toTerabytes.bind(this)

  toPetabytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000 / 1000 / 1000 / 1000 / 1000
  }
  toPB = this.toPetabytes.bind(this)

  toExabytes (): number {
    const bytes = this.toBytes()
    return bytes / 1000 / 1000 / 1000 / 1000 / 1000 / 1000
  }
  toEB = this.toExabytes.bind(this)

  toKibibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024
  }
  toKiB = this.toKibibytes.bind(this)

  toMebibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024 / 1024
  }
  toMiB = this.toMebibytes.bind(this)

  toGibibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024 / 1024 / 1024
  }
  toGiB = this.toGibibytes.bind(this)

  toTebibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024 / 1024 / 1024 / 1024
  }
  toTiB = this.toTebibytes.bind(this)

  toPebibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024 / 1024 / 1024 / 1024 / 1024
  }
  toPiB = this.toPebibytes.bind(this)

  toExbibytes (): number {
    const bytes = this.toBytes()
    return bytes / 1024 / 1024 / 1024 / 1024 / 1024 / 1024
  }
  toEiB = this.toExbibytes.bind(this)
}

export function bits (value: number): DataSize { return new DataSize(value, 'bit') }
export function bytes (value: number): DataSize { return new DataSize(value, 'byte') }
export const B = bytes
export function kiloBytes (value: number): DataSize { return new DataSize(value, 'kilobyte') }
export const KB = kiloBytes
export function megaBytes (value: number): DataSize { return new DataSize(value, 'megabyte') }
export const MB = megaBytes
export function gigabytes (value: number): DataSize { return new DataSize(value, 'gigabyte') }
export const GB = gigabytes
export function terabytes (value: number): DataSize { return new DataSize(value, 'terabyte') }
export const TB = terabytes
export function petabytes (value: number): DataSize { return new DataSize(value, 'petabyte') }
export const PB = petabytes
export function exabytes (value: number): DataSize { return new DataSize(value, 'exabyte') }
export const EB = exabytes
export function kibibytes (value: number): DataSize { return new DataSize(value, 'kibibyte') }
export const KiB = kibibytes
export function mebibytes (value: number): DataSize { return new DataSize(value, 'mebibyte') }
export const MiB = mebibytes
export function gibibytes (value: number): DataSize { return new DataSize(value, 'gibibyte') }
export const GiB = gibibytes
export function tebibytes (value: number): DataSize { return new DataSize(value, 'tebibyte') }
export const TiB = tebibytes
export function pebibytes (value: number): DataSize { return new DataSize(value, 'pebibyte') }
export const PiB = pebibytes
export function exbibytes (value: number): DataSize { return new DataSize(value, 'exbibyte') }
export const EiB = exbibytes
