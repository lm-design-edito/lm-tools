import type { Unit, UnitShort } from './types.js'

export class DataSize {
  value: number
  unit: Unit

  constructor (value: number, unit: Unit | UnitShort) {
    this.value = value
    if (unit === 'b' || unit === 'bit') { this.unit = 'bit' } else if (unit === 'B' || unit === 'byte') { this.unit = 'byte' } else if (unit === 'KB' || unit === 'kilobyte') { this.unit = 'kilobyte' } else if (unit === 'MB' || unit === 'megabyte') { this.unit = 'megabyte' } else if (unit === 'GB' || unit === 'gigabyte') { this.unit = 'gigabyte' } else if (unit === 'TB' || unit === 'terabyte') { this.unit = 'terabyte' } else if (unit === 'PB' || unit === 'petabyte') { this.unit = 'petabyte' } else if (unit === 'EB' || unit === 'exabyte') { this.unit = 'exabyte' } else if (unit === 'KiB' || unit === 'kibibyte') { this.unit = 'kibibyte' } else if (unit === 'MiB' || unit === 'mebibyte') { this.unit = 'mebibyte' } else if (unit === 'GiB' || unit === 'gibibyte') { this.unit = 'gibibyte' } else if (unit === 'TiB' || unit === 'tebibyte') { this.unit = 'tebibyte' } else if (unit === 'PiB' || unit === 'pebibyte') { this.unit = 'pebibyte' } else if (unit === 'EiB' || unit === 'exbibyte') { this.unit = 'exbibyte' } else { this.unit = 'byte' } // defaults to byte

    this.toBits = this.toBits.bind(this)
    this.toBytes = this.toBytes.bind(this)
    this.toKilobytes = this.toKilobytes.bind(this)
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
    if (this.unit === 'kilobyte') return this.value * 8 * 1e3
    if (this.unit === 'megabyte') return this.value * 8 * 1e6
    if (this.unit === 'gigabyte') return this.value * 8 * 1e9
    if (this.unit === 'terabyte') return this.value * 8 * 1e12
    if (this.unit === 'petabyte') return this.value * 8 * 1e15
    if (this.unit === 'exabyte') return this.value * 8 * 1e18
    if (this.unit === 'kibibyte') return this.value * 8 * 1024
    if (this.unit === 'mebibyte') return this.value * 8 * Math.pow(1024, 2)
    if (this.unit === 'gibibyte') return this.value * 8 * Math.pow(1024, 3)
    if (this.unit === 'tebibyte') return this.value * 8 * Math.pow(1024, 4)
    if (this.unit === 'pebibyte') return this.value * 8 * Math.pow(1024, 5)
    if (this.unit === 'exbibyte') return this.value * 8 * Math.pow(1024, 6)
    return this.value // defaults to bits
  }

  /* * * * * * * * * * * * * * * * * *
   * Decimal unit converters
   * * * * * * * * * * * * * * * * * */
  toBytes (): number { return this.toBits() / 8 }
  toB = this.toBytes.bind(this)

  toKilobytes (): number { return this.toBytes() / 1e3 }
  toKB = this.toKilobytes.bind(this)

  toMegabytes (): number { return this.toBytes() / 1e6 }
  toMB = this.toMegabytes.bind(this)

  toGigabytes (): number { return this.toBytes() / 1e9 }
  toGB = this.toGigabytes.bind(this)

  toTerabytes (): number { return this.toBytes() / 1e12 }
  toTB = this.toTerabytes.bind(this)

  toPetabytes (): number { return this.toBytes() / 1e15 }
  toPB = this.toPetabytes.bind(this)

  toExabytes (): number { return this.toBytes() / 1e18 }
  toEB = this.toExabytes.bind(this)

  /* * * * * * * * * * * * * * * * * *
   * Binary unit converters
   * * * * * * * * * * * * * * * * * */
  toKibibytes (): number { return this.toBytes() / 1024 }
  toKiB = this.toKibibytes.bind(this)

  toMebibytes (): number { return this.toBytes() / Math.pow(1024, 2) }
  toMiB = this.toMebibytes.bind(this)

  toGibibytes (): number { return this.toBytes() / Math.pow(1024, 3) }
  toGiB = this.toGibibytes.bind(this)

  toTebibytes (): number { return this.toBytes() / Math.pow(1024, 4) }
  toTiB = this.toTebibytes.bind(this)

  toPebibytes (): number { return this.toBytes() / Math.pow(1024, 5) }
  toPiB = this.toPebibytes.bind(this)

  toExbibytes (): number { return this.toBytes() / Math.pow(1024, 6) }
  toEiB = this.toExbibytes.bind(this)
}

export function bits (value: number): DataSize { return new DataSize(value, 'bit') }
export function bytes (value: number): DataSize { return new DataSize(value, 'byte') }
export function kilobytes (value: number): DataSize { return new DataSize(value, 'kilobyte') }
export function megabytes (value: number): DataSize { return new DataSize(value, 'megabyte') }
export function gigabytes (value: number): DataSize { return new DataSize(value, 'gigabyte') }
export function terabytes (value: number): DataSize { return new DataSize(value, 'terabyte') }
export function petabytes (value: number): DataSize { return new DataSize(value, 'petabyte') }
export function exabytes (value: number): DataSize { return new DataSize(value, 'exabyte') }
export function kibibytes (value: number): DataSize { return new DataSize(value, 'kibibyte') }
export function mebibytes (value: number): DataSize { return new DataSize(value, 'mebibyte') }
export function gibibytes (value: number): DataSize { return new DataSize(value, 'gibibyte') }
export function tebibytes (value: number): DataSize { return new DataSize(value, 'tebibyte') }
export function pebibytes (value: number): DataSize { return new DataSize(value, 'pebibyte') }
export function exbibytes (value: number): DataSize { return new DataSize(value, 'exbibyte') }

export const B = bytes
export const KB = kilobytes
export const MB = megabytes
export const GB = gigabytes
export const TB = terabytes
export const PB = petabytes
export const EB = exabytes
export const KiB = kibibytes
export const MiB = mebibytes
export const GiB = gibibytes
export const TiB = tebibytes
export const PiB = pebibytes
export const EiB = exbibytes

export function toBits (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toBits() }
export function toBytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toBytes() }
export function toKilobytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toKilobytes() }
export function toMegabytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toMegabytes() }
export function toGigabytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toGigabytes() }
export function toTerabytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toTerabytes() }
export function toPetabytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toPetabytes() }
export function toExabytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toExabytes() }
export function toKibibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toKibibytes() }
export function toMebibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toMebibytes() }
export function toGibibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toGibibytes() }
export function toTebibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toTebibytes() }
export function toPebibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toPebibytes() }
export function toExbibytes (value: number, unit: Unit | UnitShort): number { return new DataSize(value, unit).toExbibytes() }

export const toB = toBytes
export const toKB = toKilobytes
export const toMB = toMegabytes
export const toGB = toGigabytes
export const toTB = toTerabytes
export const toPB = toPetabytes
export const toEB = toExabytes
export const toKiB = toKibibytes
export const toMiB = toMebibytes
export const toGiB = toGibibytes
export const toTiB = toTebibytes
export const toPiB = toPebibytes
export const toEiB = toExbibytes
