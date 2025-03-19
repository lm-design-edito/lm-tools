export namespace DataSize {
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

    toKiloBytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000
    }

    toMegabytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000 / 1000
    }

    toGigabytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000 / 1000 / 1000
    }

    toTerabytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000 / 1000 / 1000 / 1000
    }

    toPetabytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000 / 1000 / 1000 / 1000 / 1000
    }

    toExabytes (): number {
      const bytes = this.toBytes()
      return bytes / 1000 / 1000 / 1000 / 1000 / 1000 / 1000
    }

    toKibibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024
    }

    toMebibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024 / 1024
    }

    toGibibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024 / 1024 / 1024
    }

    toTebibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024 / 1024 / 1024 / 1024
    }

    toPebibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024 / 1024 / 1024 / 1024 / 1024
    }

    toExbibytes (): number {
      const bytes = this.toBytes()
      return bytes / 1024 / 1024 / 1024 / 1024 / 1024 / 1024
    }
  }

  export function toBits (value: number): DataSize { return toBytes(value, 'bit') }
  export function toBytes (value: number, unit: Unit | UnitShort): DataSize { return new DataSize(value, unit) }
  export function toKiloBytes (value: number): DataSize { return toBytes(value, 'kilobyte') }
  export function toMegaBytes (value: number): DataSize { return toBytes(value, 'megabyte') }
  export function toGigabytes (value: number): DataSize { return toBytes(value, 'gigabyte') }
  export function toTerabytes (value: number): DataSize { return toBytes(value, 'terabyte') }
  export function toPetabytes (value: number): DataSize { return toBytes(value, 'petabyte') }
  export function toExabytes (value: number): DataSize { return toBytes(value, 'exabyte') }
  export function toKibibytes (value: number): DataSize { return toBytes(value, 'kibibyte') }
  export function toMebibytes (value: number): DataSize { return toBytes(value, 'mebibyte') }
  export function toGibibytes (value: number): DataSize { return toBytes(value, 'gibibyte') }
  export function toTebibytes (value: number): DataSize { return toBytes(value, 'tebibyte') }
  export function toPebibytes (value: number): DataSize { return toBytes(value, 'pebibyte') }
  export function toExbibytes (value: number): DataSize { return toBytes(value, 'exbibyte') }
}
