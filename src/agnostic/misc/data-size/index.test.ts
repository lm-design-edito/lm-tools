import { describe, it, expect } from 'vitest'
import { DataSize, bytes, kilobytes, megabytes, toBytes, toKilobytes, toMegabytes } from './index.js'

describe('DataSize', () => {
  it('creates instance with value and unit', () => {
    const size = new DataSize(100, 'byte')
    expect(size.value).toBe(100)
    expect(size.unit).toBe('byte')
  })

  it('accepts short unit forms', () => {
    expect(new DataSize(1, 'B').unit).toBe('byte')
    expect(new DataSize(1, 'KB').unit).toBe('kilobyte')
    expect(new DataSize(1, 'KiB').unit).toBe('kibibyte')
  })

  it('defaults to byte for unknown units', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const size = new DataSize(100, 'unknown' as any)
    expect(size.unit).toBe('byte')
  })
})

describe('toBits', () => {
  it('converts bytes to bits', () => {
    const size = new DataSize(1, 'byte')
    expect(size.toBits()).toBe(8)
  })

  it('converts kilobytes to bits', () => {
    const size = new DataSize(1, 'kilobyte')
    expect(size.toBits()).toBe(8000)
  })

  it('returns bits as-is', () => {
    const size = new DataSize(8, 'bit')
    expect(size.toBits()).toBe(8)
  })
})

describe('toBytes', () => {
  it('converts bits to bytes', () => {
    const size = new DataSize(8, 'bit')
    expect(size.toBytes()).toBe(1)
  })

  it('converts kilobytes to bytes', () => {
    const size = new DataSize(1, 'kilobyte')
    expect(size.toBytes()).toBe(1000)
  })

  it('converts kibibytes to bytes', () => {
    const size = new DataSize(1, 'kibibyte')
    expect(size.toBytes()).toBe(1024)
  })
})

describe('toKilobytes', () => {
  it('converts bytes to kilobytes', () => {
    const size = new DataSize(1000, 'byte')
    expect(size.toKilobytes()).toBe(1)
  })

  it('converts megabytes to kilobytes', () => {
    const size = new DataSize(1, 'megabyte')
    expect(size.toKilobytes()).toBe(1000)
  })
})

describe('toMegabytes', () => {
  it('converts bytes to megabytes', () => {
    const size = new DataSize(1000000, 'byte')
    expect(size.toMegabytes()).toBe(1)
  })
})

describe('bytes', () => {
  it('creates DataSize with byte unit', () => {
    const size = bytes(100)
    expect(size.value).toBe(100)
    expect(size.unit).toBe('byte')
  })
})

describe('kilobytes', () => {
  it('creates DataSize with kilobyte unit', () => {
    const size = kilobytes(1)
    expect(size.value).toBe(1)
    expect(size.unit).toBe('kilobyte')
  })
})

describe('megabytes', () => {
  it('creates DataSize with megabyte unit', () => {
    const size = megabytes(1)
    expect(size.value).toBe(1)
    expect(size.unit).toBe('megabyte')
  })
})

describe('toBytes', () => {
  it('converts value with unit to bytes', () => {
    expect(toBytes(8, 'bit')).toBe(1)
    expect(toBytes(1, 'kilobyte')).toBe(1000)
  })
})

describe('toKilobytes', () => {
  it('converts value with unit to kilobytes', () => {
    expect(toKilobytes(1000, 'byte')).toBe(1)
  })
})

describe('toMegabytes', () => {
  it('converts value with unit to megabytes', () => {
    expect(toMegabytes(1000000, 'byte')).toBe(1)
  })
})
