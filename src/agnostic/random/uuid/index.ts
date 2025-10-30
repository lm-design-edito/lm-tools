import { randomHexChar } from '../hex-char/index.js'

export function randomHash (length: number = 4) {
  return new Array(length)
    .fill(null)
    .map(randomHexChar)
    .join('')
}

export function randomHashPattern (pattern: number[], joiner: string = '-'): string {
  return pattern.map(randomHash).join(joiner)
}

export function randomUUID () {
  return randomHashPattern([8, 4, 4, 4, 12])
}
