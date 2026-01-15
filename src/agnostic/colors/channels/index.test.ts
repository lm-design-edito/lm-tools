import { describe, it, expect } from 'vitest'
import { getChannel, setChannel, addChannel, multChannel } from './index.js'

describe('getChannel', () => {
  it('gets RGB channels', () => {
    expect(getChannel({ r: 255, g: 128, b: 64 }, 'red')).toBe(255)
    expect(getChannel({ r: 255, g: 128, b: 64 }, 'green')).toBe(128)
    expect(getChannel({ r: 255, g: 128, b: 64 }, 'blue')).toBe(64)
  })

  it('gets HSL channels', () => {
    expect(getChannel({ h: 180, s: 50, l: 75 }, 'hue')).toBe(180)
    expect(getChannel({ h: 180, s: 50, l: 75 }, 'saturation')).toBe(50)
    expect(getChannel({ h: 180, s: 50, l: 75 }, 'lightness')).toBe(75)
  })

  it('gets alpha channel', () => {
    expect(getChannel({ r: 255, g: 128, b: 64, a: 0.5 }, 'alpha')).toBe(0.5)
    expect(getChannel({ r: 255, g: 128, b: 64 }, 'alpha')).toBe(1)
  })
})

describe('setChannel', () => {
  it('sets RGB channels', () => {
    const result = setChannel({ r: 100, g: 100, b: 100 }, 'red', 255)
    expect(result).toMatchObject({ r: 255, g: 100, b: 100 })
  })

  it('clamps RGB channels to valid range', () => {
    const result = setChannel({ r: 100, g: 100, b: 100 }, 'red', 500)
    expect(result).toMatchObject({ r: 255, g: 100, b: 100 })
  })

  it('sets HSL channels', () => {
    const result = setChannel({ h: 0, s: 50, l: 50 }, 'hue', 180)
    expect(result).toMatchObject({ h: 180, s: 50, l: 50 })
  })

  it('wraps hue channel', () => {
    const result = setChannel({ h: 0, s: 50, l: 50 }, 'hue', 450)
    expect(result).toMatchObject({ h: 90, s: 50, l: 50 })
  })
})

describe('addChannel', () => {
  it('adds to RGB channels', () => {
    const result = addChannel({ r: 100, g: 100, b: 100 }, 'red', 50)
    expect(result).toMatchObject({ r: 150, g: 100, b: 100 })
  })

  it('clamps RGB channels when adding', () => {
    const result = addChannel({ r: 200, g: 100, b: 100 }, 'red', 100)
    expect(result).toMatchObject({ r: 255, g: 100, b: 100 })
  })

  it('adds to hue channel with wrapping', () => {
    const result = addChannel({ h: 350, s: 50, l: 50 }, 'hue', 30)
    expect(result).toMatchObject({ h: 20, s: 50, l: 50 })
  })
})

describe('multChannel', () => {
  it('multiplies RGB channels', () => {
    const result = multChannel({ r: 100, g: 100, b: 100 }, 'red', 2)
    expect(result).toMatchObject({ r: 200, g: 100, b: 100 })
  })

  it('clamps RGB channels when multiplying', () => {
    const result = multChannel({ r: 200, g: 100, b: 100 }, 'red', 2)
    expect(result).toMatchObject({ r: 255, g: 100, b: 100 })
  })

  it('multiplies hue channel with wrapping', () => {
    const result = multChannel({ h: 100, s: 50, l: 50 }, 'hue', 2)
    expect(result).toMatchObject({ h: 200, s: 50, l: 50 })
  })
})
